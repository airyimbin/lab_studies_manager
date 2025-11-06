import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  try {
    return Number(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}

function formatDayLabel(dateLike) {
  if (!dateLike) return "";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function formatTimeLabel(dateLike) {
  if (!dateLike) return "";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function startOfCurrentWeek() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  return start;
}

export default function Dashboard({ navigate }) {
  const [participants, setParticipants] = React.useState(null);
  const [sessions, setSessions] = React.useState(null);
  const [studies, setStudies] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [actionError, setActionError] = React.useState(null);
  const [savingSessions, setSavingSessions] = React.useState({});

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [participantsResponse, sessionsResponse, studiesResponse] = await Promise.all([
          fetch("/api/participants"),
          fetch("/api/sessions"),
          fetch("/api/studies"),
        ]);

        if (!participantsResponse.ok || !sessionsResponse.ok || !studiesResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [participantsData, sessionsData, studiesData] = await Promise.all([
          participantsResponse.json(),
          sessionsResponse.json(),
          studiesResponse.json(),
        ]);

        if (!active) return;
        setParticipants(participantsData);
        setSessions(sessionsData);
        setStudies(studiesData);
      } catch (err) {
        if (!active) return;
        console.error("Dashboard load failed", err);
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const participantById = React.useMemo(() => {
    const map = new Map();
    (participants || []).forEach((p) => {
      map.set(p._id, p);
    });
    return map;
  }, [participants]);

  const studyById = React.useMemo(() => {
    const map = new Map();
    (studies || []).forEach((s) => {
      map.set(s._id, s);
    });
    return map;
  }, [studies]);

  const stats = React.useMemo(() => {
    if (!participants || !sessions) {
      return {
        participantCount: 0,
        activeToday: 0,
        sessionsThisWeek: 0,
        completionRate: null,
      };
    }

    const now = new Date();
    const todayKey = now.toDateString();
    const startWeek = startOfCurrentWeek();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const sessionsThisWeek = sessions.filter((session) => {
      if (!session.startedAt) return false;
      const started = new Date(session.startedAt);
      return !Number.isNaN(started.getTime()) && started >= startWeek && started <= now;
    }).length;

    const activeTodayParticipants = new Set();
    sessions.forEach((session) => {
      if (!session.startedAt) return;
      const started = new Date(session.startedAt);
      if (Number.isNaN(started.getTime())) return;
      if (started.toDateString() !== todayKey) return;
      const participant = participantById.get(session.participantId);
      const participantName = participant?.name || participant?.externalId || session.participantId || session._id;
      activeTodayParticipants.add(participantName);
    });

    const recentSessions = sessions.filter((session) => {
      if (!session.startedAt) return false;
      const started = new Date(session.startedAt);
      return !Number.isNaN(started.getTime()) && started >= sevenDaysAgo && started <= now;
    });

    const completedRecent = recentSessions.filter((session) => Boolean(session.endedAt)).length;
    const completionRate = recentSessions.length
      ? (completedRecent / recentSessions.length) * 100
      : null;

    return {
      participantCount: participants.length,
      activeToday: activeTodayParticipants.size,
      sessionsThisWeek,
      completionRate,
    };
  }, [participants, sessions]);

  const upcomingSessions = React.useMemo(() => {
    if (!sessions) return [];
    const now = new Date();
    return sessions
      .filter((session) => {
        if (!session.startedAt) return false;
        const started = new Date(session.startedAt);
        return !Number.isNaN(started.getTime()) && started >= now;
      })
      .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))
      .slice(0, 6);
  }, [sessions]);

  const todaySessions = React.useMemo(() => {
    if (!sessions) return [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return sessions
      .filter((session) => {
        if (!session.startedAt) return false;
        const started = new Date(session.startedAt);
        return !Number.isNaN(started.getTime()) && started >= start && started <= end;
      })
      .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  }, [sessions]);

  const handleMarkDone = React.useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      setActionError(null);
      setSavingSessions((prev) => ({ ...prev, [sessionId]: true }));
      const endedAt = new Date().toISOString();
      try {
        const updated = await apiJson(`/sessions/${sessionId}`, "PUT", { endedAt });
        setSessions((prev) => {
          if (!prev) return prev;
          return prev.map((session) =>
            session._id === sessionId ? { ...session, ...updated } : session
          );
        });
      } catch (err) {
        console.error("Failed to update session", err);
        setActionError(err.message || "Could not mark session complete");
      } finally {
        setSavingSessions((prev) => {
          const next = { ...prev };
          delete next[sessionId];
          return next;
        });
      }
    },
    [setSessions]
  );

  const handleViewSession = React.useCallback(
    (sessionId) => {
      if (!sessionId) return;
      if (typeof navigate === "function") {
        navigate(`/sessions/${sessionId}`);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.hash = `/sessions/${sessionId}`;
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen w-full px-6 py-8 mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quick snapshot of participants, session activity, and what&apos;s coming up next.
        </p>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-gray-200 bg-white shadow animate-pulse"
              />
            ))}
          </div>
          <div className="h-72 rounded-2xl border border-gray-200 bg-white shadow animate-pulse" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load dashboard data. Please try again later.
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Participants
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {formatNumber(stats.participantCount)}
              </p>
              <p className="mt-2 text-sm text-gray-500">Total enrolled across all studies.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sessions (This week)
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {formatNumber(stats.sessionsThisWeek)}
              </p>
              <p className="mt-2 text-sm text-gray-500">Includes completed and scheduled sessions.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Active today
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {formatNumber(stats.activeToday)}
              </p>
              <p className="mt-2 text-sm text-gray-500">Participants with a session on the calendar today.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Completion rate (7d)
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {formatPercent(stats.completionRate)}
              </p>
              <p className="mt-2 text-sm text-gray-500">Completed sessions from the last seven days.</p>
            </div>
          </div>

          {actionError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Today&apos;s sessions</h2>
                      <p className="text-sm text-gray-500">
                        Everything scheduled for today across all studies.
                      </p>
                    </div>
                  </div>

                  {todaySessions.length === 0 && (
                    <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                      No sessions scheduled for today.
                    </div>
                  )}

                  {todaySessions.length > 0 && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Participant</th>
                            <th className="px-4 py-3">Study</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {todaySessions.map((session) => {
                            const participant = participantById.get(session.participantId);
                            const study = studyById.get(session.studyId);
                            return (
                              <tr key={session._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {formatTimeLabel(session.startedAt)}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {participant?.name || participant?.externalId || "Participant"}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {study?.title || "Study"}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleViewSession(session._id)}
                                      className="rounded-lg border border-indigo-600 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                                    >
                                      View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!session.endedAt) handleMarkDone(session._id);
                                      }}
                                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                      disabled={Boolean(session.endedAt) || Boolean(savingSessions[session._id])}
                                    >
                                      {session.endedAt
                                        ? "Complete"
                                        : savingSessions[session._id]
                                        ? "Saving…"
                                        : "Mark done"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming sessions</h2>
                <p className="text-sm text-gray-500">
                  Stay ahead of what&apos;s scheduled and take quick action when plans change.
                </p>
              </div>
            </div>

            {upcomingSessions.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No upcoming sessions on the calendar yet. Once you schedule new sessions they will appear here.
              </div>
            )}

            {upcomingSessions.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Participant</th>
                      <th className="px-4 py-3">Study</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {upcomingSessions.map((session) => {
                      const participant = participantById.get(session.participantId);
                      const study = studyById.get(session.studyId);
                      return (
                        <tr key={session._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {formatDayLabel(session.startedAt)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatTimeLabel(session.startedAt)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {participant?.name || participant?.externalId || "Participant"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {study?.title || "Study"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewSession(session._id)}
                                className="rounded-lg border border-indigo-600 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!session.endedAt) handleMarkDone(session._id);
                                }}
                                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                disabled={Boolean(session.endedAt) || Boolean(savingSessions[session._id])}
                              >
                                {session.endedAt
                                  ? "Complete"
                                  : savingSessions[session._id]
                                  ? "Saving…"
                                  : "Mark done"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

Dashboard.propTypes = {
  navigate: PropTypes.func,
};