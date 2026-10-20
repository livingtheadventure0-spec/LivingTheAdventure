import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Download, CalendarDays, ExternalLink, MapPin, Users, CreditCard, ChevronDown } from "lucide-react";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";

const C = {
  cream: "#F3EFE3", card: "#FFFFFF", navy: "#1B2436", ink: "#20242F",
  gold: "#B98A2E", border: "#E7E1D3", muted: "#817B70", green: "#28633B",
  greenBg: "#E1EADB", amber: "#8A5A11", amberBg: "#F3E7CE",
  red: "#B3432F", redBg: "#F6DEDA", blue: "#33445F", blueBg: "#DEE3EC",
};
const bookingStatuses = ["All statuses", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
const paymentStatuses = ["All payments", "PENDING", "SUCCESS", "FAILED", "REFUNDED"];

function money(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}
function dateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function dateOnly(value) {
  if (!value) return "Date not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function statusTone(status, payment = false) {
  const value = String(status || "").toUpperCase();
  if (value === "SUCCESS" || value === "CONFIRMED" || value === "COMPLETED") return { color: C.green, background: C.greenBg };
  if (value === "PENDING") return { color: C.amber, background: C.amberBg };
  if (value === "FAILED" || value === "CANCELLED") return { color: C.red, background: C.redBg };
  if (value === "REFUNDED") return { color: C.blue, background: C.blueBg };
  return { color: C.muted, background: "#F0EEE9" };
}
function StatusPill({ value }) {
  const tone = statusTone(value);
  return <span style={{ display: "inline-flex", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 700, letterSpacing: .35, color: tone.color, background: tone.background, whiteSpace: "nowrap" }}>{value || "UNKNOWN"}</span>;
}
function FilterSelect({ value, onChange, options }) {
  return <div style={{ position: "relative" }}><select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: "none", width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "11px 34px 11px 12px", color: C.ink, fontSize: 13 }} >{options.map(x => <option key={x} value={x}>{x}</option>)}</select><ChevronDown size={14} style={{ position: "absolute", right: 11, top: 12, pointerEvents: "none", color: C.muted }} /></div>;
}
function Detail({ label, value, mono = false }) {
  return <div style={{ minWidth: 0 }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: .8, color: C.muted, marginBottom: 5 }}>{label}</div><div title={value == null ? "" : String(value)} style={{ fontSize: 12, color: C.ink, overflowWrap: "anywhere", fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : "inherit" }}>{value || "—"}</div></div>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [paymentFilter, setPaymentFilter] = useState("All payments");
  const [eventDate, setEventDate] = useState("");
  const [sort, setSort] = useState("Event date: newest first");
  const [expandedEvents, setExpandedEvents] = useState(() => new Set());
  const [expandedBookings, setExpandedBookings] = useState(() => new Set());

  const loadBookings = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: nextPage, limit };
      if (statusFilter !== "All statuses") params.booking_status = statusFilter;
      if (paymentFilter !== "All payments") params.payment_status = paymentFilter;
      if (eventDate) params.event_date = eventDate;
      const response = await API.get("/payments/get-all-bookings", { params });
      setBookings(response.data.bookings || []);
      setTotal(response.data.total || 0);
      setPage(response.data.page || nextPage);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Couldn't load bookings. Please try again.");
      setBookings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [limit, statusFilter, paymentFilter, eventDate]);

  useEffect(() => { loadBookings(1); }, [loadBookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = bookings.filter(b => !q || [
      b.booking_id, b.user_id, b.user_name, b.user_phone, b.user_email,
      b.event_id, b.event_title, b.schedule_id, b.razorpay_order_id, b.razorpay_payment_id,
      b.pickup_point, b.pickup_city,
    ].some(v => String(v || "").toLowerCase().includes(q)));
    return rows.sort((a, b) => {
      if (sort === "Event date: oldest first") return new Date(a.event_start_datetime || 0) - new Date(b.event_start_datetime || 0);
      if (sort === "Booking date: newest first") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sort === "Amount: high to low") return Number(b.final_amount || 0) - Number(a.final_amount || 0);
      if (sort === "Amount: low to high") return Number(a.final_amount || 0) - Number(b.final_amount || 0);
      return new Date(b.event_start_datetime || 0) - new Date(a.event_start_datetime || 0);
    });
  }, [bookings, search, sort]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const b of filtered) {
      const key = b.event_id || b.event_title || "unknown";
      if (!map.has(key)) map.set(key, { key, event: b, bookings: [] });
      map.get(key).bookings.push(b);
    }
    return [...map.values()].sort((a, b) => {
      const liveA = ["in progress", "launched now!", "live"].includes(String(a.event.event_state || "").toLowerCase()) ? 1 : 0;
      const liveB = ["in progress", "launched now!", "live"].includes(String(b.event.event_state || "").toLowerCase()) ? 1 : 0;
      if (liveA !== liveB) return liveB - liveA;
      return new Date(b.event.event_start_datetime || 0) - new Date(a.event.event_start_datetime || 0);
    });
  }, [filtered]);

  const stats = useMemo(() => ({
    bookings: total,
    paid: bookings.filter(b => String(b.payment_status).toUpperCase() === "SUCCESS").length,
    revenue: bookings.filter(b => String(b.payment_status).toUpperCase() === "SUCCESS").reduce((sum, b) => sum + Number(b.amount_paid ?? b.final_amount ?? 0), 0),
    discounts: bookings.reduce((sum, b) => sum + Number(b.discount_amount || 0), 0),
  }), [bookings, total]);

  const exportCSV = (rows = filtered, filename = "event-bookings.csv") => {
    if (!rows.length) return;
    const headers = ["Event", "Event date", "Booking ID", "User name", "User ID", "Phone", "Email", "People", "Price per person", "Subtotal", "Discount label", "Discount amount", "Final amount", "Amount paid", "Currency", "Booking status", "Payment status", "Payment method", "Razorpay order ID", "Razorpay payment ID", "Booked at"];
    const values = rows.map(b => [b.event_title, b.event_start_datetime, b.booking_id, b.user_name, b.user_id, b.user_phone, b.user_email, b.number_of_people, b.price_per_person, b.subtotal, b.discount_label, b.discount_amount, b.final_amount, b.amount_paid, b.currency, b.booking_status, b.payment_status, b.payment_method, b.razorpay_order_id, b.razorpay_payment_id, b.created_at]);
    const csv = [headers, ...values].map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const userSite = "https://livingtheadventure.in";

  return <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: C.ink }}><Navbar /><main style={{ padding: "clamp(18px, 3vw, 42px)", maxWidth: 1600, margin: "0 auto" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap'); .booking-link:hover{opacity:.78;text-decoration:underline} .booking-input:focus,.booking-select:focus{outline:2px solid #B98A2E;outline-offset:1px} @media(max-width:700px){.booking-stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}.booking-filters{grid-template-columns:1fr!important}.booking-card-grid{grid-template-columns:1fr!important}} `}</style>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 26 }}>
      <div><div style={{ fontSize: 11, letterSpacing: 2.5, color: C.gold, fontWeight: 800, marginBottom: 7 }}>BASECAMP · OPERATIONS</div><h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,42px)", margin: 0, fontWeight: 600 }}>Event bookings</h1><p style={{ color: C.muted, margin: "8px 0 0", fontSize: 13 }}>Bookings grouped by event, with customer, discount and Razorpay details.</p></div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button onClick={() => loadBookings(page)} disabled={loading} style={buttonStyle("light")}><RefreshCw size={15}/> Refresh</button>
        <button onClick={exportCSV} disabled={!filtered.length} style={buttonStyle("dark")}><Download size={15}/> Export CSV</button>
      </div>
    </div>

    {error && <div style={{ padding: 14, marginBottom: 18, background: C.redBg, border: "1px solid #E8B8B0", borderRadius: 9, color: C.red, fontSize: 13 }}>{error}</div>}

    <div className="booking-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
      {[["Total bookings", stats.bookings],["Successful payments", stats.paid],["Paid amount on this page", money(stats.revenue)],["Discounts on this page", money(stats.discounts)]].map(([label,value],i)=><div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9 }}>{label}</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.4vw,29px)", fontWeight: 600, color: i===2?C.gold:C.ink }}>{value}</div></div>)}
    </div>

    <div className="booking-filters" style={{ display: "grid", gridTemplateColumns: "minmax(220px,2fr) repeat(4,minmax(145px,1fr))", gap: 10, marginBottom: 18, alignItems: "center" }}>
      <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 12, top: 13, color: C.muted }}/><input className="booking-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search event, name, phone, IDs…" style={inputStyle({paddingLeft:36})}/></div>
      <div style={{ position: "relative" }}><CalendarDays size={15} style={{ position: "absolute", left: 11, top: 12, color: C.muted, pointerEvents: "none" }}/><input className="booking-input" aria-label="Filter by event date" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} style={inputStyle({paddingLeft:34})}/></div>
      <FilterSelect value={statusFilter} onChange={setStatusFilter} options={bookingStatuses}/>
      <FilterSelect value={paymentFilter} onChange={setPaymentFilter} options={paymentStatuses}/>
      <FilterSelect value={sort} onChange={setSort} options={["Event date: newest first","Event date: oldest first","Booking date: newest first","Amount: high to low","Amount: low to high"]}/>
    </div>
    {groups.length > 0 && <section style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14}}><div><h2 style={{margin:0,fontSize:16,color:C.navy}}>Collection by event</h2><p style={{margin:"4px 0 0",fontSize:12,color:C.muted}}>Successful payment totals for the events currently shown.</p></div><span style={{fontSize:12,color:C.muted}}>{groups.length} events</span></div>
      <div style={{display:"grid",gap:12}}>{groups.slice(0,6).map(g=>{const paid=g.bookings.filter(b=>String(b.payment_status).toUpperCase()==="SUCCESS").reduce((n,b)=>n+Number(b.amount_paid??b.final_amount??0),0);const max=Math.max(1,...groups.map(x=>x.bookings.filter(b=>String(b.payment_status).toUpperCase()==="SUCCESS").reduce((n,b)=>n+Number(b.amount_paid??b.final_amount??0),0)));return <div key={g.key} style={{display:"grid",gridTemplateColumns:"minmax(130px,1fr) minmax(100px,3fr) auto",alignItems:"center",gap:12}}><span style={{fontSize:12,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.event.event_title||"Untitled event"}</span><div style={{height:9,background:"#F0EEE9",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,paid/max*100)}%`,background:C.gold,borderRadius:99}}/></div><strong style={{fontSize:12,whiteSpace:"nowrap"}}>{money(paid)}</strong></div>})}</div>
    </section>}
    {eventDate && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, fontSize: 13, color: C.muted }}>Showing events scheduled for <strong style={{color:C.ink}}>{dateOnly(eventDate)}</strong><button onClick={()=>setEventDate("")} style={{border:0,background:"transparent",color:C.gold,cursor:"pointer",fontWeight:700}}>Clear date</button></div>}

    {loading ? <div style={{ padding: 45, textAlign: "center", color: C.muted, background: C.card, borderRadius: 12 }}>Loading bookings…</div> : groups.length === 0 ? <div style={{ padding: 50, textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}><CalendarDays size={28} color={C.muted}/><h3 style={{margin:"12px 0 5px"}}>No bookings found</h3><p style={{margin:0,color:C.muted,fontSize:13}}>Try another date or clear one of the filters.</p></div> : <div style={{display:"grid",gap:16}}>
      {groups.map(group => {
        const event = group.event;
        const isLive = ["in progress","launched now!","live"].includes(String(event.event_state||"").toLowerCase());
        const eventPaid = group.bookings.filter(b=>String(b.payment_status).toUpperCase()==="SUCCESS").reduce((sum,b)=>sum+Number(b.amount_paid??b.final_amount??0),0);
        const eventDiscount = group.bookings.reduce((sum,b)=>sum+Number(b.discount_amount||0),0);
        return <section key={group.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 3px 12px rgba(27,36,54,.025)"}}>
          <div style={{padding:"18px 20px",background:"#FBF9F3",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"start",gap:18,flexWrap:"wrap"}}>
            <div style={{minWidth:220,flex:"1 1 300px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:7}}><span style={{fontSize:10,letterSpacing:1.1,textTransform:"uppercase",color:C.muted,fontWeight:800}}>Event</span>{isLive&&<span style={{fontSize:10,letterSpacing:.5,fontWeight:800,color:C.green,background:C.greenBg,borderRadius:999,padding:"4px 8px"}}>LIVE EVENT · PRIORITY</span>}</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:23,fontWeight:600,margin:"0 0 7px",color:C.navy}}>{event.event_title||"Untitled event"}</h2>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:12,color:C.muted}}><span><CalendarDays size={13} style={{verticalAlign:-2,marginRight:5}}/> {dateOnly(event.event_start_datetime)}</span>{event.event_location&&<span><MapPin size={13} style={{verticalAlign:-2,marginRight:5}}/> {event.event_location}</span>}<span><Users size={13} style={{verticalAlign:-2,marginRight:5}}/> {group.bookings.length} booking{group.bookings.length===1?"":"s"}</span></div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>exportCSV(group.bookings, `${String(event.event_title||"event").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}-bookings.csv`)} style={linkStyle}><Download size={13}/> Export event CSV</button>
              <button onClick={()=>setExpandedEvents(prev=>{const next=new Set(prev);next.has(group.key)?next.delete(group.key):next.add(group.key);return next})} style={linkStyle}><ChevronDown size={13}/>{expandedEvents.has(group.key)?"Hide bookings":"View bookings"}</button>
              <a className="booking-link" href={`${window.location.origin}/admin/events/${event.event_internal_id}`} target="_blank" rel="noreferrer" style={linkStyle}>Go to event admin <ExternalLink size={13}/></a>
              <a className="booking-link" href={`${userSite}/eventDetails/${event.event_id}`} target="_blank" rel="noreferrer" style={linkStyle}>Go to user event <ExternalLink size={13}/></a>
            </div>
          </div>
          <div style={{display:"flex",gap:22,flexWrap:"wrap",padding:"13px 20px",borderBottom:`1px solid ${C.border}`,fontSize:12}}><span style={{color:C.muted}}>Paid amount <strong style={{color:C.green,marginLeft:6}}>{money(eventPaid)}</strong></span><span style={{color:C.muted}}>Discounts <strong style={{color:C.ink,marginLeft:6}}>{money(eventDiscount)}</strong></span><span style={{color:C.muted}}>Event ID <code style={{color:C.ink,marginLeft:6}}>{event.event_id||"—"}</code></span></div>
          {expandedEvents.has(group.key) && <div style={{display:"grid",gap:0}}>
            {group.bookings.map((b,index)=><article key={b.booking_id} style={{borderBottom:index===group.bookings.length-1?"none":`1px solid ${C.border}`}}>
              <button
                type="button"
                aria-expanded={expandedBookings.has(b.booking_id)}
                onClick={() => setExpandedBookings(previous => {
                  const next = new Set(previous);
                  if (next.has(b.booking_id)) next.delete(b.booking_id);
                  else next.add(b.booking_id);
                  return next;
                })}
                style={{display:"grid",gridTemplateColumns:"minmax(170px,1.5fr) minmax(140px,1fr) minmax(160px,1.4fr) auto auto",alignItems:"center",gap:14,width:"100%",padding:"16px 20px",border:0,background:expandedBookings.has(b.booking_id)?"#FBF9F3":"#FFFFFF",textAlign:"left",cursor:"pointer",color:C.ink}}
              >
                <span style={{minWidth:0}}>
                  <span style={{display:"block",fontSize:13,fontWeight:700,color:C.navy,overflowWrap:"anywhere"}}>{b.user_name || "Customer name unavailable"}</span>
                  <span style={{display:"block",fontSize:12,color:C.muted,marginTop:4}}>{b.user_phone || "No phone number"}</span>
                </span>
                <span style={{minWidth:0}}>
                  <span style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:.7,color:C.muted,marginBottom:4}}>Booking ID</span>
                  <code style={{fontSize:11,overflowWrap:"anywhere",color:C.navy}}>{b.booking_id}</code>
                </span>
                <span>
                  <span style={{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:.7,color:C.muted,marginBottom:4}}>Booking amount</span>
                  <strong style={{fontSize:13,color:C.ink}}>{money(b.final_amount,b.currency)}</strong>
                </span>
                <span style={{display:"flex",gap:5,flexWrap:"wrap"}}><StatusPill value={b.booking_status}/><StatusPill value={b.payment_status}/></span>
                <ChevronDown size={16} style={{color:C.muted,transform:expandedBookings.has(b.booking_id)?"rotate(180deg)":"rotate(0deg)",transition:"transform .15s"}}/>
              </button>
              {expandedBookings.has(b.booking_id) && <>
              <div style={{padding:"0 20px 14px",fontSize:11,color:C.muted}}>Booked {dateTime(b.created_at)}</div>
              <div className="booking-card-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:"17px 22px",padding:"0 20px 20px"}}>
                <Detail label="Customer name" value={b.user_name}/>
                <Detail label="Phone number" value={b.user_phone}/>
                <Detail label="Email" value={b.user_email}/>
                <Detail label="User ID" value={b.user_id} mono/>
                <Detail label="Participants" value={b.number_of_people}/>
                <Detail label="Price per person" value={money(b.price_per_person,b.currency)}/>
                <Detail label="Subtotal" value={money(b.subtotal,b.currency)}/>
                <Detail label="Discount" value={b.discount_label ? `${b.discount_label} · ${money(b.discount_amount,b.currency)}` : money(b.discount_amount,b.currency)}/>
                <Detail label="Discount rule" value={[b.discount_type,b.discount_scope,b.discount_value!=null?b.discount_value:null].filter(v=>v!==null&&v!=="").join(" · ")}/>
                <Detail label="Final amount" value={money(b.final_amount,b.currency)}/>
                <Detail label="Amount paid" value={money(b.amount_paid,b.currency)}/>
                <Detail label="Paid at" value={dateTime(b.paid_at)}/>
                <Detail label="Pickup" value={[b.pickup_point,b.pickup_city].filter(Boolean).join(", ")}/>
                <Detail label="Pickup time" value={dateTime(b.pickup_datetime)}/>
                <Detail label="Payment method" value={b.payment_method}/>
                <Detail label="Schedule ID" value={b.schedule_id} mono/>
                <Detail label="Razorpay order ID" value={b.razorpay_order_id} mono/>
                <Detail label="Razorpay payment ID" value={b.razorpay_payment_id} mono/>
              </div>
              </>}
            </article>)}
          </div>}
        </section>;
      })}
    </div>}

    {!loading && total > limit && <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginTop:18,fontSize:13,color:C.muted}}><span>Page {page} of {totalPages} · {total} matching bookings</span><div style={{display:"flex",gap:8}}><button style={buttonStyle("light")} disabled={page<=1} onClick={()=>loadBookings(page-1)}>Previous</button><button style={buttonStyle("light")} disabled={page>=totalPages} onClick={()=>loadBookings(page+1)}>Next</button></div></div>}
    {!loading && total <= limit && <div style={{marginTop:16,fontSize:12,color:C.muted}}>{filtered.length} booking records shown{search ? " after search" : ""}.</div>}
    </main></div>;
}

function buttonStyle(kind) {
  return { display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,border:kind==="dark"?"none":`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",background:kind==="dark"?C.navy:C.card,color:kind==="dark"?"#fff":C.ink,fontSize:12,fontWeight:700,cursor:"pointer",opacity:1 };
}
function inputStyle(extra={}) {
  return {boxSizing:"border-box",width:"100%",minWidth:0,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 12px",background:C.card,color:C.ink,fontSize:12,...extra};
}
const linkStyle = {display:"inline-flex",alignItems:"center",gap:7,padding:"9px 11px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.navy,textDecoration:"none",fontSize:11,fontWeight:700,whiteSpace:"nowrap"};
