"""Server-side helpers for S3 uploads and reads."""

import os
from urllib.parse import quote

import boto3
from botocore.config import Config


def _region() -> str:
    return os.environ["AWS_REGION"]


def _bucket_name() -> str:
    return os.environ["AWS_S3_BUCKET_NAME"]


def client():
    """Create an S3 client pinned to the bucket's regional endpoint.

    Using the regional endpoint avoids S3's 307 redirect from the global
    bucket hostname, which can break browser uploads using presigned URLs.
    """
    region = _region()
    return boto3.client(
        "s3",
        region_name=region,
        endpoint_url=f"https://s3.{region}.amazonaws.com",
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "virtual"},
        ),
    )


def bucket() -> str:
    return _bucket_name()


def public_url(key: str) -> str:
    """Return a stable public/CDN URL for an asset."""
    base_url = os.getenv("AWS_S3_PUBLIC_BASE_URL")
    if base_url:
        return f"{base_url.rstrip('/')}/{quote(key, safe='/')}"

    return (
        f"https://{_bucket_name()}.s3.{_region()}.amazonaws.com/"
        f"{quote(key, safe='/')}"
    )


def read_url(key: str, expires_in: int = 3600) -> str:
    """Generate a temporary signed URL for reading a private object."""
    return client().generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket(), "Key": key},
        ExpiresIn=expires_in,
    )


def private_media_url(value: str | None, expires_in: int = 3300) -> str | None:
    """Return a short-lived read URL for objects in this private S3 bucket.

    Non-S3 URLs are preserved. Stored database values remain canonical URLs;
    only API response values are signed.
    """
    if not value:
        return value

    from urllib.parse import unquote, urlparse

    parsed = urlparse(str(value))
    bucket_name = _bucket_name()
    region = _region()
    allowed_hosts = {
        f"{bucket_name}.s3.{region}.amazonaws.com",
        f"{bucket_name}.s3.amazonaws.com",
        f"s3.{region}.amazonaws.com",
    }

    if parsed.hostname not in allowed_hosts:
        return str(value)

    path = unquote(parsed.path.lstrip("/"))
    if parsed.hostname == f"s3.{region}.amazonaws.com":
        parts = path.split("/", 1)
        if len(parts) != 2 or parts[0] != bucket_name:
            return str(value)
        key = parts[1]
    else:
        key = path

    if not key:
        return str(value)

    return read_url(key, expires_in=expires_in)
