"""Authenticated upload endpoints for the S3-backed media library."""

import hashlib
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from admin.service.service import get_current_admin
from database.database import get_db
from upload.model import MediaAsset
from upload.s3 import bucket, client, public_url, read_url

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Media Upload"])

ALLOWED_FOLDERS = {
    "cover",
    "poster",
    "gallery_image",
    "promo_video",
    "hero",
    "document",
}
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "application/pdf": ".pdf",
}
MAX_BYTES = 100 * 1024 * 1024
PRESIGNED_URL_TTL_SECONDS = 900


def serialize_asset(asset: MediaAsset) -> dict:
    """Convert a database media record into the API response shape."""
    return {
        "id": asset.id,
        "name": asset.name,
        "tags": asset.tags.split(",") if asset.tags else [],
        "folder": asset.folder,
        "content_type": asset.content_type,
        "size_bytes": asset.size_bytes,
        "filename": asset.s3_key,
        "url": public_url(asset.s3_key),
        "preview_url": read_url(asset.s3_key),
    }


def validate_media(folder: str, content_type: str, size_bytes: int) -> None:
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid media category.")

    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported file type.")

    if not 0 < size_bytes <= MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Files must be smaller than 100 MB.",
        )

    if folder == "promo_video" and not content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Choose an MP4 or WebM video.",
        )

    if folder == "document" and content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Documents must be PDF files.",
        )


def normalize_tags(tags: str) -> str:
    normalized = [tag.strip().lower() for tag in tags.split(",") if tag.strip()]
    if len(normalized) > 20 or any(len(tag) > 40 for tag in normalized):
        raise HTTPException(status_code=400, detail="Invalid media tags.")
    return ",".join(normalized)


@router.post("/upload/presign")
def create_upload_url(
    folder: str = Form(...),
    name: str = Form(...),
    content_type: str = Form(...),
    size_bytes: int = Form(...),
    tags: str = Form(""),
    admin_id: str = Depends(get_current_admin),
):
    """Create a short-lived URL for a browser-to-S3 PUT request."""
    validate_media(folder, content_type, size_bytes)

    display_name = name.strip()
    if not display_name or len(display_name) > 255:
        raise HTTPException(
            status_code=400,
            detail="Media name is required and must be under 256 characters.",
        )

    key = f"{folder}/{uuid.uuid4().hex}{ALLOWED_TYPES[content_type]}"

    try:
        upload_url = client().generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket(),
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=PRESIGNED_URL_TTL_SECONDS,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not prepare the S3 upload. Check AWS configuration.",
        ) from exc

    return {
        "success": True,
        "upload_url": upload_url,
        "key": key,
        "name": display_name,
        "tags": normalize_tags(tags),
        "folder": folder,
        "content_type": content_type,
        "size_bytes": size_bytes,
    }


@router.post("/upload/register")
def register_uploaded_asset(
    key: str = Form(...),
    name: str = Form(...),
    tags: str = Form(""),
    folder: str = Form(...),
    content_type: str = Form(...),
    size_bytes: int = Form(...),
    admin_id: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Verify the uploaded object and persist its metadata in PostgreSQL."""
    validate_media(folder, content_type, size_bytes)

    if not key.startswith(f"{folder}/") or "/" in key[len(folder) + 1 :]:
        raise HTTPException(status_code=400, detail="Invalid S3 object key.")

    display_name = name.strip()
    if not display_name or len(display_name) > 255:
        raise HTTPException(status_code=400, detail="Invalid media name.")

    try:
        head = client().head_object(Bucket=bucket(), Key=key)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="S3 object not found. The upload may have failed.",
        ) from exc

    if (
        int(head.get("ContentLength", 0)) != size_bytes
        or head.get("ContentType") != content_type
    ):
        client().delete_object(Bucket=bucket(), Key=key)
        raise HTTPException(
            status_code=400,
            detail="Uploaded file metadata does not match the request.",
        )

    try:
        digest = hashlib.sha256()
        response = client().get_object(Bucket=bucket(), Key=key)

        # HTTPResponse and botocore StreamingBody do not expose the same
        # chunking API. Read fixed-size chunks for compatibility and to avoid
        # loading the entire object into memory.
        with response["Body"] as body:
            while True:
                chunk = body.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)

        sha256 = digest.hexdigest()
    except Exception as exc:
        logger.exception(
            "S3 object hashing failed: bucket=%s key=%s",
            bucket(),
            key,
        )
        try:
            client().delete_object(Bucket=bucket(), Key=key)
        except Exception:
            logger.exception(
                "Failed to clean up unregistered S3 object: bucket=%s key=%s",
                bucket(),
                key,
            )
        raise HTTPException(
            status_code=502,
            detail="Could not verify the uploaded S3 object. Check backend logs.",
        ) from exc

    existing = db.query(MediaAsset).filter_by(sha256=sha256).first()
    if existing:
        client().delete_object(Bucket=bucket(), Key=key)
        return {"success": True, "reused": True, **serialize_asset(existing)}

    asset = MediaAsset(
        name=display_name,
        tags=normalize_tags(tags),
        folder=folder,
        content_type=content_type,
        sha256=sha256,
        s3_key=key,
        size_bytes=size_bytes,
    )

    try:
        db.add(asset)
        db.commit()
        db.refresh(asset)
    except Exception as exc:
        db.rollback()
        client().delete_object(Bucket=bucket(), Key=key)
        raise HTTPException(
            status_code=500,
            detail="Could not save media metadata.",
        ) from exc

    return {"success": True, "reused": False, **serialize_asset(asset)}


@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form(...),
    name: str = Form(""),
    tags: str = Form(""),
    admin_id: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Compatibility endpoint for integrations that still send multipart files."""
    if folder not in ALLOWED_FOLDERS or file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported media category or file type.",
        )

    data = await file.read(MAX_BYTES + 1)
    if not data or len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File must be non-empty and smaller than 100 MB.",
        )

    display_name = (name or Path(file.filename or "").stem).strip()
    if not display_name or len(display_name) > 255:
        raise HTTPException(status_code=400, detail="Invalid media name.")

    sha256 = hashlib.sha256(data).hexdigest()
    existing = db.query(MediaAsset).filter_by(sha256=sha256).first()
    if existing:
        return {"success": True, "reused": True, **serialize_asset(existing)}

    key = f"{folder}/{uuid.uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    try:
        client().put_object(
            Bucket=bucket(),
            Key=key,
            Body=data,
            ContentType=file.content_type,
        )
        asset = MediaAsset(
            name=display_name,
            tags=normalize_tags(tags),
            folder=folder,
            content_type=file.content_type,
            sha256=sha256,
            s3_key=key,
            size_bytes=len(data),
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
    except Exception as exc:
        db.rollback()
        try:
            client().delete_object(Bucket=bucket(), Key=key)
        except Exception:
            pass
        raise HTTPException(
            status_code=502,
            detail="Upload or media metadata save failed.",
        ) from exc

    return {"success": True, "reused": False, **serialize_asset(asset)}
