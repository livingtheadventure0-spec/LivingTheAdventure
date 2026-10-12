const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const readable = (value) => {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? Object.entries(item).map(([key, val]) => `${key}: ${val}`).join(" · ") : item).filter(Boolean).join(", ");
    if (typeof value === "object") return Object.entries(value).map(([key, val]) => `${key.replaceAll("_", " ")}: ${readable(val)}`).join(" · ");
    return String(value);
};

function parseItinerary(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "string") return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
    } catch { /* legacy text format */ }
    return value.split(/[;\n]+/).map((title, index) => ({ day: index + 1, title: title.trim(), description: "", activities: [] })).filter((day) => day.title);
}

function activitiesFor(day) {
    if (Array.isArray(day.activities) && day.activities.length) {
        return day.activities.map((item) => typeof item === "string" ? { time: "", activity: item } : { time: item.time || "", activity: item.activity || item.description || "" }).filter((item) => item.time || item.activity);
    }
    return (day.description || "").split(/\n+/).map((line) => line.replace(/^\s*[•*-]\s*/, "").trim()).filter(Boolean).map((line) => {
        const match = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?):?\s*(.+)$/i);
        return match ? { time: match[1], activity: match[2] } : { time: "", activity: line };
    });
}

export function downloadEventPdf(event, schedule = {}) {
    if (!event) return;
    const itinerary = parseItinerary(event.itinerary);
    const gallery = Array.isArray(event.gallery_image_urls) ? event.gallery_image_urls : [];
    const details = [
        ["Location", event.location],
        ["Event type", event.event_type],
        ["Category", event.adventure_activity_category],
        ["Duration", [event.duration_days ? `${event.duration_days} days` : "", event.duration_nights ? `${event.duration_nights} nights` : ""].filter(Boolean).join(" / ")],
        ["Difficulty", event.adventure_difficulty_level || event.trek_difficulty_level || event.peak_difficulty_level],
        ["Fitness requirement", event.fitness_requirement],
        ["Minimum age", event.age_requirement],
        ["Maximum participants", event.max_participants_allowed],
        ["State", event.state],
    ].filter(([, value]) => value !== null && value !== undefined && value !== "");

    const section = (title, content) => content ? `<section><h2>${escapeHtml(title)}</h2>${content}</section>` : "";
    const fieldRows = (items) => items.map(([label, value]) => `<div class="detail"><span>${escapeHtml(label)}</span><p>${escapeHtml(readable(value))}</p></div>`).join("");
    const list = (items) => Array.isArray(items) && items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(readable(item))}</li>`).join("")}</ul>` : "";
    const itineraryHtml = itinerary.map((day, index) => {
        const activities = activitiesFor(day);
        const activityHtml = activities.length ? `<ol class="activities">${activities.map((item) => `<li>${item.time ? `<strong class="time">${escapeHtml(item.time)}</strong>` : ""}<span>${escapeHtml(item.activity)}</span></li>`).join("")}</ol>` : "";
        const notes = day.activities?.length ? "" : (day.description ? "" : "");
        return `<article class="day"><h3><span>DAY ${index + 1}</span>${escapeHtml(day.title || `Day ${index + 1}`)}</h3>${activityHtml}${notes ? `<p>${escapeHtml(notes)}</p>` : ""}${day.description && Array.isArray(day.activities) && day.activities.length ? `<p class="notes"><b>Additional notes</b><br>${escapeHtml(day.description)}</p>` : ""}</article>`;
    }).join("");
    const scheduleDetails = schedule?.schedule_data || schedule || {};
    const cover = event.poster_horizontal_1_url || event.cover_image_url || event.poster_vertical_3_url;
    const images = [cover, ...gallery].filter(Boolean).slice(0, 5);
    const imageHtml = images.length ? `<div class="gallery">${images.map((url) => `<img src="${escapeHtml(url)}" alt="">`).join("")}</div>` : "";
    const inclusionHtml = [
        section("What's included", list(event.included_services)),
        section("What's not included", list(event.excluded_services)),
        section("Highlights", list(event.highlights)),
        section("Safety guidelines", event.safety_guidelines_text ? `<p>${escapeHtml(event.safety_guidelines_text)}</p>` : ""),
        section("Cancellation policy", event.cancellation_policy_text ? `<p>${escapeHtml(event.cancellation_policy_text)}</p>` : ""),
        section("Schedule details", fieldRows(Object.entries(scheduleDetails.basic_details || {}).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([key, value]) => [key.replaceAll("_", " "), value]))),
    ].join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(event.title || "Event details")}</title><style>
        @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#111;background:#fff;font:10.5pt/1.55 Arial,Helvetica,sans-serif}h1{font-size:27pt;line-height:1.12;margin:5mm 0 2mm}h2{font-size:16pt;margin:9mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #bbb}h3{font-size:12pt;margin:0 0 4mm;display:flex;gap:10px;align-items:center}p{margin:2mm 0;white-space:pre-wrap;overflow-wrap:anywhere}.eyebrow{font-size:9pt;letter-spacing:2px;text-transform:uppercase;color:#555}.sub{color:#333;font-size:11pt}.hero{width:100%;max-height:75mm;object-fit:cover;margin:5mm 0;border:1px solid #ddd}.details{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.detail{border:1px solid #ddd;padding:3mm;break-inside:avoid}.detail span{font-size:8pt;text-transform:uppercase;letter-spacing:.6px;color:#555}.detail p{font-weight:600;margin:1mm 0 0}.day{border:1px solid #ccc;border-radius:3mm;padding:5mm;margin:4mm 0;break-inside:avoid}.day h3 span{font-size:8pt;letter-spacing:1px;border:1px solid #999;padding:1.5mm 2mm}.activities{list-style:none;padding:0;margin:0}.activities li{display:grid;grid-template-columns:28mm 1fr;gap:3mm;padding:2.2mm 0;border-bottom:1px solid #eee;break-inside:avoid}.activities li:last-child{border-bottom:0}.time{font-size:9pt}.notes{margin-top:4mm;padding:3mm;border:1px solid #ddd}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:4mm 0}.gallery img{width:100%;height:42mm;object-fit:cover;border:1px solid #ddd}ul{padding-left:6mm}li{margin:1.5mm 0}.footer{margin-top:10mm;padding-top:3mm;border-top:1px solid #ddd;color:#555;font-size:8pt}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}a{color:inherit;text-decoration:none}}
    </style></head><body><p class="eyebrow">Living the Adventure · Event guide</p><h1>${escapeHtml(event.title || "Event details")}</h1><p class="sub">${escapeHtml(event.location || "")}</p>${cover ? `<img class="hero" src="${escapeHtml(cover)}" alt="">` : ""}${event.short_description ? `<p>${escapeHtml(event.short_description)}</p>` : ""}${section("Event overview", `<div class="details">${fieldRows(details)}</div>`)}${section("Trip itinerary", itineraryHtml)}${imageHtml ? section("Trip photos", imageHtml) : ""}${inclusionHtml}<p class="footer">Generated from the current event details. Confirm timings with the organiser before departure.</p><script>window.addEventListener('load',()=>{const imgs=[...document.images];Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve}))).then(()=>setTimeout(()=>window.print(),250));});</script></body></html>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        window.alert("Please allow pop-ups for this site to export the event PDF.");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
