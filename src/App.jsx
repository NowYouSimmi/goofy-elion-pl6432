// src/App.jsx
import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";

import Home from "./pages/Home.jsx";
import Inventory from "./pages/Inventory.jsx";
import InvEquipment from "./pages/InvEquipment.jsx";
import InvInUse from "./pages/InvInUse.jsx";
import ShowSpecs from "./pages/ShowSpecs.jsx";
import Venues from "./pages/Venues.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import RiggingCalc from "./pages/RiggingCalc.jsx";
import Schedule from "./pages/Schedule.jsx";
import PDFViewer from "./components/PDFViewer.jsx";
import PhotoGallery from "./pages/PhotoGallery.jsx";
import POs from "./pages/POs.jsx";
import SpacesUsage from "./pages/SpacesUsage";
import HowToCAD from "./pages/HowToCAD.jsx";
import UsefulDocsLinks from "./pages/UsefulDocsLinks";

import Hours from "./pages/Hours.jsx";
import PersonHours from "./pages/PersonHours.jsx";

import StatusHub from "./pages/StatusHub.jsx";
import ProductionStatus from "./pages/ProductionStatus.jsx";

import InventoryHub from "./pages/InventoryHub.jsx";
import AudioInventory from "./pages/AudioInventory.jsx";
import VideoInventory from "./pages/VideoInventory.jsx";

import "./App.css";
import TeamHours from "./pages/TeamHours.jsx";

/* -------------------- ACCESS CONTROL -------------------- */

const HOURS_ADMIN = ["js9640"]; // sees ALL hours
const HOURS_LIMITED = ["cp2532", "gr73"]; // only Josie + Gareth

const APPROVED_LOGINS = [
  "cp2532",
  "eg129",
  "pb139",
  "rs5186",
  "st110",
  "gr73",
  "js9640",
  "tt2571",
  "lc4938",
  "ch4360",
  "jp4854",
  "bl2580",
  "lg3115",
  "ma10073",
  "sam9644",
  "ld72",
  "sa9252",
];

// Only specific users require a password
const PASSWORD_REQUIRED = {
  js9640: "noseygit", // ← change this to your real password
};

const RESTRICTED_ACCESS = ["cp2532", "js9640", "gr73"];

const AUTH_KEY = "stagevault-auth-v1";

/* -------------------- PRODUCTION STATUS HELPERS -------------------- */

function urlForSheet(sheetName) {
  const base =
    "https://script.google.com/macros/s/AKfycbxb2yNU8itdZUICoROgkaaAC_kY-N9rv6IuJjsdMrOS-9jP5l_NTUxpWIiV5tp_9ZyS/exec";
  const qs = new URLSearchParams({
    mode: "normalized",
    format: "json",
    sheet: sheetName,
  }).toString();
  return `${base}?${qs}`;
}

