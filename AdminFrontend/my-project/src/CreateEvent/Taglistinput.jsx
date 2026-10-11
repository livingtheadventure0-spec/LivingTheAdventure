import { useState } from "react";

/**
 * Small chip-list editor for string-array fields (highlights,
 * included/excluded services, seo_tags). Type + Enter (or the Add button)
 * appends an entry; each chip has its own remove button.
 */
export default function TagListInput({ label, values, onChange, placeholder }) {
    const [draft, setDraft] = useState("");

    const add = () => {
        const v = draft.trim();
        if (!v) return;
        onChange([...values, v]);
        setDraft("");
    };

    const removeAt = (idx) => {
        onChange(values.filter((_, i) => i !== idx));
    };

    return (
        <div>
            <label className="block text-xs font-medium tracking-wide text-[#6E6A5E] uppercase mb-2">
                {label}
            </label>

            <div className="flex gap-2 mb-2.5">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            add();
                        }
                    }}
                    placeholder={placeholder}
                    className="flex-1 bg-white border border-[#1B222C]/12 rounded-sm px-3 py-2 text-sm text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none focus:border-[#A9782F] transition-colors"
                />
                <button
                    type="button"
                    onClick={add}
                    className="px-4 text-sm font-medium text-[#1B222C] border border-[#1B222C]/15 rounded-sm hover:border-[#A9782F] hover:text-[#A9782F] transition-colors"
                >
                    Add
                </button>
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {values.map((v, i) => (
                        <span
                            key={v + i}
                            className="inline-flex items-center gap-1.5 bg-[#1B222C]/[0.05] text-[#1B222C] text-xs px-3 py-1.5 rounded-full"
                        >
                            {v}
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                className="text-[#6E6A5E] hover:text-[#9C4A3C]"
                                aria-label={`Remove ${v}`}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}