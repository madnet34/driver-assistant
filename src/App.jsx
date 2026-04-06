import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GOOD = [
  [55.76, 37.62],
  [55.75, 37.53]
];

const MID = [
  [55.8, 37.6]
];

const BAD = [
  [55.81, 37.94]
];

function getAdvice(hour) {
  if (hour >= 6 && hour < 10) return "Езжай в центр / Белорусская";
  if (hour >= 10 && hour < 16) return "Сити или пауза";
  if (hour >= 16 && hour < 20) return "Центр / Павелецкая";
  return "Центр / ночная работа";
}

export default function App() {
  const [pos, setPos] = useState(null);
  const [lastMove, setLastMove] = useState(Date.now());
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        const coords = [p.coords.latitude, p.coords.longitude];
        setPos(coords);
        setLastMove(Date.now());
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      const now = Date.now();
      if (now - lastMove > 15 * 60 * 1000) {
        if (Notification.permission === "granted") {
          new Notification("Переместитесь");
        }
      }
      setHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(i);
  }, [lastMove]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const advice = getAdvice(hour);

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <MapContainer
        center={pos || [55.75, 37.61]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {GOOD.map((c, i) => (
          <Circle key={`good-${i}`} center={c} radius={800} pathOptions={{ color: "green" }} />
        ))}
        {MID.map((c, i) => (
          <Circle key={`mid-${i}`} center={c} radius={800} pathOptions={{ color: "orange" }} />
        ))}
        {BAD.map((c, i) => (
          <Circle key={`bad-${i}`} center={c} radius={800} pathOptions={{ color: "red" }} />
        ))}

        {pos && <CircleMarker center={pos} radius={10} pathOptions={{ color: "blue" }} />}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 10,
          right: 10,
          zIndex: 1000,
          background: "#fff",
          padding: 12,
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
        }}
      >
        <b>Куда ехать:</b> {advice}
        <br />
        <button
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: 16
          }}
          onClick={() => {
            window.location.href = "yandexnavi://build_route_on_map";
          }}
        >
          Навигация
        </button>
      </div>
    </div>
  );
}
