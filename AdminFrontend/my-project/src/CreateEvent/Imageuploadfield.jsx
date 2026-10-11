import { useRef, useState } from "react";
import API from "../api";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error) {
    if (error.response?.status === 404) {
        return "The deployed backend does not have the S3 upload routes yet. Deploy the backend branch and try again.";
    }

    return (
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please try again."
    );
}

async function uploadFileToS3({ file, folder, name, tags }) {
    const request = new FormData();
    request.append("folder", folder);
    request.append("name", name);
    request.append("content_type", file.type);
    request.append("size_bytes", String(file.size));
    request.append("tags", tags);

    const { data: upload } = await API.post("/upload/presign", request);

    let s3Response;

    try {
        s3Response = await fetch(upload.upload_url, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        });
    } catch {
        throw new Error(
            "The browser could not reach S3. Check the regional upload URL and bucket CORS configuration."
        );
    }

    if (!s3Response.ok) {
        throw new Error(
            `S3 upload failed with HTTP ${s3Response.status}. Check bucket CORS and AWS permissions.`
        );
    }

    const registration = new FormData();
    registration.append("key", upload.key);
    registration.append("name", name);
    registration.append("tags", tags);
    registration.append("folder", folder);
    registration.append("content_type", file.type);
    registration.append("size_bytes", String(file.size));

    const { data: savedAsset } = await API.post(
        "/upload/register",
        registration
    );

    return savedAsset;
}

export default function ImageUploadField({
    label,
    folder,
    value,
    onChange,
    accept = "image/jpeg,image/png,image/webp,image/gif",
    kind = "image",
    helperText,
}) {
    const fileInputRef = useRef(null);

    const [name, setName] = useState("");
    const [tags, setTags] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleFileChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
            setErrorMessage("Choose a non-empty file smaller than 100 MB.");
            event.target.value = "";
            return;
        }

        if (!file.type || file.type === "application/octet-stream") {
            setErrorMessage("The selected file type is not supported.");
            event.target.value = "";
            return;
        }

        const mediaName = (
            name.trim() || file.name.replace(/\.[^.]+$/, "")
        ).trim();

        setIsUploading(true);

        try {
            const asset = await uploadFileToS3({
                file,
                folder,
                name: mediaName,
                tags,
            });

            onChange(asset.url);

            setSuccessMessage(
                asset.reused
                    ? "This file already exists. The existing asset was reused."
                    : `Uploaded ${formatFileSize(file.size)} to S3.`
            );
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    }

    function handleRemove() {
        onChange("");
        setSuccessMessage("");
        setErrorMessage("");
    }

    return (
        <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[.12em] text-[#6E6A5E]">
                {label}
            </label>

            <div className="rounded border border-[#1B222C]/15 bg-white p-3 sm:p-4">
                {value ? (
                    <div className="mb-3 overflow-hidden rounded bg-[#1B222C]/5">
                        {kind === "video" ? (
                            <video
                                src={value}
                                controls
                                className="max-h-56 w-full object-contain"
                            />
                        ) : (
                            <img
                                src={value}
                                alt={label}
                                className="max-h-56 w-full object-contain"
                            />
                        )}
                    </div>
                ) : (
                    <div className="mb-3 flex min-h-24 flex-col items-center justify-center rounded border border-dashed border-[#1B222C]/20 bg-[#F5F2E9]/50 px-3 py-5 text-center">
                        <span className="text-sm font-medium text-[#1B222C]">
                            No {kind} selected
                        </span>
                        <span className="mt-1 text-xs text-[#6E6A5E]">
                            Select a file to upload directly to S3
                        </span>
                    </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="min-w-0 rounded border border-[#1B222C]/15 px-3 py-2 text-sm outline-none focus:border-[#A9782F]"
                        placeholder="Media name (optional)"
                        aria-label="Media name"
                    />
                    <input
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                        className="min-w-0 rounded border border-[#1B222C]/15 px-3 py-2 text-sm outline-none focus:border-[#A9782F]"
                        placeholder="Tags, comma-separated"
                        aria-label="Media tags"
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label
                        className={`inline-flex cursor-pointer items-center rounded bg-[#1B222C] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#A9782F] ${isUploading ? "pointer-events-none opacity-50" : ""}`}
                    >
                        {isUploading
                            ? "Uploading…"
                            : value
                              ? "Replace file"
                              : `Upload ${kind}`}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            disabled={isUploading}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    {value && (
                        <button
                            type="button"
                            disabled={isUploading}
                            onClick={handleRemove}
                            className="rounded border border-[#1B222C]/20 px-3 py-2 text-sm text-[#1B222C] transition hover:border-[#9C4A3C] hover:text-[#9C4A3C] disabled:opacity-50"
                        >
                            Remove
                        </button>
                    )}

                    <span className="text-xs text-[#6E6A5E]">
                        Maximum 100 MB
                    </span>
                </div>

                {helperText && (
                    <p className="mt-2 text-xs text-[#6E6A5E]">
                        {helperText}
                    </p>
                )}

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-2 rounded bg-[#9C4A3C]/10 p-2 text-sm text-[#9C4A3C]"
                    >
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p
                        role="status"
                        className="mt-2 rounded bg-[#4B5842]/10 p-2 text-sm text-[#4B5842]"
                    >
                        {successMessage}
                    </p>
                )}
            </div>
        </div>
    );
}
