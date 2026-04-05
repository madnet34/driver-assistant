import React, { useEffect, useState } from "react";

const POINTS = [
  { name: "Белорусская", lat: 55.774, lng: 37.581 },
  { name: "Тверская", lat: 55.765, lng: 37.603 },
  { name: "Москва-Сити", lat: 55.747, lng: 37.536 },
  { name: "Павелецкая", lat: 55.729, lng: 37.637 },
  { name: "ВДНХ", lat: 55.829, lng: 37.637 },
  { name: "Проспект Мира", lat: 55.776, lng: 37.642 }
];

const SCHEDULE = [
  { from: 6, to: 7, points: ["ВДНХ", "Проспект Мира"] },
  { from: 7, to: 9, points: ["Проспект Мира","Белорусская","Тверская"] },
  { from: 9, to: 11, points: ["Тверская","Белорусская","Москва-Сити"] },
  { from: 11, to: 16, points: ["Москва-Сити"] },
  { from: 16, to: 18, points: ["Белорусская","Павелецкая","Москва-Сити"] },
  { from: 18, to: 21, points: ["Москва-Сити","Белорусская"] },
  { from: 21, to: 23, points: ["Тверская","Центр"] },
  { from: 23, to: 6, points: ["Центр"] }
];

export default function App() {
  const [hour, setHour] = useState(new Date().getHours());
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setHour(h);

      const current = SCHEDULE.find(s =>
        s.from < s.to ? (h >= s.from && h < s.to) : (h >= s.from || h < s.to)
      );

      const active = current.points
        .map(name => POINTS.find(p => p.name === name))
        .filter(Boolean);

      setPoints(active);
    };

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const openNavigator = (lat, lng) => {
    window.location.href = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
  };

  return (
    <div style={{
      padding: 16,
      fontFamily: "Arial",
      background: "#0f172a",
      color: "white",
      minHeight: "100vh"
    }}>
      <h2 style={{marginBottom:10}}>🚕 Куда ехать сейчас</h2>

      <div style={{
        background:"#1e293b",
        padding:12,
        borderRadius:12,
        marginBottom:16
      }}>
        <div style={{fontSize:14,color:"#94a3b8"}}>Текущее время</div>
        <div style={{fontSize:28,fontWeight:"bold"}}>{hour}:00</div>
      </div>

      {points.map(p => (
        <div key={p.name} style={{
          background:"#1e293b",
          padding:16,
          borderRadius:16,
          marginBottom:12
        }}>
          <div style={{fontSize:18,fontWeight:"bold"}}>{p.name}</div>

          <button
            onClick={() => openNavigator(p.lat, p.lng)}
            style={{
              marginTop:10,
              width:"100%",
              height:50,
              borderRadius:12,
              border:"none",
              background:"#22c55e",
              color:"white",
              fontSize:16,
              fontWeight:"bold"
            }}
          >
            🚗 Поехать сюда
          </button>
        </div>
      ))}

      <div style={{marginTop:20,fontSize:12,color:"#94a3b8"}}>
        Обновляется автоматически
      </div>
    </div>
  );
}
