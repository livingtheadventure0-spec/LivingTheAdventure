import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    Download,
    ChevronDown,
    Calendar,
} from "lucide-react";
import API from "../api";

// --------------------------------------------------
// API
// --------------------------------------------------

const API_BASE_URL = "http://127.0.0.1:8000";

function getAuthHeaders() {
    const token = localStorage.getItem("admin_token");

    return token
        ? {
            accept: "application/json",
            token,
        }
        : {
            accept: "application/json",
        };
}


// --------------------------------------------------
// Palette
// --------------------------------------------------

const COLORS = {
    cream: "#F3EFE3",
    card: "#FFFFFF",
    navy: "#1B2436",
    navyText: "#20242F",
    gold: "#B98A2E",
    goldSoft: "#C9A15A",
    border: "#E7E1D3",
    muted: "#8A8578",
};


// --------------------------------------------------
// Status styles
// --------------------------------------------------

const BOOKING_STATUS_STYLES = {
    PENDING: {
        bg: "#F3E7CE",
        text: "#8A5A11",
    },
    CONFIRMED: {
        bg: "#E1EADB",
        text: "#3E6B3F",
    },
    CANCELLED: {
        bg: "#F6DEDA",
        text: "#B3432F",
    },
    COMPLETED: {
        bg: "#DEE3EC",
        text: "#33445F",
    },
};

const PAYMENT_STATUS_STYLES = {
    PENDING: {
        bg: "#F3E7CE",
        text: "#8A5A11",
    },
    SUCCESS: {
        bg: "#E1EADB",
        text: "#3E6B3F",
    },
    FAILED: {
        bg: "#F6DEDA",
        text: "#B3432F",
    },
    REFUNDED: {
        bg: "#DEE3EC",
        text: "#33445F",
    },
};


const STATUS_OPTIONS = [
    "All statuses",
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
];

const PAYMENT_OPTIONS = [
    "All payments",
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
];

const SORT_OPTIONS = [
    "Newest first",
    "Oldest first",
    "Amount: high to low",
    "Amount: low to high",
];


// --------------------------------------------------
// Components
// --------------------------------------------------

function Pill({ text, styles }) {
    return (
        <span
            style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                background: styles.bg,
                color: styles.text,
                whiteSpace: "nowrap",
            }}
        >
            {text
                ? text.charAt(0) + text.slice(1).toLowerCase()
                : "Unknown"}
        </span>
    );
}


function StatCard({ label, value, accent }) {
    return (
        <div
            style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "20px 24px",
                flex: 1,
                minWidth: 180,
            }}
        >
            <div
                style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: accent || COLORS.navyText,
                    fontFamily: "'Playfair Display', serif",
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: 12,
                    letterSpacing: 0.6,
                    color: COLORS.muted,
                    marginTop: 4,
                    textTransform: "uppercase",
                }}
            >
                {label}
            </div>
        </div>
    );
}


function Dropdown({ value, onChange, options }) {
    return (
        <div style={{ position: "relative" }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    appearance: "none",
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: "10px 36px 10px 14px",
                    fontSize: 14,
                    color: COLORS.navyText,
                    cursor: "pointer",
                    outline: "none",
                }}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={15}
                style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: COLORS.muted,
                }}
            />
        </div>
    );
}


function SkeletonRow() {
    return (
        <tr>
            {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} style={{ padding: "16px 20px" }}>
                    <div
                        style={{
                            height: 14,
                            background: "#ECE7DA",
                            borderRadius: 4,
                            width: i === 0 ? "70%" : "50%",
                        }}
                    />
                </td>
            ))}
        </tr>
    );
}


