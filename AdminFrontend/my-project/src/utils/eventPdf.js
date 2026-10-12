const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const readable = (value) => Array.isArray(value) ? value.map((item) => typeof item === "object" ? Object.entries(item).map(([key, val]) => `${key}: ${val}`).join(" · ") : item).join(", ") : value && typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "");

function parseItinerary(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "string") return [];
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch { /* legacy text */ }
    return value.split(/[;\n]+/).map((title, index) => ({ day: index + 1, title: title.trim(), description: "", activities: [] })).filter((day) => day.title);
}

export function downloadEventPdf(event) {
    if (!event) return;
    const itinerary = parseItinerary(event.itinerary);
    const fields = [
        ["Location", event.location], ["Event type", event.event_type], ["Label", event.label],
        ["State", event.state], ["Status", event.status], ["Duration", `${event.duration_days ?? "—"} days / ${event.duration_nights ?? "—"} nights`],
        ["Difficulty", event.adventure_difficulty_level || event.trek_difficulty_level || event.peak_difficulty_level],
        ["Category", event.adventure_activity_category], ["Fitness requirement", event.fitness_requirement],
        ["Minimum age", event.age_requirement], ["Maximum participants", event.max_participants_allowed],
        ["Peak group type", event.peak_group_type],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");
    const section = (title, content) => content ? `<section><h2>${escapeHtml(title)}</h2>${content}</section>` : "";
    const list = (items) => Array.isArray(items) && items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(readable(item))}</li>`).join("")}</ul>` : "";
    const text = (value) => value ? `<p>${escapeHtml(readable(value))}</p>` : "";
    const fieldRows = fields.map(([label, value]) => `<div class="detail"><span>${escapeHtml(label)}</span><p>${escapeHtml(readable(value))}</p></div>`).join("");
    const days = itinerary.map((day, index) => {
        let activities = Array.isArray(day.activities) ? day.activities : [];
        if (!activities.length) activities = (day.description || "").split(/\n+/).map((line) => line.replace(/^\s*[•*-]\s*/, "").trim()).filter(Boolean).map((line) => {
            const match = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?):?\s*(.+)$/i);
            return match ? { time: match[1], activity: match[2] } : { time: "", activity: line };
        });
        return `<article class="day"><h3><span>DAY ${index + 1}</span>${escapeHtml(day.title || `Day ${index + 1}`)}</h3>${activities.length ? `<ol>${activities.map((item) => { const time = typeof item === "string" ? "" : item.time || ""; const activity = typeof item === "string" ? item : item.activity || item.description || ""; return `<li>${time ? `<b>${escapeHtml(time)}</b> — ` : ""}${escapeHtml(activity)}</li>`; }).join("")}</ol>` : ""}${day.description && Array.isArray(day.activities) && day.activities.length ? `<p class="notes"><b>Additional notes</b><br>${escapeHtml(day.description)}</p>` : ""}</article>`;
    }).join("");
    const cover = event.cover_image_url || event.poster_horizontal_1_url || event.poster_vertical_3_url;
    const images = [cover, ...(event.gallery_image_urls || [])].filter(Boolean).slice(0, 6);
    const gallery = images.length ? `<div class="gallery">${images.map((url) => `<img src="${escapeHtml(url)}" alt="">`).join("")}</div>` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(event.title || "Event details")}</title><style>
        @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#111;background:#fff;font:10.5pt/1.55 Arial,Helvetica,sans-serif}h1{font-size:26pt;line-height:1.15;margin:4mm 0}h2{font-size:16pt;margin:9mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #bbb}h3{font-size:12pt;margin:0 0 3mm;display:flex;gap:10px;align-items:center}p{margin:2mm 0;white-space:pre-wrap;overflow-wrap:anywhere}.eyebrow{font-size:9pt;letter-spacing:2px;text-transform:uppercase;color:#555}.sub{color:#333}.hero{width:100%;max-height:70mm;object-fit:cover;margin:4mm 0;border:1px solid #ddd}.details{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.detail{border:1px solid #ddd;padding:3mm;break-inside:avoid}.detail span{font-size:8pt;text-transform:uppercase;color:#555}.detail p{font-weight:600;margin:1mm 0 0}.day{border:1px solid #ccc;border-radius:3mm;padding:5mm;margin:4mm 0;break-inside:avoid}.day h3 span{font-size:8pt;letter-spacing:1px;border:1px solid #999;padding:1.5mm 2mm}ol,ul{padding-left:7mm}li{margin:1.5mm 0;overflow-wrap:anywhere}.notes{padding:3mm;border:1px solid #ddd}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:4mm 0}.gallery img{width:100%;height:40mm;object-fit:cover;border:1px solid #ddd}.footer{margin-top:10mm;padding-top:3mm;border-top:1px solid #ddd;color:#555;font-size:8pt}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><p class="eyebrow">Living the Adventure · Admin event report</p><h1>${escapeHtml(event.title || "Event details")}</h1><p class="sub">${escapeHtml(event.location || "")}</p>${cover ? `<img class="hero" src="${escapeHtml(cover)}" alt="">` : ""}${text(event.short_description)}${section("Event overview", `<div class="details">${fieldRows}</div>`)}${section("Trip itinerary", days)}${section("Highlights", list(event.highlights))}${section("Included services", list(event.included_services))}${section("Excluded services", list(event.excluded_services))}${section("Safety guidelines", text(event.safety_guidelines_text))}${section("Cancellation policy", text(event.cancellation_policy_text))}${section("SEO details", [event.seo_title && `<p><b>Title:</b> ${escapeHtml(event.seo_title)}</p>`, text(event.seo_description), list(event.seo_tags)].filter(Boolean).join(""))}${section("Gallery", gallery)}<p class="footer">Event ID: ${escapeHtml(event.event_id || event.id || "—")} · Generated from current event data.</p><script>window.addEventListener('load',()=>{Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve}))).then(()=>setTimeout(()=>window.print(),250));});</script></body></html>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { window.alert("Please allow pop-ups for this site to export the event PDF."); return; }
    printWindow.document.open(); printWindow.document.write(html); printWindow.document.close();
}
