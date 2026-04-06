import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const POINTS = {
  "ВДНХ": { name: "ВДНХ", lat: 55.8298, lng: 37.6331, type: "medium", waitLimit: 15 },
  "Проспект Мира": { name: "Проспект Мира", lat: 55.7802, lng: 37.6342, type: "medium", waitLimit: 15 },
  "Белорусская": { name: "Белорусская", lat: 55.7764, lng: 37.5849, type: "strong", waitLimit: 15 },
  "Тверская": { name: "Тверская", lat: 55.7658, lng: 37.6051, type: "strong", waitLimit: 15 },
  "Москва-Сити": { name: "Москва-Сити", lat: 55.7494, lng: 37.537, type: "strong", waitLimit: 15 },
  "Павелецкая": { name: "Павелецкая", lat: 55.7301, lng: 37.6376, type: "strong", waitLimit: 15 },
  "Киевская": { name: "Киевская", lat: 55.7431, lng: 37.5653, type: "strong", waitLimit: 15 },
  "Патрики": { name: "Патрики", lat: 55.7648, lng: 37.5924, type: "medium", waitLimit: 15 },
  "Китай-город": { name: "Китай-город", lat: 55.7562, lng: 37.6331, type: "medium", waitLimit: 15 },
  "Шереметьево": { name: "Шереметьево", lat: 55.9726, lng: 37.4146, type: "airport", waitLimit: 10 },
  "Балашиха": { name: "Балашиха", lat: 55.7963, lng: 37.9382, type: "risk", waitLimit: 0 },
  "Люберцы": { name: "Люберцы", lat: 55.6765, lng: 37.8981, type: "risk", waitLimit: 0 },
  "Реутов": { name: "Реутов", lat: 55.7583, lng: 37.8619, type: "risk", waitLimit: 0 },
  "Котельники": { name: "Котельники", lat: 55.6598, lng: 37.8632, type: "risk", waitLimit: 0 },
  "Мытищи": { name: "Мытищи", lat: 55.9105, lng: 37.7363, type: "risk", waitLimit: 0 }
};

const SCHEDULE = [
  {
    from: 6,
    to: 7,
    primary: "ВДНХ",
    backup: "Проспект Мира",
    avoid: ["Балашиха", "Люберцы", "Реутов"],
    shouldWork: true,
    note: "Стартуй с северо-востока и быстро заходи в центр."
  },
  {
    from: 7,
    to: 9,
    primary: "Белорусская",
    backup: "Тверская",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники"],
    shouldWork: true,
    note: "Утренний пик. Главная задача — закрепиться в центре."
  },
  {
    from: 9,
    to: 11,
    primary: "Тверская",
    backup: "Москва-Сити",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники", "Мытищи"],
    shouldWork: true,
    note: "Добирай центр и деловые точки, ищи длинные чеки."
  },
  {
    from: 11,
    to: 13,
    primary: "Москва-Сити",
    backup: "Киевская",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники", "Мытищи"],
    shouldWork: false,
    note: "Слабое окно. Если спрос слабый — лучше пауза."
  },
  {
    from: 13,
    to: 16,
    primary: "Москва-Сити",
    backup: "Патрики",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники", "Мытищи"],
    shouldWork: false,
    note: "Работай только при хорошем спросе, иначе отдыхай."
  },
  {
    from: 16,
    to: 18,
    primary: "Белорусская",
    backup: "Павелецкая",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники"],
    shouldWork: true,
    note: "Разгон вечернего пика. Заранее вставай в деловые точки."
  },
  {
    from: 18,
    to: 21,
    primary: "Москва-Сити",
    backup: "Белорусская",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники"],
    shouldWork: true,
    note: "Главное денежное время. Приоритет — длинные и дорогие поездки."
  },
  {
    from: 21,
    to: 23,
    primary: "Тверская",
    backup: "Патрики",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники", "Мытищи"],
    shouldWork: true,
    note: "Поздний вечер. Работай только по сильным точкам центра."
  },
  {
    from: 23,
    to: 6,
    primary: "Китай-город",
    backup: "Патрики",
    avoid: ["Балашиха", "Люберцы", "Реутов", "Котельники", "Мытищи"],
    shouldWork: false,
    note: "Ночью без спроса лучше закончить, а не кататься вслепую."
  }
];

function getCurrentRule(hour) {
  return SCHEDULE.find((s) =>
    s.from < s.to ? hour >= s.from && hour < s.to : hour >= s.from || hour < s.to
  );
}