// --------------------------------------------------
// Page
// --------------------------------------------------

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [paymentFilter, setPaymentFilter] =
        useState("All payments");

    const [sort, setSort] = useState("Newest first");


    // --------------------------------------------------
    // Load bookings
    // --------------------------------------------------

    const loadBookings = useCallback(
        async (requestedPage = page) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();

                params.set("page", requestedPage);
                params.set("limit", limit);

                if (statusFilter !== "All statuses") {
                    params.set(
                        "booking_status",
                        statusFilter
                    );
                }

                if (paymentFilter !== "All payments") {
                    params.set(
                        "payment_status",
                        paymentFilter
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/payments/get-all-bookings?${params.toString()}`,
                    {
                        method: "GET",
                        headers: getAuthHeaders(),
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    throw new Error(
                        "Your admin session has expired or you are not authorized."
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        `Failed to load bookings (${response.status})`
                    );
                }

                const data = await response.json();

                setBookings(data.bookings || []);
                setTotal(data.total || 0);
                setPage(data.page || requestedPage);
            } catch (err) {
                console.error("Failed to load bookings:", err);

                setError(
                    err.message ||
                    "Couldn't load bookings. Please try again."
                );

                setBookings([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [
            page,
            limit,
            statusFilter,
            paymentFilter,
        ]
    );


    // --------------------------------------------------
    // Initial load + filters
    // --------------------------------------------------

    useEffect(() => {
        loadBookings(1);
    }, [statusFilter, paymentFilter]);


    // --------------------------------------------------
    // Search + sorting
    // --------------------------------------------------

    const filtered = useMemo(() => {
        let rows = [...bookings];

        if (search.trim()) {
            const q = search.trim().toLowerCase();

            rows = rows.filter(
                (b) =>
                    b.booking_id
                        ?.toLowerCase()
                        .includes(q) ||
                    b.user_id
                        ?.toLowerCase()
                        .includes(q) ||
                    b.event_id
                        ?.toLowerCase()
                        .includes(q)
            );
        }

        rows.sort((a, b) => {
            if (sort === "Newest first") {
                return (
                    new Date(b.created_at) -
                    new Date(a.created_at)
                );
            }

            if (sort === "Oldest first") {
                return (
                    new Date(a.created_at) -
                    new Date(b.created_at)
                );
            }

            if (sort === "Amount: high to low") {
                return (
                    (b.final_amount || 0) -
                    (a.final_amount || 0)
                );
            }

            if (sort === "Amount: low to high") {
                return (
                    (a.final_amount || 0) -
                    (b.final_amount || 0)
                );
            }

            return 0;
        });

        return rows;
    }, [
        bookings,
        search,
        sort,
    ]);


    // --------------------------------------------------
    // Stats
    // --------------------------------------------------

    const totals = useMemo(() => {
        const confirmed = bookings.filter(
            (b) => b.booking_status === "CONFIRMED"
        ).length;

        const pending = bookings.filter(
            (b) => b.booking_status === "PENDING"
        ).length;

        const revenue = bookings
            .filter(
                (b) => b.payment_status === "SUCCESS"
            )
            .reduce(
                (sum, b) =>
                    sum + (b.final_amount || 0),
                0
            );

        return {
            total,
            confirmed,
            pending,
            revenue,
        };
    }, [bookings, total]);


    // --------------------------------------------------
    // Formatting
    // --------------------------------------------------

    const currencyFmt = (
        n,
        currency = "INR"
    ) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(n || 0);


    const dateFmt = (iso) => {
        if (!iso) return "—";

        const d = new Date(iso);

        return (
            d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }) +
            ", " +
            d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };


    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------

    const totalPages = Math.ceil(total / limit);

    const goToPage = (newPage) => {
        if (
            newPage < 1 ||
            newPage > totalPages ||
            loading
        ) {
            return;
        }

        setPage(newPage);
        loadBookings(newPage);
    };


    // --------------------------------------------------
    // Export
    // --------------------------------------------------

    const exportCSV = () => {
        if (!filtered.length) return;

        const headers = [
            "Booking ID",
            "User ID",
            "Event ID",
            "People",
            "Amount",
            "Currency",
            "Booking Status",
            "Payment Status",
            "Created At",
        ];

        const rows = filtered.map((b) => [
            b.booking_id,
            b.user_id,
            b.event_id,
            b.number_of_people,
            b.final_amount,
            b.currency,
            b.booking_status,
            b.payment_status,
            b.created_at,
        ]);

        const csv = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value ?? "").replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = "bookings.csv";

        link.click();

        URL.revokeObjectURL(url);
    };


    return (
        <div
            style={{
                background: COLORS.cream,
                minHeight: "100vh",
                padding: "40px 48px",
                fontFamily:
                    "'Inter', system-ui, sans-serif",
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                tbody tr:hover {
                    background: #FAF7EF;
                }

                select:focus {
                    border-color: ${COLORS.gold};
                }

                input:focus {
                    border-color: ${COLORS.gold};
                    outline: none;
                }
            `}</style>


            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 32,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 2,
                            color: COLORS.gold,
                            fontWeight: 600,
                            marginBottom: 6,
                        }}
                    >
                        BASECAMP
                    </div>

                    <h1
                        style={{
                            fontFamily:
                                "'Playfair Display', serif",
                            fontSize: 36,
                            fontWeight: 600,
                            color: COLORS.navyText,
                            margin: 0,
                        }}
                    >
                        Bookings
                    </h1>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                    }}
                >
                    <button
                        onClick={() =>
                            loadBookings(page)
                        }
                        disabled={loading}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: COLORS.card,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 8,
                            padding: "10px 16px",
                            fontSize: 14,
                            color: COLORS.navyText,
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            opacity: loading
                                ? 0.6
                                : 1,
                        }}
                    >
                        <RefreshCw
                            size={15}
                            style={{
                                transform: loading
                                    ? "rotate(180deg)"
                                    : "none",
                            }}
                        />

                        Refresh
                    </button>

                    <button
                        onClick={exportCSV}
                        disabled={!filtered.length}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: COLORS.navy,
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 18px",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#fff",
                            cursor:
                                filtered.length
                                    ? "pointer"
                                    : "not-allowed",
                            opacity:
                                filtered.length
                                    ? 1
                                    : 0.5,
                        }}
                    >
                        <Download size={15} />
                        Export CSV
                    </button>
                </div>
            </div>


            {/* Error */}

            {error && (
                <div
                    style={{
                        marginBottom: 20,
                        padding: "12px 16px",
                        background: "#F6DEDA",
                        border:
                            "1px solid #E8B8B0",
                        borderRadius: 8,
                        color: "#B3432F",
                        fontSize: 14,
                    }}
                >
                    {error}
                </div>
            )}


            {/* Stats */}

            <div
                style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 28,
                    flexWrap: "wrap",
                }}
            >
                <StatCard
                    label="Total bookings"
                    value={totals.total}
                />

                <StatCard
                    label="Confirmed"
                    value={totals.confirmed}
                    accent="#3E6B3F"
                />

                <StatCard
                    label="Pending"
                    value={totals.pending}
                    accent="#8A5A11"
                />

                <StatCard
                    label="Revenue collected"
                    value={currencyFmt(
                        totals.revenue
                    )}
                    accent={COLORS.gold}
                />
            </div>


            {/* Filters */}

            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 20,
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        flex: "1 1 260px",
                    }}
                >
                    <Search
                        size={16}
                        style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform:
                                "translateY(-50%)",
                            color: COLORS.muted,
                        }}
                    />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by booking, user or event ID"
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding:
                                "10px 14px 10px 38px",
                            borderRadius: 8,
                            border: `1px solid ${COLORS.border}`,
                            background:
                                COLORS.card,
                            fontSize: 14,
                            color:
                                COLORS.navyText,
                        }}
                    />
                </div>

                <Dropdown
                    value={statusFilter}
                    onChange={(value) => {
                        setStatusFilter(value);
                        setPage(1);
                    }}
                    options={STATUS_OPTIONS}
                />

                <Dropdown
                    value={paymentFilter}
                    onChange={(value) => {
                        setPaymentFilter(value);
                        setPage(1);
                    }}
                    options={PAYMENT_OPTIONS}
                />

                <Dropdown
                    value={sort}
                    onChange={setSort}
                    options={SORT_OPTIONS}
                />
            </div>


            {/* Table */}

            <div
                style={{
                    background: COLORS.card,
                    border:
                        `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        overflowX: "auto",
                    }}
                >
                    <table>
                        <thead>
                            <tr
                                style={{
                                    borderBottom:
                                        `1px solid ${COLORS.border}`,
                                }}
                            >
                                {[
                                    "Booking ID",
                                    "Guest / User",
                                    "People",
                                    "Amount",
                                    "Booking status",
                                    "Payment status",
                                    "Created",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            textAlign:
                                                "left",
                                            padding:
                                                "14px 20px",
                                            fontSize: 12,
                                            letterSpacing:
                                                0.5,
                                            textTransform:
                                                "uppercase",
                                            color:
                                                COLORS.muted,
                                            fontWeight:
                                                600,
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading &&
                                Array.from({
                                    length: 5,
                                }).map((_, i) => (
                                    <SkeletonRow
                                        key={i}
                                    />
                                ))}


                            {!loading &&
                                filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                padding:
                                                    "40px 20px",
                                                textAlign:
                                                    "center",
                                                color:
                                                    COLORS.muted,
                                                fontSize: 14,
                                            }}
                                        >
                                            No bookings
                                            found.
                                        </td>
                                    </tr>
                                )}


                            {!loading &&
                                filtered.map((b) => (
                                    <tr
                                        key={
                                            b.booking_id
                                        }
                                        style={{
                                            borderBottom:
                                                `1px solid ${COLORS.border}`,
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                                fontSize: 13,
                                                color:
                                                    COLORS.navyText,
                                                fontFamily:
                                                    "monospace",
                                            }}
                                        >
                                            {b.booking_id?.slice(
                                                0,
                                                8
                                            )}
                                            …
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                                fontSize: 13,
                                                color:
                                                    COLORS.navyText,
                                                fontFamily:
                                                    "monospace",
                                            }}
                                        >
                                            {b.user_id?.slice(
                                                0,
                                                8
                                            )}
                                            …
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                                fontSize: 14,
                                                color:
                                                    COLORS.navyText,
                                            }}
                                        >
                                            {
                                                b.number_of_people
                                            }
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                                fontSize: 14,
                                                color:
                                                    COLORS.navyText,
                                                fontWeight:
                                                    500,
                                            }}
                                        >
                                            {currencyFmt(
                                                b.final_amount,
                                                b.currency
                                            )}
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                            }}
                                        >
                                            <Pill
                                                text={
                                                    b.booking_status
                                                }
                                                styles={
                                                    BOOKING_STATUS_STYLES[
                                                    b.booking_status
                                                    ] ||
                                                    BOOKING_STATUS_STYLES.PENDING
                                                }
                                            />
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                            }}
                                        >
                                            <Pill
                                                text={
                                                    b.payment_status
                                                }
                                                styles={
                                                    PAYMENT_STATUS_STYLES[
                                                    b.payment_status
                                                    ] ||
                                                    PAYMENT_STATUS_STYLES.PENDING
                                                }
                                            />
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "16px 20px",
                                                fontSize: 13,
                                                color:
                                                    COLORS.muted,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            <Calendar
                                                size={13}
                                                style={{
                                                    verticalAlign:
                                                        -2,
                                                    marginRight:
                                                        6,
                                                }}
                                            />

                                            {dateFmt(
                                                b.created_at
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Pagination */}

            {!loading &&
                totalPages > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                color:
                                    COLORS.muted,
                            }}
                        >
                            Page {page} of{" "}
                            {totalPages}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                            }}
                        >
                            <button
                                onClick={() =>
                                    goToPage(
                                        page - 1
                                    )
                                }
                                disabled={page <= 1}
                                style={{
                                    padding:
                                        "8px 14px",
                                    borderRadius: 7,
                                    border:
                                        `1px solid ${COLORS.border}`,
                                    background:
                                        COLORS.card,
                                    cursor:
                                        page <= 1
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        page <= 1
                                            ? 0.5
                                            : 1,
                                }}
                            >
                                Previous
                            </button>

                            <button
                                onClick={() =>
                                    goToPage(
                                        page + 1
                                    )
                                }
                                disabled={
                                    page >=
                                    totalPages
                                }
                                style={{
                                    padding:
                                        "8px 14px",
                                    borderRadius: 7,
                                    border:
                                        `1px solid ${COLORS.border}`,
                                    background:
                                        COLORS.card,
                                    cursor:
                                        page >=
                                            totalPages
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        page >=
                                            totalPages
                                            ? 0.5
                                            : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}