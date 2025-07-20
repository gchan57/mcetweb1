import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(db, "/test"); // Use your node path here
    const unsubscribe = onValue(dataRef, (snapshot) => {
      setData(snapshot.val() || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;400&display=swap" rel="stylesheet" />
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(120deg,#c2e9fb 0%,#a1c4fd 100%)",
          padding: "48px 0",
          fontFamily: "'Nunito',sans-serif"
        }}>
        <h2
          style={{
            textAlign: "center",
            color: "#184d8b",
            fontWeight: 900,
            fontSize: "2.3rem",
            marginBottom: "32px",
            letterSpacing: "0.04em"
          }}
        >
          🛠️ Real-time Sensor Dashboard
        </h2>
        <div
          style={{
            maxWidth: 420,
            margin: "0 auto",
            padding: "2rem",
            background: "white",
            borderRadius: "1.4rem",
            boxShadow: "0 8px 32px 0 rgba(50,80,138,0.12)",
            border: "1px solid #e3f0fd"
          }}>
          {loading ? (
            <p style={{ color: "#219ebc", textAlign: "center" }}>Loading...</p>
          ) : (
            <dl style={{ margin: 0 }}>
              <SensorItem label="Flow Rate" value={data.flow} unit="L/min" accent="#4f8cff"/>
              <SensorItem label="Temperature" value={data.temp} unit="°C" accent="#ff9e6d" />
              <SensorItem label="Water Level" value={data.value} unit="cm" accent="#00b295" />
            </dl>
          )}
        </div>
      </div>
    </>
  );
}

function SensorItem({ label, value, unit, accent }) {
  return (
    <div
      style={{
        marginBottom: "1.3em",
        padding: "1em 1.2em",
        background: `linear-gradient(90deg,${accent}11 40%,transparent 100%)`,
        borderRadius: "0.8em",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 700,
        fontSize: "1.15rem",
        boxShadow: "0 1px 5px 0 #8cc8fe0d"
      }}
    >
      <span style={{ color: accent }}>{label}</span>
      <span style={{ color: "#14375a", letterSpacing: "0.02em" }}>
        {value !== undefined ? value : "—"}
        {unit && value !== undefined ? <span style={{ color: "#7b8794" }}> {unit}</span> : null}
      </span>
    </div>
  );
}

export default Dashboard;
