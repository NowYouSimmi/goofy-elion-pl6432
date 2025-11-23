// src/pages/Hours.jsx
import React from "react";

export default function Hours({ setPage, user }) {
  const Btn = ({ label, target }) => (
    <button
      onClick={() => setPage(target)}
      className="btn dark"
      style={{ width: "260px" }}
    >
      {label}
    </button>
  );

  const isAdmin = user.id === "js9640";
  const isLimited = ["cp2532", "gr73"].includes(user.id);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-8">Hours</h1>

        {/* Limited users (cp2532 + gr73) */}
        {isLimited && !isAdmin && (
          <div style={{ display: "grid", gap: 14, justifyContent: "center" }}>
            <Btn label="Josie" target="hours-josie" />
            <Btn label="Gareth" target="hours-gareth" />
          </div>
        )}

        {/* Full admin (js9640) */}
        {isAdmin && (
          <div style={{ display: "grid", gap: 14, justifyContent: "center" }}>
            {/* 🔹 NEW: Team overview */}
            <Btn label="Team Hours" target="hours-team" />

            {/* Existing individuals */}
            <Btn label="Josie" target="hours-josie" />
            <Btn label="Gareth" target="hours-gareth" />
            <Btn label="Tim" target="hours-tim" />
            <Btn label="Liriana" target="hours-liriana" />
            <Btn label="Sabr" target="hours-sabr" />
            <Btn label="Jon" target="hours-jon" />
            <Btn label="Roger" target="hours-roger" />
            <Btn label="Philip" target="hours-philip" />
            <Btn label="Subin" target="hours-subin" />
            <Btn label="Estelle" target="hours-estelle" />
          </div>
        )}
      </div>
    </div>
  );
}
