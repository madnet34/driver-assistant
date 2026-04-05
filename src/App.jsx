import React, { useState } from "react";

const GOOD_ZONES = ["Центр / Садовое","Москва-Сити","Белорусская","Павелецкая","Киевская"];
const MID_ZONES = ["ВДНХ","Алексеевская","Проспект Мира"];
const BAD_ZONES = ["Балашиха","Люберцы","Реутов","Котельники","Мытищи","За МКАД"];
const ZONES = [...GOOD_ZONES, ...MID_ZONES, ...BAD_ZONES, "Аэропорт"];

function rpm(price, minutes) {
  return Math.round((price / minutes) * 10) / 10;
}

function getAdvice(hour) {
  if(hour>=6 && hour<7) return "ВДНХ → Проспект Мира";
  if(hour>=7 && hour<9) return "Проспект Мира → Белорусская → Тверская";
  if(hour>=9 && hour<11) return "Тверская / Белорусская / Сити";
  if(hour>=11 && hour<16) return "Сити или отдых";
  if(hour>=16 && hour<18) return "Белорусская / Павелецкая / Сити";
  if(hour>=18 && hour<21) return "Сити или Белорусская";
  if(hour>=21 && hour<23) return "Центр / Патрики";
  return "Ночь — центр";
}

export default function App() {
  const [price,setPrice]=useState(900);
  const [minutes,setMinutes]=useState(25);
  const [pickup,setPickup]=useState(2);
  const [hour,setHour]=useState(new Date().getHours());
  const [destination,setDestination]=useState("Центр / Садовое");

  const total = minutes + pickup * 2.5;
  const value = rpm(price,total);

  let verdict = "БРАТЬ";
  if(pickup > 5) verdict = "НЕ БРАТЬ";
  else if(value < 25) verdict = "НЕ БРАТЬ";
  else if(value < 30) verdict = "СЛАБО";

  if(BAD_ZONES.includes(destination)) verdict = "НЕ БРАТЬ";

  const advice = getAdvice(hour);

  return (
    <div style={{padding:20,fontFamily:"Arial"}}>
      <h2>🚕 Ассистент водителя</h2>

      <p>Цена</p>
      <input value={price} onChange={e=>setPrice(e.target.value)} />

      <p>Минуты</p>
      <input value={minutes} onChange={e=>setMinutes(e.target.value)} />

      <p>Подача км</p>
      <input value={pickup} onChange={e=>setPickup(e.target.value)} />

      <p>Час</p>
      <input value={hour} onChange={e=>setHour(e.target.value)} />

      <p>Куда везёт</p>
      <select value={destination} onChange={e=>setDestination(e.target.value)}>
        {ZONES.map(z => <option key={z}>{z}</option>)}
      </select>

      <h2>{verdict}</h2>
      <p>{value} ₽/мин</p>

      <h3>Куда ехать:</h3>
      <p>{advice}</p>

      <div style={{marginTop:20}}>
        <button onClick={()=>{setPrice(700);setMinutes(20);setPickup(2)}}>Короткий</button>
        <button onClick={()=>{setPrice(1200);setMinutes(40);setPickup(3)}}>Длинный</button>
        <button onClick={()=>{setPrice(2200);setMinutes(55);setPickup(3);setDestination("Аэропорт")}}>Аэропорт</button>
      </div>
    </div>
  );
}