/* =============================================================== */
/*                            MAIN APP                             */
/* =============================================================== */

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [pdfData, setPdfData] = useState(null);
  const [galleryData, setGalleryData] = useState(null);

  /* Restore login */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id && parsed?.role) setUser(parsed);
      }
    } catch (err) {
      console.warn("could not restore login", err);
    }
  }, []);

  /* Login */
  const handleLogin = (input) => {
    const clean = input.trim().toLowerCase();
    if (!clean) return;

    // Guest login
    if (clean === "guest") {
      const guest = { id: "guest", role: "guest" };
      setUser(guest);
      localStorage.setItem(AUTH_KEY, JSON.stringify(guest));
      setPage("venues");
      return;
    }

    // Users that require a password (currently only js9640)
    if (clean in PASSWORD_REQUIRED) {
      const pwd = prompt("Enter password:");
      if (pwd !== PASSWORD_REQUIRED[clean]) {
        alert("Incorrect password.");
        return;
      }
    }

    // Normal approved login
    if (APPROVED_LOGINS.includes(clean)) {
      const full = { id: clean, role: "full" };
      setUser(full);
      localStorage.setItem(AUTH_KEY, JSON.stringify(full));
      setPage("home");
      return;
    }

    alert("Invalid Net ID. Please enter an approved Net ID or type 'Guest'.");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setPage("home");
  };

  /* Legacy slugs */
  const legacyMap = {
    "inventory-hub": "inventory",
    "inventory-equipment": "inventory-equipment",
    "inventory-inuse": "inventory-inuse",
    "audio-inventory": "audio",
  };
  const effectivePage = legacyMap[page] || page;

  /* Overlay helpers */
  const openPDF = (url, title = "Document") => {
    setPdfData({ url, title });
    setPage("pdf");
  };

  const openGallery = (images, title = "Gallery") => {
    setGalleryData({ images, title });
    setPage("gallery");
  };

  /* =============================================================== */
  /*                        LOGIN SCREEN                             */
  /* =============================================================== */

  if (!user) {
    return (
      <div className="login-page" style={loginPageStyle}>
        <div className="login-card" style={loginCardStyle}>
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <h1 style={{ margin: 0 }}>StageVault</h1>
            <p
              style={{ opacity: 0.6, marginTop: "0.4rem", fontSize: "0.75rem" }}
            >
              NYUAD Arts Center · Internal
            </p>
          </div>

          <LoginForm onLogin={handleLogin} />

          <p
            style={{
              opacity: 0.55,
              fontSize: "0.68rem",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            Enter your <strong>Net ID</strong>. Type <strong>Guest</strong> for
            venue-only access.
          </p>
        </div>
      </div>
    );
  }

  /* =============================================================== */
  /*                         GUEST VIEW                              */
  /* =============================================================== */

  if (user.role === "guest") {
    return (
      <div className="app">
        <header className="app-header">
          <div className="menu-container">
            <button className="btn dark" onClick={handleLogout}>
              Logout ({user.id})
            </button>
          </div>
        </header>

        <div className="page">
          <Venues
            openPDF={openPDF}
            openGallery={openGallery}
            setPage={setPage}
          />
        </div>

        {effectivePage === "pdf" && pdfData && (
          <PDFViewer
            src={pdfData.url}
            title={pdfData.title}
            onBack={() => setPage("venues")}
          />
        )}

        {effectivePage === "gallery" && galleryData && (
          <PhotoGallery
            images={galleryData.images}
            title={galleryData.title}
            onBack={() => setPage("venues")}
          />
        )}
      </div>
    );
  }

  /* =============================================================== */
  /*                       FULL ACCESS VIEW                          */
  /* =============================================================== */

  return (
    <div className="app">
      <Header setPage={setPage} page={effectivePage} />

      {/* user badge */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 10,
          fontSize: "0.7rem",
          opacity: 0.6,
          zIndex: 1200,
        }}
      >
        {user.id} ·{" "}
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          logout
        </button>
      </div>

      <main className="page">
        {/* Standard pages */}
        {effectivePage === "home" && <Home setPage={setPage} />}
        {effectivePage === "inventory" && <InventoryHub setPage={setPage} />}
        {effectivePage === "inventory-stage" && <Inventory />}
        {effectivePage === "audio" && <AudioInventory />}
        {effectivePage === "inventory-video" && <VideoInventory />}
        {effectivePage === "inventory-equipment" && (
          <InvEquipment setPage={setPage} />
        )}
        {effectivePage === "inventory-inuse" && <InvInUse setPage={setPage} />}
        {effectivePage === "showList" && <ShowSpecs />}
        {effectivePage === "venues" && (
          <Venues
            openPDF={openPDF}
            openGallery={openGallery}
            setPage={setPage}
          />
        )}
        {effectivePage === "suppliers" && <Suppliers setPage={setPage} />}
        {effectivePage === "usefulDocs" && (
          <UsefulDocsLinks setPage={setPage} />
        )}

        {effectivePage === "rigCalc" && <RiggingCalc />}
        {effectivePage === "schedule" && <Schedule />}
        {effectivePage === "how-to-cad" && <HowToCAD />}
        {effectivePage === "spaces-usage" && <SpacesUsage />}

        {/* Purchase Orders */}
        {effectivePage === "purchaseorders" &&
          (RESTRICTED_ACCESS.includes(user.id) ? (
            <POs setPage={setPage} />
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                opacity: 0.7,
                fontSize: "0.9rem",
              }}
            >
              🚫 You do not have access to the Purchase Orders page.
            </div>
          ))}

        {/* Production Status */}
        {effectivePage === "productionstatus" && (
          <StatusHub setPage={setPage} />
        )}

        {effectivePage === "productionstatus-stage" && (
          <ProductionStatus
            title="Stage — Production Status"
            dataUrl={urlForSheet("Events Checklist")}
            onBack={() => setPage("productionstatus")}
            hideOwner={false}
          />
        )}

        {effectivePage === "productionstatus-audio" && (
          <ProductionStatus
            title="Audio — Production Status"
            dataUrl={urlForSheet("Checklist- Audio")}
            onBack={() => setPage("productionstatus")}
            hideOwner={true}
          />
        )}

        {[
          "hours",
          "hours-josie",
          "hours-gareth",
          "hours-tim",
          "hours-liriana",
          "hours-sabr",
          "hours-jon",
          "hours-roger",
          "hours-philip",
          "hours-subin",
          "hours-estelle",
          "hours-team",
        ].includes(effectivePage) &&
          (() => {
            const isAdmin = HOURS_ADMIN.includes(user.id);
            const isLimited = HOURS_LIMITED.includes(user.id);
            const isLimitedPage = [
              "hours",
              "hours-josie",
              "hours-gareth",
            ].includes(effectivePage);

            if (!isAdmin && !(isLimited && isLimitedPage)) {
              return (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    opacity: 0.7,
                    fontSize: "0.9rem",
                  }}
                >
                  Nosey, Nosey! 🚫 You do not have access to the Hours page.
                </div>
              );
            }

            return (
              <>
                {/* UNIVERSAL (limited + admin) */}
                {effectivePage === "hours" && (
                  <Hours setPage={setPage} user={user} />
                )}
                {effectivePage === "hours-josie" && (
                  <PersonHours person="josie" setPage={setPage} />
                )}
                {effectivePage === "hours-gareth" && (
                  <PersonHours person="gareth" setPage={setPage} />
                )}

                {/* ADMIN ONLY */}
                {isAdmin && (
                  <>
                    {effectivePage === "hours-team" && (
                      <TeamHours setPage={setPage} />
                    )}

                    {effectivePage === "hours-tim" && (
                      <PersonHours person="tim" setPage={setPage} />
                    )}
                    {effectivePage === "hours-liriana" && (
                      <PersonHours person="liriana" setPage={setPage} />
                    )}
                    {effectivePage === "hours-sabr" && (
                      <PersonHours person="sabr" setPage={setPage} />
                    )}
                    {effectivePage === "hours-jon" && (
                      <PersonHours person="jon" setPage={setPage} />
                    )}
                    {effectivePage === "hours-roger" && (
                      <PersonHours person="roger" setPage={setPage} />
                    )}
                    {effectivePage === "hours-philip" && (
                      <PersonHours person="philip" setPage={setPage} />
                    )}
                    {effectivePage === "hours-subin" && (
                      <PersonHours person="subin" setPage={setPage} />
                    )}
                    {effectivePage === "hours-estelle" && (
                      <PersonHours person="estelle" setPage={setPage} />
                    )}
                  </>
                )}
              </>
            );
          })()}
      </main>

      {/* overlays */}
      {effectivePage === "pdf" && pdfData && (
        <PDFViewer
          src={pdfData.url}
          title={pdfData.title}
          onBack={() => setPage("venues")}
        />
      )}

      {effectivePage === "gallery" && galleryData && (
        <PhotoGallery
          images={galleryData.images}
          title={galleryData.title}
          onBack={() => setPage("venues")}
        />
      )}
    </div>
  );
}

/* -------------------- LOGIN FORM -------------------- */

function LoginForm({ onLogin }) {
  const [val, setVal] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onLogin(val);
  };

  return (
    <form onSubmit={submit} className="login-form">
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        <span
          style={{
            display: "block",
            marginBottom: "0.35rem",
            fontSize: "0.78rem",
          }}
        >
          Net ID
        </span>

        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Enter Net ID or 'Guest'"
          style={{
            width: "100%",
            background: "rgba(15,23,42,0.35)",
            border: "1px solid rgba(148,163,184,0.35)",
            borderRadius: "10px",
            padding: "0.5rem 0.6rem",
            color: "white",
          }}
          autoFocus
        />
      </label>

      <button type="submit" className="btn primary" style={{ width: "100%" }}>
        Enter
      </button>
    </form>
  );
}

/* -------------------- INLINE STYLES -------------------- */

const loginPageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #111827, #020617 60%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
};

const loginCardStyle = {
  background: "rgba(15,23,42,0.5)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "18px",
  padding: "1.5rem 1.6rem 1.5rem",
  width: "min(380px, 96vw)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 12px 45px rgba(0,0,0,0.25)",
};
