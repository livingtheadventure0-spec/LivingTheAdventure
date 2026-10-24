from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from html import escape
import os
from urllib.parse import unquote, urlparse

from database.database import get_db
from event.model.model import Event
from upload.s3 import bucket, client, private_media_url

from event.service.service import (
    get_events,
    get_event_by_id,
    get_event_by_uuid,
    create_event,
    get_events_by_type,
    search_events,
    update_event,
    delete_event,
    serialize_event_media,
)

from event.schema.schema import EventOut, EventCreate, EventUpdate
from admin.service.service import get_current_admin
from logs.service.service import create_user_action_log

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[EventOut])
def list_events(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return [serialize_event_media(event) for event in get_events(db, skip=skip, limit=limit)]


@router.get("/search", response_model=List[EventOut])
def search_published_events(
    q: str = Query(..., min_length=1, max_length=120, description="Search event titles, SEO metadata, tags and descriptions"),
    limit: int = Query(12, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Search published events across their public-facing and SEO content."""
    return [
        serialize_event_media(event)
        for event in search_events(db, query=q, limit=limit)
    ]


@router.get("/{event_id}/poster-image", include_in_schema=False)
def event_poster_image(event_id: int, db: Session = Depends(get_db)):
    """Stream a published event's S3 poster for temporary browser sharing.

    The object key comes only from the event record (never from a caller-supplied
    URL), and only image objects in the expected media folders are served.
    """
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.status == "published",
    ).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    source_url = event.poster_horizontal_1_url or event.cover_image_url
    if not source_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event poster not found")

    parsed = urlparse(str(source_url))
    bucket_name = bucket()
    region = os.environ.get("AWS_REGION", "")
    allowed_hosts = {
        f"{bucket_name}.s3.{region}.amazonaws.com",
        f"{bucket_name}.s3.amazonaws.com",
        f"s3.{region}.amazonaws.com",
    }
    if parsed.scheme != "https" or parsed.hostname not in allowed_hosts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event poster is unavailable")

    key_path = unquote(parsed.path.lstrip("/"))
    if parsed.hostname == f"s3.{region}.amazonaws.com":
        parts = key_path.split("/", 1)
        if len(parts) != 2 or parts[0] != bucket_name:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event poster is unavailable")
        key = parts[1]
    else:
        key = key_path

    if not key or key.split("/", 1)[0] not in {"cover", "poster"}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event poster is unavailable")

    try:
        obj = client().get_object(Bucket=bucket_name, Key=key)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not retrieve event poster") from exc

    content_type = obj.get("ContentType", "")
    if not content_type.startswith("image/"):
        obj["Body"].close()
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Event poster is not an image")

    headers = {
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
    }
    if obj.get("ContentLength") is not None:
        headers["Content-Length"] = str(obj["ContentLength"])
    return StreamingResponse(obj["Body"].iter_chunks(chunk_size=64 * 1024), media_type=content_type, headers=headers)


@router.get("/share/{event_id}", response_class=HTMLResponse, include_in_schema=False)
def share_event_preview(event_id: int, db: Session = Depends(get_db)):
    """
    Server-render share metadata for social crawlers, then send human visitors
    to the normal React event page. Social crawlers do not execute the SPA.
    """
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.status == "published",
    ).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    title = (event.seo_title or event.title or "Living The Adventure").strip()
    # Prefer the readable event summary over SEO keyword lists for social previews.
    description = (event.short_description or event.seo_description or f"Discover {title} with Living The Adventure.")
    description = " ".join(description.replace(",", " ").replace("|", " ").split()).strip()
    if len(description) > 240:
        description = description[:237].rsplit(" ", 1)[0] + "..."
    # Give WhatsApp a directly fetchable image URL. A nested same-domain poster
    # endpoint can be routed to the frontend deployment instead of this API service.
    # Sign private S3 objects for a week so crawlers can fetch the image.
    source_url = event.poster_horizontal_1_url or event.cover_image_url or ""
    try:
        poster = private_media_url(source_url, expires_in=604800) if source_url else ""
    except Exception:
        # Keep sharing functional for public image URLs even if signing is unavailable.
        poster = source_url

    canonical_url = f"https://livingtheadventure.in/eventDetails/{event.id}"
    safe_title = escape(title, quote=True)
    safe_description = escape(description, quote=True)
    safe_url = escape(canonical_url, quote=True)
    safe_poster = escape(poster, quote=True)
    image_tags = ""
    if safe_poster:
        image_tags = f"""
    <meta property="og:image" content="{safe_poster}" />
    <meta property="og:image:secure_url" content="{safe_poster}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="{safe_title}" />
    <meta name="twitter:image" content="{safe_poster}" />"""

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{safe_title} | Living The Adventure</title>
  <meta name="description" content="{safe_description}" />
  <link rel="canonical" href="{safe_url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Living The Adventure" />
  <meta property="og:title" content="{safe_title}" />
  <meta property="og:description" content="{safe_description}" />
  <meta property="og:url" content="{safe_url}" />{image_tags}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{safe_title}" />
  <meta name="twitter:description" content="{safe_description}" />
  <meta http-equiv="refresh" content="0;url={safe_url}" />
</head>
<body>
  <p>Opening <a href="{safe_url}">{safe_title}</a> on Living The Adventure…</p>
  <script>window.location.replace({safe_url!r});</script>
</body>
</html>"""
    return HTMLResponse(content=html, headers={"Cache-Control": "public, max-age=300"})


@router.get("/{event_id}", response_model=EventOut)
def read_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    db_event = get_event_by_id(db, event_id)

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return serialize_event_media(db_event)


@router.get("/by-uuid/{event_uuid}", response_model=EventOut)
def read_event_by_uuid(
    event_uuid: UUID,
    db: Session = Depends(get_db),
):
    db_event = get_event_by_uuid(db, event_uuid)

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return serialize_event_media(db_event)


@router.post(
    "/",
    response_model=EventOut,
    status_code=status.HTTP_201_CREATED,
)
def create_new_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_admin),
):
    try:
        created = create_event(db, payload)

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_CREATED",
            entity="EVENT",
            entity_id=str(created.id),
            description=f"Event '{created.title}' was created successfully",
        )

        return serialize_event_media(created)

    except Exception:
        db.rollback()

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_CREATED",
            entity="EVENT",
            description="Failed to create event",
        )

        raise


