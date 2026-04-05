import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ALL_POINTS = [
  { name: "ВДНХ", lat: 55.8298, lng: 37.6331, type: "medium" },
  { name: "Проспект Мира", lat: 55.7802, lng: 37.6342, type: "medium" },
  { name: "Белорусская", lat: 55.7764, lng: 37.5849, type: "strong" },
  { name: "Тверская", lat: 55.7658, lng: 37.6051, type: "strong" },
  { name: "Москва-Сити", lat: 55.7494, lng: 37.5370, type: "strong" },
  { name: "Павелецкая", lat: 55.7301, lng: 37.6376, type: "strong" },
  { name: "Киевская", lat: 55.7431, lng: 37.5653, type: "strong" },
  { name: "Патрики", lat: 55.7648, lng: 37.5924, type: "medium" },
  { name: "Китай-город", lat: 55.7562, lng: 37.6331, type: "medium" },
  { name: "Шереметьево", lat: 55.9726, lng: 37.4146, type: "airport" },
  { name: "Балашиха", lat: 55.7963, lng: 37.9382, type: "risk" },
  { name: "Люберцы", lat: 55.6765, lng: 37.8981, type: "risk" },
  { name: "Реутов", lat: 55.7583, lng: 37.8619, type: "risk" }
];

const SCHEDULE = [
  { from: 6, to: 7, points: ["ВДНХ", "Проспект Мира"] },
  { from: 7, to: 9, points: ["Проспект Мира", "Белорусская", "Тверская"] },
  { from: 9, to: 11, points: ["Тверская", "Белорусская", "Москва-Сити"] },
  { from: 11, to: 13, points: ["Москва-Сити", "Киевская"] },
  { from: 13, to: 16, points: ["Москва-Сити", "Патрики"] },
  { from: 16, to: 18, points: ["Белорусская", "Павелецкая", "Москва-Сити"] },
  { from: 18, to: 21, points: ["Москва-Сити", "Белорусская", "Шереметьево"] },
  { from: 21, to: 23, points: ["Тверская", "Патрики", "Китай-город"] },
  { from: 23, to: 6, points: ["Китай-город", "Патрики"] }
];

function getCurrentSchedule(hour) {
  return SCHEDULE.find((s) =>
    s.from < s.to ? hour >= s.from && hour < s.to : hour >= s.from || hour < s.to
  );
}

function pointColor(type) {
  if (type === "strong") return "#22c55e";
  if (type === "medium") return "#f59e0b";
  if (type === "airport") return "#3b82f6";
  if (type === "risk") return "#ef4444";
  return "#94a3b8";
}

function openYandexNavigator(lat, lng) {
  window.location.href = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [lastOrderMinutes, setLastOrderMinutes] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const schedule = useMemo(() => getCurrentSchedule(hour), [hour]);

  const activePoints = useMemo(() => {
    if (!schedule) return [];
    return schedule.points
      .map((name) => ALL_POINTS.find((p) => p.name === name))
      .filter(Boolean);
  }, [schedule]);

  const moveHint =
    lastOrderMinutes >= 15
      ? "15+ минут без заказа: смещайся на следующую сильную точку."
      : "Если заказов нет 10–15 минут, меняй точку, не стой долго.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        padding: 12
      }}
    >
      <div
        style={{
          background: "#111827",
          borderRadius: 18,
          padding: 14,
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Текущее время</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>
          {String(hour).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#cbd5e1" }}>
          Сейчас лучше: {activePoints.map((p) => p.name).join(" · ")}
        </div>
      </div>

      <div
        style={{
          background: "#111827",
          borderRadius: 18,
          padding: 12,
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 14, marginBottom: 8 }}>Сколько минут без заказа</div>
        <input
          type="number"
          min="0"
          value={lastOrderMinutes}
          onChange={(e) => setLastOrderMinutes(Number(e.target.value || 0))}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 12,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            padding: "0 12px",
            boxSizing: "border-box",
            fontSize: 16
          }}
        />
        <div style={{ marginTop: 8, fontSize: 13, color: "#93c5fd" }}>{moveHint}</div>
      </div>

      <div
        style={{
          background: "#111827",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 12
        }}
      >
        <MapContainer
          center={[55.76, 37.62]}
          zoom={11}
          style={{ height: "45vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {activePoints.map((p) => (
            <CircleMarker
              key={p.name}
              center={[p.lat, p.lng]}
              radius={10}
              pathOptions={{
                color: pointColor(p.type),
                fillColor: pointColor(p.type),
                fillOpacity: 0.9
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{p.name}</div>
                  <button
                    onClick={() => openYandexNavigator(p.lat, p.lng)}
                    style={{
                      width: "100%",
                      height: 40,
                      border: "none",
                      borderRadius: 10,
                      background: "#22c55e",
                      color: "#fff",
                      fontWeight: 700
                    }}
                  >
                    Открыть в Яндекс.Навигаторе
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {activePoints.map((p) => (
          <div
            key={p.name}
            style={{
              background: "#111827",
              borderRadius: 16,
              padding: 14,
              border: `1px solid ${pointColor(p.type)}`
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {p.type === "strong" && "Сильная точка"}
              {p.type === "medium" && "Средняя точка"}
              {p.type === "airport" && "Аэропорт / длинные чеки"}
              {p.type === "risk" && "Зона риска"}
            </div>
            <button
              onClick={() => openYandexNavigator(p.lat, p.lng)}
              style={{
                marginTop: 10,
                width: "100%",
                height: 48,
                borderRadius: 12,
                border: "none",
                background: "#22c55e",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700
              }}
            >
              Поехать сюда
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          background: "#111827",
          borderRadius: 16,
          padding: 12,
          fontSize: 13,
          color: "#94a3b8"
        }}
      >
        Обновляется автоматически каждые 10 секунд.
      </div>
    </div>
  );
}
