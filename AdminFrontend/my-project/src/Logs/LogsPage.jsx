import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck } from "lucide-react";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";

const PAGE_SIZE = 50;
const inputClass = "w-full rounded-lg border border-[#E7E1D3] bg-white px-3 py-2.5 text-sm text-[#20242F] outline-none focus:border-[#B98A2E]";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Field({ label, children }) {
  return <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-[#817B70]"><span>{label}</span>{children}</label>;
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const loadLogs = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: nextPage, limit: PAGE_SIZE };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (action.trim()) params.action = action.trim();
      if (search.trim()) params.search = search.trim();
      const response = await API.get("/logs/admin", { params });
      setLogs(response.data.items || []);
      setTotal(response.data.total || 0);
      setPages(response.data.pages || 0);
      setPage(response.data.page || nextPage);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not load audit logs. Check your admin session and backend connection.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, action, search]);

  useEffect(() => { loadLogs(1); }, [startDate, endDate, action, search]);

  const resetFilters = () => { setStartDate(""); setEndDate(""); setAction(""); setSearch(""); setPage(1); };

  return (
    <div className="min-h-screen bg-[#F3EFE3] text-[#20242F]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B98A2E]">Basecamp · Security &amp; operations</p>
            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">System logs</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#817B70]">Review recorded account, profile and payment actions. Filter the audit trail by date, action, or search term.</p>
          </div>
          <button type="button" onClick={() => loadLogs(page)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E7E1D3] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button>
        </div>

        <section className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-[#E7E1D3] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="From date"><div className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-3 text-[#817B70]" /><input type="date" value={startDate} max={endDate || undefined} onChange={event => setStartDate(event.target.value)} className={inputClass + " pl-9"} /></div></Field>
          <Field label="To date"><div className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-3 text-[#817B70]" /><input type="date" value={endDate} min={startDate || undefined} onChange={event => setEndDate(event.target.value)} className={inputClass + " pl-9"} /></div></Field>
          <Field label="Action contains"><input value={action} onChange={event => setAction(event.target.value)} placeholder="e.g. PAYMENT" className={inputClass} /></Field>
          <Field label="Search logs"><div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#817B70]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Description, entity, ID…" className={inputClass + " pl-9"} /></div></Field>
          <div className="flex items-end sm:col-span-2 lg:col-span-4"><button type="button" onClick={resetFilters} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#817B70] hover:bg-[#F3EFE3]">Clear filters</button></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E7E1D3] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E1D3] px-5 py-4">
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EFE3] text-[#A9782F]"><ShieldCheck size={18} /></span><div><h2 className="text-sm font-semibold">Audit trail</h2><p className="text-xs text-[#817B70]">{total.toLocaleString("en-IN")} matching records</p></div></div>
            <span className="text-xs text-[#817B70]">Newest first · {PAGE_SIZE} records per page</span>
          </div>
          {error && <div role="alert" className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-[#F8F6F0] text-[11px] uppercase tracking-wider text-[#817B70]"><tr><th className="px-5 py-3 font-semibold">Date &amp; time</th><th className="px-5 py-3 font-semibold">Action</th><th className="px-5 py-3 font-semibold">Entity</th><th className="px-5 py-3 font-semibold">Description</th><th className="px-5 py-3 font-semibold">User ID</th></tr></thead>
              <tbody className="divide-y divide-[#EEE9DE]">
                {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-[#817B70]">Loading audit logs…</td></tr> : logs.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-[#817B70]">No logs found for these filters.</td></tr> : logs.map(log => <tr key={log.id} className="align-top hover:bg-[#FCFBF8]"><td className="whitespace-nowrap px-5 py-4 text-xs text-[#817B70]">{formatDate(log.created_at)}</td><td className="px-5 py-4"><span className="inline-flex rounded-full bg-[#F3EFE3] px-2.5 py-1 text-[11px] font-semibold text-[#7B571B]">{log.action}</span></td><td className="px-5 py-4"><div className="font-medium">{log.entity || "—"}</div>{log.entity_id && <div className="mt-1 max-w-[180px] break-all font-mono text-[10px] text-[#817B70]">{log.entity_id}</div>}</td><td className="max-w-md whitespace-normal px-5 py-4 text-[#55534D]">{log.description || "—"}</td><td className="max-w-[190px] break-all px-5 py-4 font-mono text-[10px] text-[#817B70]">{log.user_id}</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#E7E1D3] px-5 py-4"><p className="text-xs text-[#817B70]">Page {pages ? page : 0} of {pages}</p><div className="flex gap-2"><button type="button" disabled={loading || page <= 1} onClick={() => loadLogs(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E1D3] px-3 py-2 text-sm disabled:opacity-40"><ChevronLeft size={15} />Previous</button><button type="button" disabled={loading || page >= pages} onClick={() => loadLogs(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7E1D3] px-3 py-2 text-sm disabled:opacity-40">Next<ChevronRight size={15} /></button></div></div>
        </section>
        <p className="mt-4 text-xs leading-5 text-[#817B70]">Only actions recorded by the backend are shown. Older actions and code paths that do not emit audit events are not available retroactively.</p>
      </main>
    </div>
  );
}