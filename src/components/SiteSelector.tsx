import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useSplash } from "@/contexts/SplashContext";

/* SITE PRESETS */
export const SITE_PRESETS = [
  {
    id: "hardscape",
    label: "Hardscape / Landscape",
    sublabel: "Pavé · Patios · Murs de soutènement",
    themePresetId: "hardscape-landscape",
    destination: "/",
    accent: "hsl(138,60%,38%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="12" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="7" y="4" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "construction",
    label: "Construction / Rénovation",
    sublabel: "Rénovation · Extensions · Structurelles",
    themePresetId: "construction-renovation",
    destination: "/",
    accent: "hsl(38,70%,54%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 18V9l7-5 7 5v9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="8" y="13" width="6" height="5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "maintenance",
    label: "Maintenance / Plans de Service",
    sublabel: "Plans mensuels · Saisonniers · Commercial",
    themePresetId: "maintenance-service",
    destination: "/maintenance",
    accent: "hsl(205,70%,54%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

/* HOOK PARA SELECCIÓN DE SITIO */
export function useSiteSelector() {
  const { applyPreset, saveTheme, presets } = useTheme();
  const { openSplash } = useSplash();
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (siteId: string) => {
      if (siteId === "open") {
        openSplash();
        return;
      }

      const site = SITE_PRESETS.find((s) => s.id === siteId);
      if (!site) return;

      const preset = presets.find((p) => p.id === site.themePresetId);
      if (preset) {
        applyPreset(preset);
        saveTheme();
      }

      navigate(site.destination);
    },
    [applyPreset, saveTheme, presets, navigate, openSplash]
  );

  return { handleSelect };
}

/* DROPDOWN DESKTOP */
function DesktopDropdown({ open, onSelect }: { open: boolean; onSelect: (id: string) => void }) {
  return (
    <div
      className="absolute top-[calc(100%+10px)] right-0 w-[340px] hidden md:block"
      style={{
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.98)",
        pointerEvents: open ? "all" : "none",
        transition:
          "opacity 0.32s cubic-bezier(0.16,1,0.3,1), transform 0.32s cubic-bezier(0.16,1,0.3,1)",
        transformOrigin: "top right",
        zIndex: 9900,
      }}
    >
      <div
        className="rounded-xl overflow-hidden shadow-deep"
        style={{
          background: "rgba(10,12,18,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
        }}
      >
        <div className="px-5 pt-5 pb-3 border-b border-white/5">
          <p className="font-mono text-[9.5px] tracking-[0.28em] text-gold/55 uppercase mb-1">
            Select Site · Choisissez
          </p>
          <p className="font-headline text-warm-white/90 text-[1.15rem] font-light">
            Quel site visitez-vous?
          </p>
        </div>

        <div className="p-3 flex flex-col gap-1.5">
          {SITE_PRESETS.map((svc, i) => (
            <button
              key={svc.id}
              onClick={() => onSelect(svc.id)}
              className="group w-full text-left flex items-center gap-3.5 px-3.5 py-3 rounded-lg hover:bg-white/[0.055] transition-all duration-250 focus:outline-none"
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              <span
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(200,200,200,0.65)",
                }}
              >
                {svc.icon}
              </span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-headline text-warm-white/90 text-[1rem] font-medium leading-tight group-hover:text-warm-white transition-colors">
                  {svc.label}
                </span>
                <span className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">
                  {svc.sublabel}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="h-px mx-3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="px-5 py-3">
          <p className="font-mono text-[8.5px] tracking-[0.22em] text-gray-600 uppercase">
            Aménagement Monzon · Montréal
          </p>
        </div>
      </div>
    </div>
  );
}

/* BOTÓN PRINCIPAL */
export function WhichSiteNeedsButton() {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { handleSelect } = useSiteSelector();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDesktopOpen(false);
    };
    if (desktopOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [desktopOpen]);

  const onSelect = useCallback(
    (id: string) => {
      setDesktopOpen(false);
      handleSelect(id);
    },
    [handleSelect]
  );

  return (
    <>
      {/* DESKTOP */}
      <div ref={wrapRef} className="relative">
        <button
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px] font-sans font-light tracking-[0.08em] uppercase transition-all duration-300 focus:outline-none cursor-pointer group"
          style={{
            color: hovered || desktopOpen ? "rgba(212,160,23,0.95)" : "rgba(200,200,200,0.65)",
            border: `1px solid ${hovered || desktopOpen ? "rgba(212,160,23,0.28)" : "rgba(255,255,255,0.08)"}`,
            background: desktopOpen ? "rgba(212,160,23,0.07)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
            transition: "all 0.28s ease",
          }}
          onClick={() => setDesktopOpen((o) => !o)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="0.75" y="0.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="7.75" y="0.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="0.75" y="7.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="7.75" y="7.75" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>Visit Which Site</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{
              transform: desktopOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.28s ease",
            }}
          >
            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <DesktopDropdown open={desktopOpen} onSelect={onSelect} />
      </div>

      {/* MOBILE */}
      <button
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-gray-400 hover:border-gold/30 hover:text-gold/80 transition-all duration-300 focus:outline-none cursor-pointer"
        onClick={() => handleSelect("open")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9.5" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
          <rect x="1" y="9.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </>
  );
}