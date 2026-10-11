# S3 media library

Set backend-only environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME, AWS_REGION. Set AWS_S3_PUBLIC_BASE_URL to an HTTPS CDN/public origin when using public assets. Never put credentials in Vite variables.

The backend registers MediaAsset with SQLAlchemy. For existing deployments, create the media_assets table using your migration process before enabling the endpoint; startup create_all is not a replacement for versioned migrations.

Existing event/hero schemas continue storing URL strings. Uploads return both stable media id and URL; selecting existing media reuses the URL. For private S3 buckets, preview_url is a temporary signed link and url requires a public CDN/origin. Configure read access deliberately; do not make the bucket publicly writable.

Maximum upload size is 100 MB; large video uploads should later use presigned multipart direct-to-S3 uploads rather than proxying through a serverless API. SHA-256 deduplication is global across folders; reused assets retain their original folder. Historical Supabase URLs are not imported automatically.
