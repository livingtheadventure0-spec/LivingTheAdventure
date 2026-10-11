import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar/NavBar";

const EASE = [0.16, 1, 0.3, 1];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getAuthHeaders() {
    const token = localStorage.getItem("admin_token");
    return token ? { token } : {};
}

function fmtDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            dateStyle: "medium",
        });
    } catch {
        return iso;
    }
}

function fullName(user) {
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return name || "—";
}

function initialOf(user) {
    const name = fullName(user);
    return name === "—" ? "?" : name.charAt(0).toUpperCase();
}

/* ---------- Icons ---------- */

function DotsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="12" cy="19" r="1.4" />
        </svg>
    );
}
function BlockIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="m5.5 5.5 13 13" />
        </svg>
    );
}
function TrashIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        </svg>
    );
}
function ViewIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/* ---------- Row action menu ---------- */

function RowMenu({ user, onView, onBlock, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-sm text-[#6E6A5E] hover:text-[#1B222C] hover:bg-[#1B222C]/5 transition-colors"
                aria-label="More actions"
            >
                <DotsIcon />
            </button>

            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 rounded-sm bg-white border border-[#1B222C]/10 shadow-xl overflow-hidden z-20"
                >
                    <button
                        onClick={() => {
                            setOpen(false);
                            onView(user);
                        }}
                        className="w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm text-[#1B222C] hover:bg-[#1B222C]/5 transition-colors"
                    >
                        <ViewIcon /> View details
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            onBlock(user);
                        }}
                        className="w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm text-[#A9782F] hover:bg-[#A9782F]/5 transition-colors"
                    >
                        <BlockIcon /> {user.is_active ? "Block user" : "Unblock user"}
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            onDelete(user);
                        }}
                        className="w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm text-[#9C4A3C] hover:bg-[#9C4A3C]/5 transition-colors"
                    >
                        <TrashIcon /> Delete user
                    </button>
                </motion.div>
            )}
        </div>
    );
}

/* ---------- Page ---------- */

export default function UsersListPage() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await API.get("/auth/users", {
                    headers: getAuthHeaders(),
                    params: { page, limit: pageSize },
                });
                if (!cancelled) {
                    setUsers(res.data?.users || []);
                    setTotal(res.data?.total ?? 0);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Couldn't load users. Try refreshing the page."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [page, pageSize]);

    // Client-side filter within the current page (search doesn't hit the API)
    const filtered = users.filter((u) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const hay = `${fullName(u)} ${u.phone || ""} ${u.email || ""}`.toLowerCase();
        return hay.includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const resetFilters = () => setSearch("");

    /* ---- Stubbed action handlers — wire up real logic here later ---- */
    const handleView = (user) => {
        console.log("View user", user.user_id);
        // TODO: navigate(`/admin/customers/${user.user_id}`)
    };
    const handleBlock = (user) => {
        console.log(user.is_active ? "Block user" : "Unblock user", user.user_id);
        // TODO: call PATCH /auth/users/:id/status then refresh list
    };
    const handleDelete = (user) => {
        console.log("Delete user", user.user_id);
        // TODO: confirm dialog + DELETE /auth/users/:id then refresh list
    };

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.3em] text-[#4B5842] uppercase mb-1">
                            Basecamp
                        </p>
                        <h1 className="text-3xl font-serif text-[#1B222C]">Users</h1>
                    </div>
                    <p className="text-sm text-[#6E6A5E]">{total} total</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="relative flex-1 min-w-[220px]">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A5E]/60"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or phone (current page)"
                            className="w-full bg-white border border-[#1B222C]/12 rounded-sm pl-9 pr-3 py-2.5 text-sm text-[#1B222C] placeholder:text-[#6E6A5E]/50 outline-none focus:border-[#A9782F] transition-colors"
                        />
                    </div>

                    {search && (
                        <button onClick={resetFilters} className="text-sm text-[#9C4A3C] hover:underline">
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-sm border border-[#1B222C]/8 ">
                    <div className=" overflow-y-visible">
                        <table className="min-w-full table-fixed text-sm">
                            <thead>
                                <tr className="border-b border-[#1B222C]/8 text-left">
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E] w-[30%]">Name</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Phone</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Email</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Status</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Verified</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E]">Joined</th>
                                    <th className="px-5 py-3 font-medium text-[#6E6A5E] w-20"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading &&
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b border-[#1B222C]/6 last:border-0">
                                            <td className="px-5 py-4" colSpan={7}>
                                                <div className="h-10 bg-[#1B222C]/5 rounded-sm animate-pulse" />
                                            </td>
                                        </tr>
                                    ))}

                                {!loading && error && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-[#9C4A3C]">
                                            {error}
                                        </td>
                                    </tr>
                                )}

                                {!loading && !error && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-[#6E6A5E]">
                                            No users match this search.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    !error &&
                                    filtered.map((user, i) => (
                                        <motion.tr
                                            key={user.user_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.25, ease: EASE, delay: i * 0.02 }}
                                            className="border-b border-[#1B222C]/6 last:border-0 hover:bg-[#A9782F]/[0.04] transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-9 w-9 rounded-full bg-[#1B222C]/[0.06] text-[#1B222C]/70 flex items-center justify-center text-sm font-medium shrink-0">
                                                        {initialOf(user)}
                                                    </span>
                                                    <p className="text-[#1B222C] font-medium truncate">
                                                        {fullName(user)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                {user.phone || "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                {user.email || (
                                                    <span className="text-[#6E6A5E]/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active
                                                        ? "bg-[#4B5842]/10 text-[#4B5842] border border-[#4B5842]/25"
                                                        : "bg-[#9C4A3C]/[0.08] text-[#9C4A3C] border border-[#9C4A3C]/20"
                                                        }`}
                                                >
                                                    {user.is_active ? "Active" : "Blocked"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${user.is_verified
                                                        ? "bg-[#1B222C]/[0.06] text-[#1B222C]/75"
                                                        : "bg-[#A9782F]/10 text-[#A9782F] border border-[#A9782F]/25"
                                                        }`}
                                                >
                                                    {user.is_verified ? "Verified" : "Unverified"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[#1B222C]/80">
                                                {fmtDate(user.created_at)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right w-20">
                                                <RowMenu
                                                    user={user}
                                                    onView={handleView}
                                                    onBlock={handleBlock}
                                                    onDelete={handleDelete}
                                                />
                                            </td>
                                        </motion.tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (server-side) */}
                {!loading && !error && total > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                        <p className="text-sm text-[#6E6A5E]">
                            Showing {(page - 1) * pageSize + 1}–
                            {Math.min(page * pageSize, total)} of {total}
                        </p>

                        <div className="flex items-center gap-3">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-white border border-[#1B222C]/12 rounded-sm px-2.5 py-1.5 text-sm text-[#1B222C] outline-none focus:border-[#A9782F]"
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n} / page
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-[#1B222C]/12 text-[#1B222C] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A9782F] transition-colors"
                                    aria-label="Previous page"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>
                                </button>
                                <span className="px-3 text-sm text-[#1B222C]">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-8 w-8 flex items-center justify-center rounded-sm border border-[#1B222C]/12 text-[#1B222C] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#A9782F] transition-colors"
                                    aria-label="Next page"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}