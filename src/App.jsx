import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

const GOOD = [
  { name: "Центр", coords: [55.76, 37.62] },
  { name: "Москва-Сити", coords: [55.75, 37.53] }
];

const MID = [
  { name: "Проспект Мира", coords: [55.8, 37.6] }
];

const BAD = [
  { name: "За МКАД", coords: [55.81, 37.94] }
];

function getAdvice(hour) {
  if (hour >= 6 && hour < 10) {
    return {
      main: "Белорусская",
      backup: "Москва-Сити",
      avoid: "спальные районы",
      text: "Утренний поток. Держись деловых и центральных точек."
    };
  }

  if (hour >= 10 && hour < 16) {
    return {
      main: "Москва-Сити",
      backup: "Центр",
      avoid: "дальние подачи",
      text: "Днём лучше работать короткие и средние поездки."
    };
  }

  if (hour >= 16 && hour < 20) {
    return {
      main: "Павелецкая",
      backup: "Тверская",
      avoid: "пустые стоянки",
      text: "Вечерний спрос. Смещайся ближе к центру."
    };
  }

  return {
    main: "Центр",
    backup: "Белорусская",
    avoid: "долгий простой",
    text: "Ночной режим. Держись центральных точек."
  };
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
    const timer = setInterval(() => {
      const now = Date.now();

      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        now - lastMove > 15 * 60 * 1000
      ) {
        new Notification("Переместитесь");
      }

      setHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(timer);
  }, [lastMove]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const advice = getAdvice(hour);

  return (
    <div className="app-shell">
      <div className="map-layer">
        <MapContainer
          center={pos || [55.75, 37.61]}
          zoom={11}
          className="map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {GOOD.map((item) => (
            <Circle
              key={item.name}
              center={item.coords}
              radius={900}
              pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2 }}
            />
          ))}

          {MID.map((item) => (
            <Circle
              key={item.name}
              center={item.coords}
              radius={900}
              pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.2 }}
            />
          ))}

          {BAD.map((item) => (
            <Circle
              key={item.name}
              center={item.coords}
              radius={900}
              pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2 }}
            />
          ))}

          {pos && (
            <CircleMarker
              center={pos}
              radius={10}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 1 }}
            />
          )}
        </MapContainer>
      </div>

      <div className="ui-layer">
        <div className="top-card">
          <div className="badge">🚕 Driver Assistant</div>
          <div className="title">Куда ехать сейчас</div>
          <div className="main-point">{advice.main}</div>
          <div className="subtitle">{advice.text}</div>
        </div>

        <div className="bottom-sheet">
          <div className="grid">
            <div className="info-card">
              <div className="label">Основная точка</div>
              <div className="value">{advice.main}</div>
            </div>

            <div className="info-card">
              <div className="label">Запасная</div>
              <div className="value">{advice.backup}</div>
            </div>

            <div className="info-card info-card-wide">
              <div className="label">Избегать</div>
              <div className="value">{advice.avoid}</div>
            </div>
          </div>

          <button
            className="nav-button"
            onClick={() => {
              window.location.href = "yandexnavi://build_route_on_map";
            }}
          >
            Открыть в Яндекс Навигаторе
          </button>
        </div>
      </div>
    </div>
  );
}
