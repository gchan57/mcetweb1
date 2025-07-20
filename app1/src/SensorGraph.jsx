import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import GaugeComponent from "react-gauge-component";
import LiquidGauge from "react-liquid-gauge";
import { Gauge, Thermometer, Drop } from "phosphor-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Inline graph component matching your style
function SensorGraph({ data, valueKey, color, title }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 13px #22223b11",
      padding: 20,
      marginBottom: 0,
      minWidth: 320,
      maxWidth: 420,
      width: "100%"
    }}>
      <h3 style={{
        margin: "0 0 1em 0", color: "#006400", fontWeight: 900, fontSize: "1.05rem",
        letterSpacing: ".01em"
      }}>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ef" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={valueKey} stroke={color} dot={false} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CombinedDashboard() {
  const [data, setData] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const dataRef = ref(db, "/test");
    const unsubscribe = onValue(dataRef, snap => {
      const fresh = snap.val() || {};
      setData(fresh);

      const level = fresh.string ? Number(String(fresh.string).replace(/[^\d]/g, "")) : 0;
      const now = new Date();
      const entry = {
        time: now.toLocaleTimeString(),
        temp: fresh.temp || 0,
        level,
        flow: fresh.flow || 0
      };
      setHistory(prev => [...prev.slice(-29), entry]);
    });
    return () => unsubscribe();
  }, []);

  // Theming
  const accent = "#006400";
  const iconColor = "#22223b";
  const iconBg = "#c5ff74";
  const labelColor = "#22223b";
  const muted = "#f8f8fa";

  // Card creator
  function MetricSection({ icon, meter, graph }) {
    return (
      <div style={{
        display: "flex",
        gap: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 38,
        flexWrap: "wrap"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 2px 14px #c5ff7420",
          minWidth: 210,
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: "1 1 220px"
        }}>
          <div style={{
            background: iconBg,
            borderRadius: "50%",
            width: 47,
            height: 47,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            boxShadow: "0 1px 7px #bae77145"
          }}>
            {icon}
          </div>
          {meter}
        </div>
        {graph}
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;400&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        background: "#22223b",
        fontFamily: "'Nunito',sans-serif",
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{
          color: accent,
          fontWeight: 900,
          fontSize: "2.05rem",
          letterSpacing: ".045em",
          margin: "20px 0 36px"
        }}>
          Professional Sensor Dashboard
        </h2>

        {/* Temperature */}
        <MetricSection
          icon={<Thermometer size={29} weight="duotone" color={iconColor} />}
          meter={
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
          }
          graph={
            <SensorGraph
              data={history}
              valueKey="temp"
              color="#e28c1e"
              title="Temperature History"
            />
          }
        />

        {/* Water Level */}
        <MetricSection
          icon={<Drop size={29} weight="duotone" color={iconColor} />}
          meter={
            <LiquidGauge
              value={data.string ? Number(String(data.string).replace(/[^\d]/g, "")) : 0}
              min={0}
              max={100}
              width={130}
              height={130}
              riseAnimation
              waveAnimation
              waveFrequency={1.1}
              waveAmplitude={1.3}
              circleStyle={{ fill: muted }}
              waveStyle={{ fill: accent, opacity: 0.50 }}
              textStyle={{ fill: iconColor, fontFamily: "Nunito, sans-serif" }}
              textRenderer={({ value }) => (
                <tspan>
                  <tspan className="value" style={{ fontWeight: 700 }}>
                    {Math.round(value)}
                  </tspan>
                  <tspan className="percent" style={{ fontSize: "0.7em", fill: accent }}>
                    %
                  </tspan>
                </tspan>
              )}
            />
          }
          graph={
            <SensorGraph
              data={history}
              valueKey="level"
              color="#2bcf85"
              title="Water Level History"
            />
          }
        />

        {/* Flow Rate */}
        <MetricSection
          icon={<Gauge size={29} weight="duotone" color={iconColor} />}
          meter={
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
          }
          graph={
            <SensorGraph
              data={history}
              valueKey="flow"
              color="#0487d9"
              title="Flow Rate History"
            />
          }
        />
      </div>
    </>
  );
}