@router.put("/{event_id}", response_model=EventOut)
def update_existing_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_admin),
):
    db_event = get_event_by_id(db, event_id)

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    event_title = db_event.title

    try:
        updated = update_event(db, db_event, payload)

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_UPDATED",
            entity="EVENT",
            entity_id=str(updated.id),
            description=f"Event '{updated.title}' was updated successfully",
        )

        return serialize_event_media(updated)

    except Exception:
        db.rollback()

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_UPDATED",
            entity="EVENT",
            entity_id=str(event_id),
            description=f"Failed to update event '{event_title}'",
        )

        raise


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_admin),
):
    db_event = get_event_by_id(db, event_id)

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    event_title = db_event.title

    try:
        delete_event(db, db_event)

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_DELETED",
            entity="EVENT",
            entity_id=str(event_id),
            description=f"Event '{event_title}' was deleted successfully",
        )

        return

    except Exception:
        db.rollback()

        create_user_action_log(
            db=db,
            user_id=admin_id,
            action="EVENT_DELETED",
            entity="EVENT",
            entity_id=str(event_id),
            description=f"Failed to delete event '{event_title}'",
        )

        raise


@router.get(
    "/by-type/{event_type}",
    response_model=List[EventOut],
)
def read_events_by_type(
    event_type: str,
    db: Session = Depends(get_db),
):
    events = get_events_by_type(db, event_type)

    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No events found for this type",
        )

    return [serialize_event_media(event) for event in events]