function typeColor(type) {
  if (type === "strong") return "#22c55e";
  if (type === "medium") return "#f59e0b";
  if (type === "airport") return "#3b82f6";
  return "#ef4444";
}

function openYandexNavigator(point) {
  window.location.href = `yandexnavi://build_route_on_map?lat_to=${point.lat}&lon_to=${point.lng}`;
}

function haversineKm(a, b) {
  if (!a || !b) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * y;
}

function formatKm(value) {
  if (value == null) return "—";
  if (value < 10) return `${value.toFixed(1)} км`;
  return `${Math.round(value)} км`;
}

function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function fireNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [minutesStanding, setMinutesStanding] = useState(0);
  const [currentPointName, setCurrentPointName] = useState("ВДНХ");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const standStillSinceRef = useRef(null);
  const lastPositionRef = useRef(null);
  const lastMoveNotificationRef = useRef(0);
  const lastLineNotificationHourRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    setNotificationsEnabled(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Геолокация недоступна на этом устройстве.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(next);
        setLocationError("");

        const prev = lastPositionRef.current;
        lastPositionRef.current = next;

        if (!prev) {
          standStillSinceRef.current = Date.now();
          setMinutesStanding(0);
          return;
        }

        const movedKm = haversineKm(prev, next) || 0;
        if (movedKm < 0.12) {
          if (!standStillSinceRef.current) {
            standStillSinceRef.current = Date.now();
          }
        } else {
          standStillSinceRef.current = Date.now();
          setMinutesStanding(0);
          lastMoveNotificationRef.current = 0;
        }
      },
      (error) => {
        setLocationError(error.message || "Не удалось получить геолокацию.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!standStillSinceRef.current) return;
      const mins = Math.floor((Date.now() - standStillSinceRef.current) / 60000);
      setMinutesStanding(mins);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const currentRule = useMemo(() => getCurrentRule(hour), [hour]);
  const primaryPoint = currentRule ? POINTS[currentRule.primary] : null;
  const backupPoint = currentRule ? POINTS[currentRule.backup] : null;
  const currentPoint = POINTS[currentPointName] || null;

  useEffect(() => {
    if (!currentPoint || !backupPoint) return;
    const limit = currentPoint.type === "risk" ? 1 : currentPoint.waitLimit || 15;
    if (minutesStanding >= limit && lastMoveNotificationRef.current !== limit) {
      fireNotification("Переместитесь", `Ты стоишь уже ${minutesStanding} мин. Едь на ${backupPoint.name}.`);
      lastMoveNotificationRef.current = limit;
    }
  }, [minutesStanding, currentPoint, backupPoint]);

  useEffect(() => {
    if (!currentRule?.shouldWork) return;
    if (lastLineNotificationHourRef.current === hour) return;
    const minute = now.getMinutes();
    if (minute <= 5) {
      fireNotification("Пора выходить на линию", `Сейчас сильное окно. Цель — ${primaryPoint?.name || "центр"}.`);
      lastLineNotificationHourRef.current = hour;
    }
  }, [hour, now, currentRule, primaryPoint]);

  const primaryDistance = useMemo(() => haversineKm(currentLocation, primaryPoint), [currentLocation, primaryPoint]);
  const backupDistance = useMemo(() => haversineKm(currentLocation, backupPoint), [currentLocation, backupPoint]);

  const changePointAdvice = useMemo(() => {
    if (!currentPoint || !primaryPoint || !backupPoint) return "";
    const limit = currentPoint.type === "risk" ? 1 : currentPoint.waitLimit || 15;
    if (currentPoint.type === "risk") {
      return `Ты в слабой зоне. Не стой здесь — сразу смещайся на ${primaryPoint.name}.`;
    }
    if (minutesStanding >= limit + 5) {
      return `Ждать уже нельзя. Едь на ${backupPoint.name}.`;
    }
    if (minutesStanding >= limit) {
      return `Пора менять точку. Следующая — ${backupPoint.name}.`;
    }
    return `Пока можно стоять. Лимит ожидания здесь: ${limit} мин.`;
  }, [currentPoint, primaryPoint, backupPoint, minutesStanding]);

  const pauseAdvice = useMemo(() => {
    if (!currentRule) return "";
    if (!currentRule.shouldWork) {
      return "Сейчас лучше не работать, если нет сильного спроса.";
    }
    if (hour >= 11 && hour < 16) {
      return "Днём работай только в центре. Если тишина — делай паузу.";
    }
    return "Сейчас рабочее окно. Держись сильных точек.";
  }, [currentRule, hour]);

  const workWindowText = useMemo(() => {
    const offWindows = SCHEDULE.filter((s) => !s.shouldWork).map((s) => {
      const toText = (v) => String(v).padStart(2, "0") + ":00";
      return `${toText(s.from)}–${toText(s.to)}`;
    });
    return offWindows.join(" · ");
  }, []);

  const avoidPoints = useMemo(() => {
    if (!currentRule) return [];
    return currentRule.avoid.map((name) => POINTS[name]).filter(Boolean);
  }, [currentRule]);

  const mapPoints = useMemo(() => {
    const set = [primaryPoint, backupPoint, ...avoidPoints].filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const p of set) {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        unique.push(p);
      }
    }
    return unique;
  }, [primaryPoint, backupPoint, avoidPoints]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        padding: 12,
        maxWidth: 560,
        margin: "0 auto"
      }}
    >
      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Текущее время</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>
          {String(hour).padStart(2, "0") }:{String(now.getMinutes()).padStart(2, "0")}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#cbd5e1" }}>{currentRule?.note}</div>
      </div>

      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Геолокация и простой</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{minutesStanding} мин стоишь без движения</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "#93c5fd" }}>
          Если стоишь 15+ минут, приложение подскажет сместиться.
        </div>
        {locationError ? <div style={{ marginTop: 6, fontSize: 13, color: "#fca5a5" }}>{locationError}</div> : null}
      </div>

      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Где ты сейчас</div>
        <select
          value={currentPointName}
          onChange={(e) => setCurrentPointName(e.target.value)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #334155",
            padding: "0 12px",
            fontSize: 16
          }}
        >
          {Object.values(POINTS).map((point) => (
            <option key={point.name} value={point.name}>
              {point.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: "#111827", borderRadius: 18, overflow: "hidden", marginBottom: 12 }}>
        <MapContainer center={[55.76, 37.62]} zoom={10.8} style={{ height: "42vh", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapPoints.map((point) => (
            <CircleMarker
              key={point.name}
              center={[point.lat, point.lng]}
              radius={10}
              pathOptions={{
                color: typeColor(point.type),
                fillColor: typeColor(point.type),
                fillOpacity: 0.9
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{point.name}</div>
                  <div style={{ margin: "6px 0 10px", fontSize: 13 }}>
                    {point.name === primaryPoint?.name && `Главная точка · ${formatKm(primaryDistance)}`}
                    {point.name === backupPoint?.name && `Запасная точка · ${formatKm(backupDistance)}`}
                    {avoidPoints.some((p) => p.name === point.name) && "Зона, где не стоит стоять"}
                  </div>
                  <button
                    onClick={() => openYandexNavigator(point)}
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
                    Открыть навигатор
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {currentLocation ? (
            <CircleMarker
              center={[currentLocation.lat, currentLocation.lng]}
              radius={8}
              pathOptions={{ color: "#ffffff", fillColor: "#ffffff", fillOpacity: 1 }}
            >
              <Popup>Ты сейчас здесь</Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>

      {primaryPoint && (
        <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12, border: `1px solid ${typeColor(primaryPoint.type)}` }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Куда ехать сейчас</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{primaryPoint.name}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#cbd5e1" }}>Расстояние: {formatKm(primaryDistance)}</div>
          <button
            onClick={() => openYandexNavigator(primaryPoint)}
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
            Открыть навигатор
          </button>
        </div>
      )}

      {backupPoint && (
        <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12, border: `1px solid ${typeColor(backupPoint.type)}` }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Когда менять точку</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{changePointAdvice}</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#cbd5e1" }}>Запасная точка: {backupPoint.name} · {formatKm(backupDistance)}</div>
          <button
            onClick={() => openYandexNavigator(backupPoint)}
            style={{
              marginTop: 10,
              width: "100%",
              height: 46,
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#1f2937",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700
            }}
          >
            Навигатор до запасной точки
          </button>
        </div>
      )}

      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>Где не стоять</div>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {avoidPoints.map((point) => (
            <div
              key={point.name}
              style={{
                padding: 12,
                borderRadius: 12,
                background: "#1f2937",
                border: `1px solid ${typeColor(point.type)}`,
                color: "#fecaca",
                fontWeight: 700
              }}
            >
              {point.name}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>Когда лучше не работать</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{pauseAdvice}</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
          Слабые окна: {workWindowText}
        </div>
      </div>

      <div style={{ background: "#111827", borderRadius: 18, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>Уведомления</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
          {notificationsEnabled ? "Уведомления включены" : "Нажми разрешить уведомления в браузере"}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
          Приложение может подсказать, когда пора переместиться и когда выходить на линию.
        </div>
      </div>
    </div>
  );
}
