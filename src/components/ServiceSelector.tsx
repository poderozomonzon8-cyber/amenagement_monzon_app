import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { WhichSiteNeedsButton } from "@/components/SiteSelector";

/* ── Shared service definitions ── */
export const SERVICES = [
  {
    id: "hardscape",
    label: "Hardscape / Landscape",
    sublabel: "Pavé · Patios · Retaining Walls",
    themePresetId: "hardscape-landscape",
    destination: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="12" y="12" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="7" y="4" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    accent: "hsl(138,60%,38%)",
  },
  {
    id: "construction",
    label: "Construction / Renovation",
    sublabel: "Rénovation · Additions · Structural",
    themePresetId: "construction-renovation",
    destination: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 18V9l7-5 7 5v9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="8" y="13" width="6" height="5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    accent: "hsl(38,70%,54%)",
  },
  {
    id: "maintenance",
    label: "Maintenance / Service Plans",
    sublabel: "Plans mensuels · Saisonniers · Commercial",
    themePresetId: "maintenance-service",
    destination: "/maintenance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    accent: "hsl(205,70%,54%)",
  },
] as const;

/* ── Hook principal ── */
export function useServiceSelector() {
  const { applyPreset, saveTheme, presets } = useTheme();
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (serviceId: string) => {
      const svc = SERVICES.find((s) => s.id === serviceId);
      if (!svc) return;

      const preset = presets.find((p) => p.id === svc.themePresetId);
      if (preset) {
        applyPreset(preset);
        saveTheme();
      }

      navigate(svc.destination);
    },
    [applyPreset, saveTheme, presets, navigate]
  );

  return { handleSelect };
}

/* ── Botón principal (usa el selector nuevo) ── */
export function WhichAreYourNeedsButton() {
  return (
    <div className="md:hidden">
      <WhichSiteNeedsButton />
    </div>
  );
}