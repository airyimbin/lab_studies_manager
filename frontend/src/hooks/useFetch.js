import { useEffect, useRef, useState } from "react";

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const abortRef = useRef();

  useEffect(() => {
    if (!url) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { ...options, signal: ctrl.signal, credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [url]);

  return { data, loading, error };
}
