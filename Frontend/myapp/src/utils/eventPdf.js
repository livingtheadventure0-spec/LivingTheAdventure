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
    const eventLink = window.location.href.split("#")[0];
    const whatsappNumber = "919307785807";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Living the Adventure, I'm interested in ${event.title || "this event"}: ${eventLink}`)}`;
    const contactEmail = "livingtheadventure369@gmail.com";
    const businessAddress = "Benkar Nagar, Dhayari, Pune, Khadewadi, Maharashtra 411041, India";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(eventLink)}`;
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
        @page{size:A4;margin:18mm 16mm 20mm}*{box-sizing:border-box}body{margin:0;color:#111;background:#fff;font:10.5pt/1.55 Arial,Helvetica,sans-serif}.brandbar{display:flex;justify-content:space-between;align-items:center;gap:8mm;border-bottom:2px solid #111;padding:0 0 4mm;margin:0 0 8mm;break-inside:avoid}.brandmark{display:flex;align-items:center;gap:3mm}.brand-symbol{font-size:30pt;line-height:1;font-weight:700}.brandmark strong{display:block;font-size:11pt;letter-spacing:1.4px}.brandmark small{display:block;font-size:6.5pt;letter-spacing:1.1px;color:#555;margin-top:1mm}.document-label{border:1px solid #111;padding:2mm 3mm;font-size:7pt;letter-spacing:1.2px;font-weight:700}.contact-card{display:grid;grid-template-columns:1fr 38mm;gap:6mm;align-items:center;border:1px solid #aaa;padding:6mm;margin-top:10mm;break-inside:avoid}.contact-card h2{margin:1mm 0 2mm;border:0;padding:0;font-size:17pt}.contact-card p{font-size:9pt;margin:1.5mm 0}.contact-card .address{margin-top:3mm;color:#444}.contact-card a{color:#111;text-decoration:underline;overflow-wrap:anywhere}.qr-panel{text-align:center;border-left:1px solid #ddd;padding-left:5mm}.qr{width:32mm;height:32mm;object-fit:contain}.qr-panel p{font-size:6.5pt;letter-spacing:.8px;font-weight:700;margin-top:2mm}.footer{margin-top:6mm;padding-top:3mm;border-top:1px solid #aaa;color:#444;font-size:7pt;overflow-wrap:anywhere}.eyebrow{font-size:8pt;letter-spacing:1.8px;text-transform:uppercase;color:#555}h1{font-size:27pt;line-height:1.12;margin:5mm 0 2mm}h2{font-size:16pt;margin:9mm 0 3mm;padding-bottom:2mm;border-bottom:1px solid #bbb}h3{font-size:12pt;margin:0 0 4mm;display:flex;gap:10px;align-items:center}p{margin:2mm 0;white-space:pre-wrap;overflow-wrap:anywhere}.eyebrow{font-size:9pt;letter-spacing:2px;text-transform:uppercase;color:#555}.sub{color:#333;font-size:11pt}.hero{width:100%;max-height:75mm;object-fit:cover;margin:5mm 0;border:1px solid #ddd}.details{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.detail{border:1px solid #ddd;padding:3mm;break-inside:avoid}.detail span{font-size:8pt;text-transform:uppercase;letter-spacing:.6px;color:#555}.detail p{font-weight:600;margin:1mm 0 0}.day{border:1px solid #ccc;border-radius:3mm;padding:5mm;margin:4mm 0;break-inside:avoid}.day h3 span{font-size:8pt;letter-spacing:1px;border:1px solid #999;padding:1.5mm 2mm}.activities{list-style:none;padding:0;margin:0}.activities li{display:grid;grid-template-columns:28mm 1fr;gap:3mm;padding:2.2mm 0;border-bottom:1px solid #eee;break-inside:avoid}.activities li:last-child{border-bottom:0}.time{font-size:9pt}.notes{margin-top:4mm;padding:3mm;border:1px solid #ddd}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:4mm 0}.gallery img{width:100%;height:42mm;object-fit:cover;border:1px solid #ddd}ul{padding-left:6mm}li{margin:1.5mm 0}.footer{margin-top:10mm;padding-top:3mm;border-top:1px solid #ddd;color:#555;font-size:8pt}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}a{color:inherit;text-decoration:none}}
    </style></head><body><header class="brandbar"><div class="brandmark"><span class="brand-symbol">∞</span><div><strong>LIVING THE ADVENTURE</strong><small>ADVENTURE • TRAVEL • EXPERIENCES</small></div></div><span class="document-label">OFFICIAL EVENT GUIDE</span></header><p class="eyebrow">DISCOVER SOMETHING EXTRAORDINARY</p><h1>${escapeHtml(event.title || "Event details")}</h1><p class="sub">${escapeHtml(event.location || "")}</p>${cover ? `<img class="hero" src="${escapeHtml(cover)}" alt="">` : ""}${event.short_description ? `<p>${escapeHtml(event.short_description)}</p>` : ""}${section("Event overview", `<div class="details">${fieldRows(details)}</div>`)}${section("Trip itinerary", itineraryHtml)}${imageHtml ? section("Trip photos", imageHtml) : ""}${inclusionHtml}<section class="contact-card"><div class="contact-copy"><p class="eyebrow">LET'S PLAN YOUR NEXT ADVENTURE</p><h2>Ready to join us?</h2><p>Contact our team for bookings, availability and any questions about this experience.</p><p><b>WhatsApp</b> · <a href="${whatsappUrl}">+91 93077 85807</a></p><p><b>Email</b> · <a href="mailto:${contactEmail}">${contactEmail}</a></p><p><b>Website</b> · <a href="${eventLink}">${escapeHtml(eventLink)}</a></p><p class="address"><b>Address</b><br>${escapeHtml(businessAddress)}</p></div><div class="qr-panel"><img class="qr" src="${qrUrl}" alt="QR code linking to this event"><p>SCAN TO VIEW EVENT</p></div></section><p class="footer">LIVING THE ADVENTURE · ${escapeHtml(businessAddress)} · ${escapeHtml(contactEmail)} · +91 93077 85807</p><script>window.addEventListener('load',()=>{const imgs=[...document.images];Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve}))).then(()=>setTimeout(()=>window.print(),250));});</script></body></html>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        window.alert("Please allow pop-ups for this site to export the event PDF.");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
