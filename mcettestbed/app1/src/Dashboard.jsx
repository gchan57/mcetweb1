import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import GaugeComponent from "react-gauge-component";
import LiquidGauge from "react-liquid-gauge";
import { Gauge, Thermometer, Drop, Download } from "phosphor-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [history, setHistory] = useState([]);
  const [maxLevel, setMaxLevel] = useState(80);
  const [maxTemp, setMaxTemp] = useState(40);
  const [maxFlow, setMaxFlow] = useState(60);
  const [alerts, setAlerts] = useState([]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const dataRef = ref(db, "/test");
    return onValue(dataRef, (snap) => {
      const fresh = snap.val() || {};
      setData(fresh);

      const levelRaw = fresh.string || "";
      const levelParsed = parseFloat(levelRaw.toString().replace(/[^\d.]/g, "")) || 0;
      const levelValue = Math.min(levelParsed, 100);

      const now = new Date();
      setHistory((prev) => [
        ...prev,
        {
          time: now.toLocaleTimeString(),
          timestamp: now.getTime(),
          flow: fresh.flowread || 0,
          temp: fresh.temp || 0,
          level: levelValue,
        },
      ]);
    });
  }, []);

  const levelValue = Math.min(
    parseFloat((data.string || "0").toString().replace(/[^\d.]/g, "")) || 0,
    100
  );
  const flowValue = parseFloat(data.flowread) || 0;
  const tempValue = parseFloat(data.temp) || 0;

  useEffect(() => {
    const newAlerts = [];
    if (levelValue < maxLevel)
      newAlerts.push(`Coolant level below threshold (${levelValue}% < ${maxLevel}%)`);
    if (tempValue > maxTemp)
      newAlerts.push(`Temperature exceeded threshold (${tempValue}°C > ${maxTemp}°C)`);
    if (flowValue > maxFlow)
      newAlerts.push(`Flow rate exceeded threshold (${flowValue}L/min > ${maxFlow}L/min)`);
    setAlerts(newAlerts);

    if (newAlerts.length > 0) {
      speak(newAlerts.join(". "));
    }
  }, [levelValue, tempValue, flowValue, maxLevel, maxTemp, maxFlow]);

  const downloadCSV = () => {
    const latestData = history.slice(-100);
    if (latestData.length === 0) {
      alert("No data available to download yet. Please wait for data to load.");
      return;
    }
    const headers = "Time,Temperature (°C),Coolant Level (%),Flow Rate (L/min)\n";
    const csvContent =
      headers +
      latestData
        .map((row) => `"${row.time}",${row.temp},${row.level},${row.flow}`)
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sensor_data_last_100_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const ThresholdSlider = ({ label, value, setValue, max, unit }) => (
    <div style={{ background: "#fff", padding: 12, borderRadius: 8, width: "100%" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      <div style={{ fontWeight: 700, color: "#006400", marginTop: 4 }}>
        {value} {unit}
      </div>
    </div>
  );

  const MetricCard = ({ icon, children }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: 14,
        flex: 1,
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: 10 }}>{icon}</div>
      {children}
    </div>
  );

  const GraphCard = ({ title, valueKey, color }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: 10,
        flex: 2,
        minWidth: 300,
        height: "100%",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ height: "calc(100% - 30px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid stroke="#eee" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              interval={Math.floor(history.length / 5)}
            />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#f9fafb",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 20px 0",
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#006400",
          }}
        >
          Coolant Dashboard
        </div>
        <button
          onClick={downloadCSV}
          style={{
            background: "#006400",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          <Download size={18} />
          Export  Reads
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          padding: 20,
          overflow: "auto",
          height: "calc(100vh - 80px)",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 300,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <ThresholdSlider
            label="Min Coolant Level Threshold"
            value={maxLevel}
            setValue={setMaxLevel}
            max={100}
            unit="%"
          />
          <ThresholdSlider
            label="Max Temperature Threshold"
            value={maxTemp}
            setValue={setMaxTemp}
            max={50}
            unit="°C"
          />
          <ThresholdSlider
            label="Max Flow Rate Threshold"
            value={maxFlow}
            setValue={setMaxFlow}
            max={100}
            unit="L/min"
          />

          <div
            style={{
              flex: 1,
              overflow: "auto",
              minHeight: 100,
              maxHeight: 300,
            }}
          >
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffe8e8",
                  color: "#b00020",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                {alert}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            minWidth: 600,
          }}
        >
          {/* Temperature Section */}
          <div
            style={{
              display: "flex",
              gap: 20,
              height: "33%",
              minHeight: 200,
            }}
          >
            <MetricCard icon={<Thermometer size={28} />}>
              <GaugeComponent
                type="semicircle"
                minValue={0}
                maxValue={50}
                value={tempValue}
                pointer={{ color: "#006400" }}
                arc={{
                  subArcs: [
                    { limit: 15, color: "#018786" },
                    { limit: 25, color: "#8bc34a" },
                    { limit: 35, color: "#fbc02d" },
                    { limit: 50, color: "#006400" },
                  ],
                  width: 0.14,
                }}
                labels={{
                  valueLabel: {
                    formatTextValue: (v) => `${v} °C`,
                    style: { fill: "#333", fontWeight: 700 },
                  },
                }}
                style={{ width: "100%", margin: "0 auto" }}
              />
            </MetricCard>
            <GraphCard title="Temperature" valueKey="temp" color="#e28c1e" />
          </div>

          {/* Water Level Section */}
          <div
            style={{
              display: "flex",
              gap: 20,
              height: "33%",
              minHeight: 200,
            }}
          >
            <MetricCard icon={<Drop size={28} />}>
              <LiquidGauge
                value={levelValue}
                min={0}
                max={100}
                width={110}
                height={110}
                waveStyle={{ fill: "#006400", opacity: 0.5 }}
                textStyle={{ fill: "#333" }}
                textRenderer={({ value }) => (
                  <tspan>
                    <tspan style={{ fontWeight: 700 }}>{Math.round(value)}</tspan>
                    <tspan style={{ fontSize: "0.7em" }}>%</tspan>
                  </tspan>
                )}
              />
            </MetricCard>
            <GraphCard title="Coolant Level" valueKey="level" color="#2bcf85" />
          </div>

          {/* Flow Rate Section */}
          <div
            style={{
              display: "flex",
              gap: 20,
              height: "33%",
              minHeight: 200,
            }}
          >
            <MetricCard icon={<Gauge size={28} />}>
              <GaugeComponent
                type="semicircle"
                minValue={0}
                maxValue={100}
                value={flowValue}
                pointer={{ color: "#006400" }}
                arc={{
                  subArcs: [
                    { limit: 20, color: "#EA4228" },
                    { limit: 40, color: "#F5CD19" },
                    { limit: 100, color: "#006400" },
                  ],
                  width: 0.14,
                }}
                labels={{
                  valueLabel: {
                    formatTextValue: (v) => `${v} L/min`,
                    style: { fill: "#333", fontWeight: 700 },
                  },
                }}
                style={{ width: "100%", margin: "0 auto" }}
              />
            </MetricCard>
            <GraphCard title="Flow Rate" valueKey="flow" color="#0487d9" />
          </div>
        </div>
      </div>
    </div>
  );
}
