// src/pages/UsefulDocsLinks.jsx
import React, { useEffect, useMemo, useState } from "react";

const DOCS_URL =
  "https://script.google.com/macros/s/AKfycbxQ2se4qxGkhmK15KGjTTh_YS7v1NyZXC3rAqz1pvVdUjGxanUdR7u4-zTpFHqVlfFbWQ/exec";

function normalizeDoc(raw) {
  const title =
    String(raw.Title || "").trim() ||
    String(raw.Doc || "").trim() ||      // prefer Doc name
    String(raw.Link || "").trim() ||     // last resort: URL
    "Untitled link";

  return {
    type: String(raw.Type || "Other").trim(),
    title,
    doc: String(raw.Doc || "").trim(),
    link: String(raw.Link || "").trim(),
    notes: String(raw.Notes || "").trim(),
    _raw: raw,
  };
}


export default function UsefulDocsLinks({ setPage }) {
  const [docs, setDocs] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openType, setOpenType] = useState(null); // which tile is open

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${DOCS_URL}?cb=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        const arr = Array.isArray(json.docs) ? json.docs : [];
        setDocs(arr.map(normalizeDoc));
      } catch (e) {
        console.error(e);
        setError("Failed to fetch useful docs.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) =>
      [d.title, d.type, d.notes, d.link].join(" ").toLowerCase().includes(q)
    );
  }, [docs, query]);

  // Group by type
  const groups = useMemo(() => {
    const m = {};
    filtered.forEach((d) => {
      const k = d.type || "Other";
      if (!m[k]) m[k] = [];
      m[k].push(d);
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // If the current openType disappears because of filtering, close it
  useEffect(() => {
    if (!openType) return;
    const stillExists = groups.some(([t]) => t === openType);
    if (!stillExists) setOpenType(null);
  }, [groups, openType]);

  return (
    <div className="page">
      <h1>Useful Docs / Links</h1>
      <p className="muted" style={{ marginBottom: "0.75rem" }}>
        Quick access to frequently used documents, sheets, and reference links.
      </p>

      {/* Search */}
      <div style={{ maxWidth: 360, marginBottom: "1rem" }}>
        <label>Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, notes, type..."
        />
      </div>

      {error && (
        <div className="error" style={{ marginBottom: 10 }}>
          {error}
        </div>
      )}
      {loading && <div className="muted">Loading…</div>}

      {/* TYPE TILES WITH INLINE DROPDOWN */}
      {!loading && !error && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr",
            gap: 12,
            marginTop: 4,
          }}
        >
          {groups.map(([type, list]) => {
            const isOpen = openType === type;
            return (
              <div key={type} className="card" style={{ padding: 0 }}>
                {/* Tile header */}
                <button
                  className="btn"
                  onClick={() =>
                    setOpenType((prev) => (prev === type ? null : type))
                  }
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    borderRadius: "12px 12px 0 0",
                    border: "none",
                    background: isOpen
                      ? "rgba(30,64,175,0.65)"
                      : "rgba(15,23,42,0.8)",
                    boxShadow: "none",
                    padding: "10px 12px",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{type}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      {list.length} link{list.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        opacity: 0.65,
                      }}
                    >
                      {isOpen ? "Hide" : "Show"}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        lineHeight: 1,
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.15s ease-out",
                      }}
                    >
                      ▸
                    </div>
                  </div>
                </button>

                {/* Dropdown contents – immediately under tile */}
                {isOpen && (
                  <div
                    style={{
                      padding: "10px 12px 12px",
                      borderTop: "1px solid rgba(30,64,175,0.5)",
                      borderRadius: "0 0 12px 12px",
                      background: "rgba(15,23,42,0.65)",
                    }}
                  >
                    {list.map((d, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{
                          marginBottom: i === list.length - 1 ? 0 : 8,
                        }}
                      >
                        <div className="card-title">
                          {d.link ? (
                            <a
                              href={d.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#bfdbfe",
                                textDecoration: "none",
                              }}
                            >
                              {d.title}
                            </a>
                          ) : (
                            d.title
                          )}
                        </div>

                        {d.notes && (
                          <div className="muted" style={{ marginTop: 4 }}>
                            {d.notes}
                          </div>
                        )}

                        {d.link && (
                          <div style={{ marginTop: 6, fontSize: "0.8rem" }}>
                            <span style={{ opacity: 0.65 }}>Link:</span>{" "}
                            <a
                              href={d.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#4fc3f7",
                                wordBreak: "break-all",
                              }}
                            >
                              {d.link}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {!groups.length && (
            <div className="muted">No docs match your search.</div>
          )}
        </div>
      )}

      <button
        className="btn ghost"
        style={{ marginTop: 16 }}
        onClick={() => setPage("home")}
      >
        ← Back to Home
      </button>
    </div>
  );
}

