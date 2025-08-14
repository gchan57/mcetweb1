
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import GaugeComponent from "react-gauge-component";
import LiquidGauge from "react-liquid-gauge";
import { Gauge, Thermometer, Drop, Download, ArrowUp, ArrowDown, Minus } from "phosphor-react";
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
import "./Dashboard.css";
import AIAnalysis from "./AIAnalysis";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [history, setHistory] = useState([]);
  const [maxLevel, setMaxLevel] = useState(80);
  const [maxTemp, setMaxTemp] = useState(40);
  const [maxFlow, setMaxFlow] = useState(60);
  const [alerts, setAlerts] = useState([]);

  // Store previous values for trend calculation
  const [prevValues, setPrevValues] = useState({
    temp: 0,
    level: 0,
    flow: 0,
  });

  const speak = (text) => {
    if ("speechSynthesis" in window) {
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
      const levelParsed =
        parseFloat(levelRaw.toString().replace(/[^\d.]/g, "")) || 0;
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

  // Calculate trend direction
  const getTrend = (current, previous) => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  };

  const tempTrend = getTrend(tempValue, prevValues.temp);
  const levelTrend = getTrend(levelValue, prevValues.level);
  const flowTrend = getTrend(flowValue, prevValues.flow);

  // Update previous values for next calculation
  useEffect(() => {
    setPrevValues({
      temp: tempValue,
      level: levelValue,
      flow: flowValue,
    });
  }, [tempValue, levelValue, flowValue]);

  // Coolant health index (simple formula for demo)
  const coolantHealth = Math.max(
    0,
    100 -
      (Math.abs(tempValue - 25) * 2 +
        (maxLevel - levelValue) * 0.8 +
        Math.max(0, flowValue - maxFlow) * 1.5)
  ).toFixed(0);

  useEffect(() => {
    const newAlerts = [];
    if (levelValue < maxLevel)
      newAlerts.push(
        `Coolant level below threshold (${levelValue}% < ${maxLevel}%)`
      );
    if (tempValue > maxTemp)
      newAlerts.push(
        `Temperature exceeded threshold (${tempValue}°C > ${maxTemp}°C)`
      );
    if (flowValue > maxFlow)
      newAlerts.push(
        `Flow rate exceeded threshold (${flowValue}L/min > ${maxFlow}L/min)`
      );
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
    const headers =
      "Time,Temperature (°C),Coolant Level (%),Flow Rate (L/min)\n";
    const csvContent =
      headers +
      latestData
        .map((row) => `"${row.time}",${row.temp},${row.level},${row.flow}`)
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sensor_data_last_100_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const ThresholdSlider = ({ label, value, setValue, max, unit }) => (
    <div className="threshold-slider">
      <div className="label">{label}</div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className="value">
        {value} {unit}
      </div>
    </div>
  );

  const MetricCard = ({ icon, trend, children }) => (
    <div className="metric-card">
      <div className="metric-card-header">
        {icon}
        {trend === "up" && <ArrowUp color="red" />}
        {trend === "down" && <ArrowDown color="green" />}
        {trend === "stable" && <Minus color="gray" />}
      </div>
      {children}
    </div>
  );

  const GraphCard = ({ title, valueKey, color }) => (
    <div className="graph-card">
      <div className="graph-card-title">{title}</div>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval={Math.floor(history.length / 5)}
            />
            <YAxis tick={{ fontSize: 12 }} />
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
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div>
          <div className="header-title">Coolant Dashboard</div>
          <div
            className="health-index"
            style={{
              color:
                coolantHealth > 70
                  ? "#28a745"
                  : coolantHealth > 40
                  ? "#ffc107"
                  : "#dc3545",
            }}
          >
            Health Index: {coolantHealth}%
          </div>
        </div>
        <button onClick={downloadCSV} className="export-button">
          <Download size={18} />
          Export Reads
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
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

          <div className="alerts-container">
            {alerts.map((alert, idx) => (
              <div key={idx} className="alert">
                {alert}
              </div>
            ))}
          </div>
          <AIAnalysis history={history} />
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Temperature */}
          <div className="metric-row">
            <MetricCard icon={<Thermometer size={32} />} trend={tempTrend}>
              <GaugeComponent
                type="semicircle"
                minValue={0}
                maxValue={50}
                value={tempValue}
                pointer={{ color: "#333" }}
                arc={{
                  subArcs: [
                    { limit: 15, color: "#5cb85c" },
                    { limit: 25, color: "#f0ad4e" },
                    { limit: 35, color: "#d9534f" },
                    { limit: 50, color: "#d9534f" },
                  ],
                  width: 0.2,
                  padding: 0.005
                }}
                labels={{
                  valueLabel: {
                    formatTextValue: (v) => `${v} °C`,
                    style: { fontSize: "20px", fill: "#333", fontWeight: "bold" },
                  },
                }}
              />
            </MetricCard>
            <GraphCard title="Temperature" valueKey="temp" color="#e28c1e" />
          </div>

          {/* Level */}
          <div className="metric-row">
            <MetricCard icon={<Drop size={32} />} trend={levelTrend}>
              <LiquidGauge
                value={levelValue}
                min={0}
                max={100}
                width={120}
                height={120}
                waveStyle={{ fill: "#4a90e2" }}
                textStyle={{ fill: "#333" }}
                textRenderer={({ value }) => (
                  <tspan>
                    <tspan style={{ fontWeight: 700, fontSize: "24px" }}>{Math.round(value)}</tspan>
                    <tspan style={{ fontSize: "14px" }}>%</tspan>
                  </tspan>
                )}
              />
            </MetricCard>
            <GraphCard title="Coolant Level" valueKey="level" color="#2bcf85" />
          </div>

          {/* Flow */}
          <div className="metric-row">
            <MetricCard icon={<Gauge size={32} />} trend={flowTrend}>
              <GaugeComponent
                type="semicircle"
                minValue={0}
                maxValue={100}
                value={flowValue}
                pointer={{ color: "#333" }}
                arc={{
                  subArcs: [
                    { limit: 20, color: "#d9534f" },
                    { limit: 40, color: "#f0ad4e" },
                    { limit: 100, color: "#5cb85c" },
                  ],
                  width: 0.2,
                  padding: 0.005
                }}
                labels={{
                  valueLabel: {
                    formatTextValue: (v) => `${v} L/min`,
                    style: { fontSize: "20px", fill: "#333", fontWeight: "bold" },
                  },
                }}
              />
            </MetricCard>
            <GraphCard title="Flow Rate" valueKey="flow" color="#0487d9" />
          </div>
        </div>
      </div>
    </div>
  );
}
