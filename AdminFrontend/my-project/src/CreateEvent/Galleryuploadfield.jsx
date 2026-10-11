import { useState } from "react";
import API from "../api";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

async function uploadGalleryImage(file, folder) {
    const name = file.name.replace(/\.[^.]+$/, "");
    const request = new FormData();

    request.append("folder", folder);
    request.append("name", name);
    request.append("content_type", file.type);
    request.append("size_bytes", String(file.size));
    request.append("tags", "gallery");

    const { data: upload } = await API.post("/upload/presign", request);

    let response;
    try {
        response = await fetch(upload.upload_url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });
    } catch {
        throw new Error(
            "The browser could not reach S3. Check the regional URL and bucket CORS."
        );
    }

    if (!response.ok) {
        throw new Error(`S3 upload failed with HTTP ${response.status}.`);
    }

    const registration = new FormData();
    registration.append("key", upload.key);
    registration.append("name", name);
    registration.append("tags", "gallery");
    registration.append("folder", folder);
    registration.append("content_type", file.type);
    registration.append("size_bytes", String(file.size));

    const { data: asset } = await API.post(
        "/upload/register",
        registration
    );

    return asset;
}

function getUploadError(error) {
    if (error.response?.status === 404) {
        return "The deployed backend does not have the new upload routes yet.";
    }

    return (
        error.response?.data?.detail ||
        error.message ||
        "Upload failed. Please try again."
    );
}

export default function GalleryUploadField({
    label,
    folder,
    values = [],
    onChange,
    helperText,
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleFilesChange(event) {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) {
            return;
        }

        setIsUploading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const uploadedUrls = [];
        const failures = [];

        for (const file of files) {
            try {
                if (
                    file.size === 0 ||
                    file.size > MAX_FILE_SIZE_BYTES
                ) {
                    throw new Error(
                        "Choose a non-empty image smaller than 100 MB."
                    );
                }

                if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
                    throw new Error(
                        "Supported formats are JPG, PNG, WebP, and GIF."
                    );
                }

                const asset = await uploadGalleryImage(file, folder);
                uploadedUrls.push(asset.url);
            } catch (error) {
                failures.push(`${file.name}: ${getUploadError(error)}`);
            }
        }

        if (uploadedUrls.length > 0) {
            onChange([...new Set([...values, ...uploadedUrls])]);
            setSuccessMessage(
                `${uploadedUrls.length} image(s) uploaded successfully.`
            );
        }

        if (failures.length > 0) {
            setErrorMessage(failures.join(" "));
        }

        setIsUploading(false);
        event.target.value = "";
    }

    function removeImage(indexToRemove) {
        onChange(values.filter((_, index) => index !== indexToRemove));
    }

    return (
        <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[.12em] text-[#6E6A5E]">
                {label}
            </label>

            <div className="rounded border border-[#1B222C]/15 bg-white p-3 sm:p-4">
                <div className="flex flex-wrap gap-3">
                    {values.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            className="group relative h-24 w-24 overflow-hidden rounded border border-[#1B222C]/10"
                        >
                            <img
                                src={url}
                                alt={`Gallery image ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                aria-label={`Remove gallery image ${index + 1}`}
                                className="absolute right-1 top-1 rounded bg-[#1B222C]/85 px-2 py-1 text-xs text-white transition hover:bg-[#9C4A3C]"
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <label
                        className={`flex h-24 w-32 flex-col items-center justify-center rounded border border-dashed border-[#1B222C]/25 bg-[#F5F2E9]/50 text-center transition hover:border-[#A9782F] ${isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
                    >
                        <span className="text-sm font-semibold text-[#1B222C]">
                            {isUploading ? "Uploading…" : "+ Add images"}
                        </span>
                        <span className="mt-1 text-[11px] text-[#6E6A5E]">
                            Select multiple files
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            disabled={isUploading}
                            onChange={handleFilesChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {helperText && (
                    <p className="mt-3 text-xs text-[#6E6A5E]">
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

                <p className="mt-2 text-xs text-[#6E6A5E]">
                    Images upload directly to S3 · Maximum 100 MB per file
                </p>
            </div>
        </div>
    );
}
