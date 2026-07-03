"use client";
import WorldMap from "./ui/WorldMap";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
    <div style={{ padding: "80px 0", width: "100%", position: "relative" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", padding: "0 20px" }}>
        <h2 style={{ fontWeight: 800, fontSize: "2.2rem", marginBottom: "16px" }}>
          Remote{" "}
          <span style={{ color: "var(--text-muted)", background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {"Connectivity".split("").map((char, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </h2>
        <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "640px", margin: "0 auto 40px auto", lineHeight: 1.6 }}>
          Break free from traditional boundaries. Find flatmates and co-living spaces anywhere in the world. Perfect for digital nomads, remote professionals, and travelers.
        </p>
      </div>
      <WorldMap
        dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
        ]}
      />
    </div>
  );
}
