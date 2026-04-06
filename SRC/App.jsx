import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [loc, setLoc] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => {
      setLoc([p.coords.latitude, p.coords.longitude]);
    });
  }, []);

  return (
    <div style={{height:"100vh"}}>
      <MapContainer center={loc || [55.75,37.61]} zoom={11} style={{height:"100%"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {loc && <Marker position={loc}/>}
      </MapContainer>
    </div>
  );
}