import { useCallback, useEffect, useRef, useState } from 'react';
import NavLink from './NavLink';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Common/Logo/logo';
import {
    FaHome,
    FaSuitcaseRolling,
    FaHiking,
    FaCampground,
    FaMountain,
    FaTree,
    FaUserCircle,
    FaSearch,
    FaTimes,
    FaArrowRight,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { apiUrl } from '../../api/config.js';

function EventSearchOverlay({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    useEffect(() => {
        const term = query.trim();
        if (!term) {
            setResults([]);
            setLoading(false);
            setError('');
            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(apiUrl(`/events/search?q=${encodeURIComponent(term)}&limit=12`), {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) throw new Error('Search is temporarily unavailable. Please try again.');
                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setResults([]);
                    setError(err.message || 'Unable to search events right now.');
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 220);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const openEvent = (event) => {
        const identifier = event.event_id || event.id;
        if (!identifier) return;
        window.location.href = `/eventDetails/${identifier}`;
    };

    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/95 text-white backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Search adventures"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,166,63,0.10),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.07),transparent_38%)]" />
            <div className="relative mx-auto min-h-full w-full max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-10">
                <div className="flex items-center justify-between">
                    <a href="/" onClick={onClose} className="flex items-center gap-3 text-sm font-semibold tracking-wide text-neutral-200">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 shadow-lg shadow-black/20"><Logo /></span>
                        <span className="leading-tight"><span className="block text-sm font-bold tracking-[0.12em] text-white">LIVING</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white">The Adventure</span></span>
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close search"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mx-auto mt-14 max-w-4xl sm:mt-20">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Find your next escape</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Where do you want to go?</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">Search destinations, treks, adventures, and experiences.</p>

                    <div className="mt-8 flex items-center gap-4 border-b border-white/20 pb-4 transition-colors focus-within:border-amber-300 sm:mt-10">
                        <FaSearch className="h-5 w-5 shrink-0 text-amber-300 sm:h-6 sm:w-6" aria-hidden="true" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Try “Kedarnath”, “weekend trek” or “camping”…"
                            aria-label="Search events"
                            className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-neutral-600 sm:text-2xl"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="rounded-full px-3 py-1.5 text-xs text-neutral-400 transition hover:bg-white/10 hover:text-white">
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="mt-7 min-h-24">
                        {!query.trim() && (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                                <span className="mr-1">Search by</span>
                                {['destination', 'activity', 'SEO tags', 'event name'].map((label) => (
                                    <span key={label} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">{label}</span>
                                ))}
                            </div>
                        )}
                        {loading && <p className="py-6 text-sm text-neutral-400">Finding experiences…</p>}
                        {error && <p role="alert" className="py-6 text-sm text-rose-300">{error}</p>}
                        {!loading && !error && query.trim() && results.length === 0 && (
                            <div className="py-8">
                                <p className="text-lg font-medium text-white">No matching adventures yet</p>
                                <p className="mt-1 text-sm text-neutral-400">Try another destination, activity, or keyword.</p>
                            </div>
                        )}
                        {results.length > 0 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {results.map((event) => (
                                    <button
                                        key={event.event_id || event.id}
                                        type="button"
                                        onClick={() => openEvent(event)}
                                        aria-label={event.title}
                                        className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-left transition duration-300 hover:-translate-y-1 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-800">
                                            {event.poster_horizontal_1_url || event.cover_image_url || event.poster_vertical_3_url ? (
                                                <img
                                                    src={event.poster_horizontal_1_url || event.cover_image_url || event.poster_vertical_3_url}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : <div className="flex h-full items-center justify-center text-neutral-600"><FaMountain className="h-6 w-6" /></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-5">
                                                <span className="block line-clamp-2 text-base font-semibold leading-6 text-white sm:text-lg">{event.title}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="mt-12 hidden text-xs text-neutral-600 sm:block">Press <kbd className="rounded border border-white/10 px-1.5 py-1 text-neutral-400">Esc</kbd> to close</p>
                </div>
            </div>
        </div>
    );
}

function NavBar() {
    const { user } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const closeSearch = useCallback(() => setSearchOpen(false), []);

    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <>
            <aside
                aria-label="Main navigation"
                className="group/sidebar fixed inset-y-0 left-0 z-40 flex w-[68px] flex-col items-center overflow-visible py-5 motion-reduce:transition-none"
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[360px] bg-gradient-to-r from-black/90 via-black/65 via-[55%] to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100 motion-reduce:transition-none"
                />

                <div className="relative mb-6 flex h-16 w-full shrink-0 items-center justify-start pl-1">
                    <div className="flex h-12 w-12 shrink-0 -translate-x-1 items-center justify-center"><Logo /></div>
                </div>

                <nav className="flex min-h-0 w-full flex-1 flex-col justify-center gap-2 px-2" aria-label="Explore">
                    <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search adventures" title="Search" className="block rounded-full text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                        <NavLink icon={<FaSearch className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Search" />
                    </button>
                    <a href="/" aria-label="Home" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaHome className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Home" />
                    </a>
                    <a href="/trips" aria-label="Tours" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaSuitcaseRolling className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Tours" />
                    </a>
                    <a href="/treks" aria-label="Treks" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaHiking className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Treks" />
                    </a>
                    <a href="/adventure-activity" aria-label="Adventure Activity" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaCampground className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Adventure Activity" />
                    </a>
                    <a href="/peak-expedition" aria-label="Peak Expedition" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaMountain className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Peak Expedition" />
                    </a>
                    <a href="/park-development-design" aria-label="Park Development and Design" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaTree className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Park Development" />
                    </a>
                </nav>

                <div className="mt-3 w-full px-2 pt-3">
                    <a href={user ? "/profile" : "/auth"} aria-label="Profile" className="block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                        <NavLink icon={<FaUserCircle className="h-5 w-5 sm:h-[21px] sm:w-[21px]" />} label="Profile" />
                    </a>
                </div>
            </aside>
            {searchOpen && <EventSearchOverlay onClose={closeSearch} />}
        </>
    );
}

export default NavBar;
