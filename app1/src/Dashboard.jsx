import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import GaugeComponent from "react-gauge-component";
import LiquidGauge from "react-liquid-gauge";
import { Gauge, Thermometer, Drop } from "phosphor-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Generic graph for any metric
function SensorGraph({ data, valueKey, color, title }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 15,
      boxShadow: "0 2px 13px #22223b11",
      padding: 16,
      width: "100%",
      flex: 1
    }}>
      <h4 style={{
        margin: "0 0 0.6em 0",
        color: "#006400",
        fontWeight: 800,
        fontSize: "1.04rem",
        letterSpacing: ".008em"
      }}>{title}</h4>
      <ResponsiveContainer width="99%" height={170}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ef" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={valueKey} stroke={color} dot={false} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashMetric({ icon, children }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 15,
      padding: 20,
      width: "100%",
      maxWidth: 300,
      boxShadow: "0 2px 14px #c5ff7420",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1
    }}>
      <div style={{
        background: "#c5ff74", borderRadius: "50%",
        width: 42, height: 42, display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 12, boxShadow: "0 1px 7px #bae77145"
      }}>{icon}</div>
      {children}
    </div>
  );
}

function MetricSection({ metricCard, graph }) {
  return (
    <div style={{
      display: "flex",
      gap: 20,
      width: "100%",
      maxWidth: 800,
      marginBottom: 20
    }}>
      {metricCard}
      {graph}
    </div>
  );
}

export default function Dashboard() {
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
        flow: fresh.flowread || 0,
        temp: fresh.temp || 0,
        level
      };
      setHistory(prev => [...prev.slice(-29), entry]);
    });
    return () => unsubscribe();
  }, []);

  const levelValue = data.string ? Number(String(data.string).replace(/[^\d]/g, "")) : 0;
  const accent = "#006400";
  const iconColor = "#22223b";
  const labelColor = "#22223b";
  const muted = "#f8f8fa";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;400&display=swap" rel="stylesheet" />
      <div style={{
        position: "fixed",
        inset: 0,
        minHeight: "100vh",
        minWidth: "100vw",
        height: "100vh",
        width: "100vw",
        background: "#22223b",
        fontFamily: "'Nunito',sans-serif",
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        overflowY: "auto"
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

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          maxWidth: 1200,
          alignItems: "center"
        }}>
          {/* Temperature */}
          <MetricSection
            metricCard={
              <DashMetric icon={<Thermometer size={29} weight="duotone" color={iconColor} />}>
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
              </DashMetric>
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
            metricCard={
              <DashMetric icon={<Drop size={29} weight="duotone" color={iconColor} />}>
                <LiquidGauge
                  value={levelValue}
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
              </DashMetric>
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
            metricCard={
              <DashMetric icon={<Gauge size={29} weight="duotone" color={iconColor} />}>
                <GaugeComponent
                  type="semicircle"
                  minValue={0}
                  maxValue={100}
                  value={data.flowread || 0}
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
              </DashMetric>
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
      </div>
    </>
  );
}