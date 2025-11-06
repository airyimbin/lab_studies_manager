import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const pageSize = 20;

const sortOptions = [
    { value: "recent", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "title", label: "Title A-Z" },
    { value: "status", label: "Status" },
];

const statusFilters = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
];

const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-slate-200 text-slate-700",
};

function slugify(value = "") {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function formatDate(value) {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return String(value);
    }
}

function useStudies() {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/studies");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to load studies", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, reload: fetchData };
}

function StudyAvatar({ title }) {
    const text = title
        ? title
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
        : "";
    const initials = text ? text.toUpperCase() : "ST";
    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold text-white shadow-soft">
            {initials}
        </div>
    );
}

StudyAvatar.propTypes = {
    title: PropTypes.string,
};

export default function StudiesList({ navigate }) {
    const { data, loading, reload } = useStudies();
    const [search, setSearch] = React.useState("");
    const [sort, setSort] = React.useState("recent");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [page, setPage] = React.useState(1);
    const [showNew, setShowNew] = React.useState(false);
    const [form, setForm] = React.useState({
        title: "",
        slug: "",
        status: "draft",
        description: "",
    });
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);
    const slugTouchedRef = React.useRef(false);

    const handleSelect = React.useCallback(
        (id) => {
            if (!id) return;
            if (typeof navigate === "function") {
                navigate(`/studies/${id}`);
                return;
            }
            if (typeof window !== "undefined") {
                window.location.hash = `/studies/${id}`;
            }
        },
        [navigate]
    );

    const filtered = React.useMemo(() => {
        if (!data) return [];
        const term = search.trim().toLowerCase();
        let list = data;

        if (statusFilter !== "all") {
            list = list.filter((study) => (study.status || "").toLowerCase() === statusFilter);
        }

        if (term) {
            list = list.filter((study) => {
                return (
                    (study.title && study.title.toLowerCase().includes(term)) ||
                    (study.slug && study.slug.toLowerCase().includes(term)) ||
                    (study.status && study.status.toLowerCase().includes(term))
                );
            });
        }

        const sorter = {
            recent: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
            oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
            title: (a, b) => (a.title || "").localeCompare(b.title || ""),
            status: (a, b) => (a.status || "").localeCompare(b.status || ""),
        }[sort];

        return sorter ? [...list].sort(sorter) : list;
    }, [data, search, sort, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const currentItems = filtered.slice(startIndex, startIndex + pageSize);

    React.useEffect(() => {
        setPage(1);
    }, [search, sort, statusFilter]);

    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <div className="min-h-screen w-full px-6 py-8 mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Studies</h1>
                    <p className="mt-1 text-sm text-gray-600">Explore all research studies and manage enrollment details.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <input
                        className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
                        placeholder="Search studies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {statusFilters.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            slugTouchedRef.current = false;
                            setForm({ title: "", slug: "", status: "draft", description: "" });
                            setError(null);
                            setShowNew(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-indigo-700"
                    >
                        New Study
                    </button>
                </div>
            </div>

            {loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                                <div className="h-4 w-1/2 rounded bg-gray-200" />
                            </div>
                            <div className="h-3 w-3/4 rounded bg-gray-200" />
                            <div className="h-3 w-1/2 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center p-10 mx-auto max-w-md rounded-xl bg-white border border-gray-200 shadow">
                    <p className="text-lg font-medium text-gray-700">No studies found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or sorting options.</p>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {currentItems.map((study) => {
                        const statusKey = (study.status || "").toLowerCase();
                        const statusClass = statusColors[statusKey] || "bg-slate-100 text-slate-600";
                        return (
                            <button
                                type="button"
                                key={study._id}
                                onClick={() => handleSelect(study._id)}
                                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <StudyAvatar title={study.title} />
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate text-base font-semibold text-gray-900">{study.title || "Untitled study"}</div>
                                        <div className="mt-1 text-xs text-gray-500 truncate">{study.slug || "No slug"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${statusClass}`}>
                                        {study.status || "unknown"}
                                    </span>
                                    <span className="text-gray-500">Created {formatDate(study.createdAt)}</span>
                                </div>
                                {study.description && (
                                    <p className="text-sm text-gray-600 line-clamp-3">{study.description}</p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length > pageSize && (
                <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
                        disabled={safePage === 1}
                    >
                        Previous
                    </button>
                    <span className="text-gray-600">
                        Page {safePage} of {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
                        disabled={safePage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowNew(false)} />
                    <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900">New Study</h2>
                        <p className="mt-1 text-sm text-gray-500">Define a new study to track sessions and enrollment.</p>

                        <form
                            className="mt-4 space-y-4"
                            onSubmit={async (event) => {
                                event.preventDefault();
                                setSubmitting(true);
                                setError(null);
                                try {
                                    const payload = {
                                        title: form.title || null,
                                        slug: form.slug || null,
                                        status: form.status || null,
                                        description: form.description || null,
                                    };
                                    await apiJson("/studies", "POST", payload);
                                    await reload();
                                    setShowNew(false);
                                    setForm({ title: "", slug: "", status: "draft", description: "" });
                                } catch (err) {
                                    console.error(err);
                                    setError(err.message || "Failed to create study");
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            <div>
                                <label className="block text-xs text-gray-600">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => {
                                        const nextTitle = e.target.value;
                                        setForm((prev) => {
                                            const next = { ...prev, title: nextTitle };
                                            if (!slugTouchedRef.current) {
                                                next.slug = slugify(nextTitle);
                                            }
                                            return next;
                                        });
                                    }}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Peripheral Change Detection"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs text-gray-600">Slug</label>
                                    <input
                                        value={form.slug}
                                        onChange={(e) => {
                                            slugTouchedRef.current = true;
                                            setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                                        }}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        placeholder="peripheral-change-detection"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    rows={4}
                                    placeholder="Short overview of the study goals."
                                />
                            </div>

                            {error && <div className="text-sm text-red-600">{error}</div>}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNew(false)}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving…" : "Create study"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

StudiesList.propTypes = {
    navigate: PropTypes.func,
};