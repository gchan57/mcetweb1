import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import GaugeComponent from "react-gauge-component";
import LiquidGauge from "react-liquid-gauge";
import { Gauge, Thermometer, Drop } from "phosphor-react";
import SensorGraph from "./SensorGraph";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const dataRef = ref(db, "/test");
    const unsubscribe = onValue(dataRef, snap => {
      const fresh = snap.val() || {};
      setData(fresh);

      // For water level, parse "string" field e.g. "value68" => 68
      const level = fresh.string ? Number(String(fresh.string).replace(/[^\d]/g, "")) : 0;
      const now = new Date();
      const entry = {
        time: now.toLocaleTimeString(),
        flow: fresh.flow || 0,
        temp: fresh.temp || 0,
        level
      };
      setHistory(prev => [...prev.slice(-29), entry]); // save last 30
    });
    return () => unsubscribe();
  }, []);

  const levelValue = data.string ? Number(String(data.string).replace(/[^\d]/g, "")) : 0;

  // FreeCodeCamp palette & theme colors
  const bg = "#22223b";
  const accent = "#006400";
  const iconColor = "#22223b";
  const iconBg = "#c5ff74";
  const labelColor = "#22223b";
  const muted = "#f8f8fa";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;400&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: bg,
        padding: 0,
        margin: 0,
        fontFamily: "'Nunito',sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{
          textAlign: "center",
          color: accent,
          fontWeight: 900,
          fontSize: "2.1rem",
          margin: "45px 0 18px",
          letterSpacing: ".045em"
        }}>
          Sensor Dashboard
        </h2>

        {/* GRAPHS */}
        <div style={{
          display: "flex",
          gap: 28,
          maxWidth: "2100px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <SensorGraph data={history} valueKey="flow" color="#0487d9" title="Flow Rate - Last 30 samples" />
          <SensorGraph data={history} valueKey="temp" color="#e28c1e" title="Temperature - Last 30 samples" />
          <SensorGraph data={history} valueKey="level" color="#2bcf85" title="Water Level - Last 30 samples" />
        </div>

        {/* CARDS */}
        <div style={{
          display: "flex",
          gap: 36,
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
          maxWidth: "1100px",
          width: "100%",
        }}>
          {/* Flow Gauge */}
          <DashCard>
            <IconCircle icon={<Gauge size={32} weight="duotone" color={iconColor} />} iconBg={iconBg} />
            <GaugeComponent
              type="semicircle"
              minValue={0}
              maxValue={100}
              value={data.flow || 0}
              pointer={{ color: accent, length: 0.82, width: 13 }}
              arc={{
                subArcs: [
                  { limit: 20, color: "#EA4228" },
                  { limit: 40, color: "#F5CD19" },
                  { limit: 100, color: accent }
                ],
                width: 0.14
              }}
              labels={{
                valueLabel: {
                  formatTextValue: v => `${v} L/min`,
                  style: { fill: labelColor, fontWeight: 800 }
                }
              }}
              style={{ width: "100%", margin: "0 auto" }}
            />
            <Label>Flow Rate</Label>
          </DashCard>

          {/* Water Level */}
          <DashCard>
            <IconCircle icon={<Drop size={32} weight="duotone" color={iconColor} />} iconBg={iconBg} />
            <LiquidGauge
              value={levelValue}
              min={0}
              max={100}
              width={145}
              height={145}
              riseAnimation
              waveAnimation
              waveFrequency={1.1}
              waveAmplitude={1.3}
              circleStyle={{ fill: muted }}
              waveStyle={{ fill: accent, opacity: 0.50 }}
              textStyle={{ fill: iconColor, fontFamily: "Nunito, sans-serif" }}
              textRenderer={({ value }) =>
                <tspan>
                  <tspan className='value' style={{ fontWeight: 700 }}>
                    {Math.round(value)}
                  </tspan>
                  <tspan className='percent' style={{ fontSize: "0.7em", fill: accent }}> %</tspan>
                </tspan>
              }
            />
            <Label>Water Level</Label>
          </DashCard>

          {/* Temperature */}
          <DashCard>
            <IconCircle icon={<Thermometer size={32} weight="duotone" color={iconColor} />} iconBg={iconBg} />
            <GaugeComponent
              type="semicircle"
              minValue={0}
              maxValue={50}
              value={data.temp || 0}
              pointer={{ color: accent, length: 0.8, width: 13 }}
              arc={{
                subArcs: [
                  { limit: 15, color: "#018786" },
                  { limit: 25, color: "#8bc34a" },
                  { limit: 35, color: "#fbc02d" },
                  { limit: 50, color: accent }
                ],
                width: 0.14
              }}
              labels={{
                valueLabel: {
                  formatTextValue: v => `${v} °C`,
                  style: { fill: labelColor, fontWeight: 800 }
                }
              }}
              style={{ width: "100%", margin: "0 auto" }}
            />
            <Label>Temperature</Label>
          </DashCard>
        </div>
      </div>
    </>
  );
}

// --- Supporting Components ---

function DashCard({ children }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      padding: 28,
      boxShadow: "0 2px 14px #c5ff7420",
      minWidth: 220,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 28,
    }}>
      {children}
    </div>
  );
}

function IconCircle({ icon, iconBg }) {
  return (
    <div style={{
      background: iconBg,
      borderRadius: "50%",
      width: 48,
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      boxShadow: "0 1px 7px #bae77145"
    }}>
      {icon}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      textAlign: "center",
      fontWeight: 800,
      fontSize: "1.07rem",
      color: "#006400",
      marginTop: 9,
      letterSpacing: ".01em",
    }}>
      {children}
    </div>
  );
}
