// src/pages/TeamHours.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchPersonHours } from "../lib/hoursAPI";

const PEOPLE = [
  { id: "estelle", label: "Estelle" },
  { id: "liriana", label: "Liriana" },
  { id: "roger", label: "Roger" },
  { id: "subin", label: "Subin" },
  { id: "philip", label: "Philip" },
  { id: "gareth", label: "Gareth" },
  { id: "josie", label: "Josie" },
  { id: "tim", label: "Tim" },
  { id: "sabr", label: "Sabr" },
  // { id: "jon", label: "Jon" }, // when URL is configured
];

export default function TeamHours({ setPage }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const range = useMemo(() => {
    const yyyy = month.getFullYear();
    const mm = String(month.getMonth() + 1).padStart(2, "0");
    const last = new Date(yyyy, month.getMonth() + 1, 0).getDate();
    return {
      from: `${yyyy}-${mm}-01`,
      to: `${yyyy}-${mm}-${String(last).padStart(2, "0")}`,
      label: month.toLocaleString("en-US", { month: "long", year: "numeric" }),
    };
  }, [month]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      const nextStats = {};

      try {
        await Promise.all(
          PEOPLE.map(async (p) => {
            try {
              const data = await fetchPersonHours(p.id, {
                from: range.from,
                to: range.to,
                tz: "Asia/Dubai",
                fields:
                  "Date,Events,Start Time,End Time,Total Hours,Net Hours,Status,Last Update",
                limit: 500,
              });
              const totals = computeTotals(data);
              nextStats[p.id] = { ...totals, error: null };
            } catch (e) {
              nextStats[p.id] = {
                totalHours: 0,
                daysOff: 0,
                daysWorked: 0,
                error: e.message || String(e),
              };
            }
          })
        );
        if (!cancelled) setStats(nextStats);
      } catch (e) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const prevMonth = () =>
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const pill = {
    appearance: "none",
    WebkitAppearance: "none",
    background: "rgba(23,23,23,0.7)",
    border: "1px solid rgba(120,120,120,0.6)",
    color: "rgba(229,231,235,0.9)",
    borderRadius: "9999px",
    padding: "8px 14px",
    lineHeight: 1,
    font: "inherit",
    cursor: "pointer",
    boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
  };
  const pillLabel = {
    ...pill,
    fontWeight: 600,
    fontSize: "1.125rem",
    padding: "8px 16px",
    color: "white",
    background: "rgba(12,12,12,0.7)",
  };
  const toolbar = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  };

  const sortedPeople = [...PEOPLE].sort((a, b) => {
    const sa = stats[a.id] || {};
    const sb = stats[b.id] || {};
    return (sb.totalHours || 0) - (sa.totalHours || 0);
  });

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header / Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold">Team Hours</h1>

          <div className="hours-toolbar" style={toolbar}>
            <button style={pill} title="Previous month" onClick={prevMonth}>
              ◀
            </button>
            <span style={pillLabel}>{range.label}</span>
            <button style={pill} title="Next month" onClick={nextMonth}>
              ▶
            </button>
            <button style={pill} onClick={() => setPage("hours")}>
              ← Back
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-neutral-300 mb-4">Loading team hours…</p>
        )}
        {err && <p className="text-red-400 mb-4">{err}</p>}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-neutral-300">
              <tr>
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2 text-center">Days Off</th>
                <th className="px-3 py-2 text-center">Days Worked</th>
                <th className="px-3 py-2 text-center">Total Hours</th>
              </tr>
            </thead>
            <tbody className="text-neutral-200">
              {sortedPeople.map((p) => {
                const s = stats[p.id] || {};
                return (
                  <tr key={p.id} className="border-t border-neutral-800">
                    <td className="px-3 py-2 font-medium">{p.label}</td>
                    <td className="px-3 py-2 text-center">
                      {fmtNum(s.daysOff)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {fmtNum(s.daysWorked)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {fmtNum(s.totalHours)}
                      {s.error && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.7rem",
                            color: "#f87171",
                            marginTop: 2,
                          }}
                        >
                          {s.error}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedPeople.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-neutral-400 text-center"
                  >
                    No people configured for team hours.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function isOff(status) {
  return /off|holiday/i.test(status || "");
}

function isWorked(status) {
  return /work|worked/i.test(status || "");
}

function computeTotals(rows) {
  const toNum = (v) =>
    v == null || v === "" ? 0 : Number(String(v).replace(/[, ]+/g, "")) || 0;

  const totalHours = rows.reduce((sum, r) => sum + toNum(r["Total Hours"]), 0);
  const daysOff = rows.reduce((c, r) => c + (isOff(r["Status"]) ? 1 : 0), 0);
  const daysWorked = rows.reduce(
    (c, r) => c + (isWorked(r["Status"]) ? 1 : 0),
    0
  );

  return { totalHours, daysOff, daysWorked };
}

function fmtNum(n) {
  return (Number(n) || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
