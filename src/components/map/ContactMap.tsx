import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function ContactMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: prefersDark
        ? "mapbox://styles/mapbox/navigation-night-v1"
        : "mapbox://styles/mapbox/light-v11",

      center: [-73.75, 45.57],
      zoom: 8.8,
      minZoom: 8,
      maxZoom: 15,

      pitch: 0,
      bearing: -15,

      attributionControl: false,
      scrollZoom: false,
    });

    // 🚁 Entrada tipo dron (suave y profesional)
    mapInstance.current.on("load", () => {
      mapInstance.current!.resize();
      mapContainer.current!.style.opacity = "1";

      mapInstance.current!.fitBounds(
        [
          [-74.1, 45.35],
          [-73.25, 45.8],
        ],
        {
          padding: 50,
          duration: 1400,
        }
      );

      setTimeout(() => {
        mapInstance.current!.easeTo({
          pitch: 40,
          duration: 1800,
          easing: (t) => t * (2 - t),
        });
      }, 600);
    });

    // 🎥 efecto leve en scroll (no exagerado)
    const handleScroll = () => {
      if (!mapInstance.current || !mapContainer.current) return;

      const rect = mapContainer.current.getBoundingClientRect();
      const progress = Math.min(Math.max(rect.top / window.innerHeight, 0), 1);

      const pitch = 30 + progress * 15;
      mapInstance.current.setPitch(pitch);
    };

    window.addEventListener("scroll", handleScroll);

    // 📍 marker elegante
    new mapboxgl.Marker({ color: "#d4af37" })
      .setLngLat([-73.75, 45.57])
      .addTo(mapInstance.current);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

 return (
  <div className="monzon-frame relative w-full h-60 rounded-2xl overflow-hidden">

    {/* 🗺️ MAPA */}
    <div
      ref={mapContainer}
      className="absolute inset-0 z-0 opacity-0 transition-opacity duration-[1200ms]"
    />

    {/* 🌑 Overlay elegante */}
    <div className="map-overlay" />

    {/* 🎯 CTA flotante */}
    <a href="#contact" className="cta-float">
      Obtenir une soumission
    </a>

    {/* 🏷️ Branding */}
    <div className="map-branding">
      AMENAGEMENT MONZON
    </div>

  </div>
);
}