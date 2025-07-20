import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Usage: <SensorGraph data={history} valueKey="flow" color="#0487d9" title="Flow Rate History" />
export default function SensorGraph({ data, valueKey, color, title }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 2px 14px #c5ff7420",
      padding: 24,
      margin: "32px 0 24px 0",
      minWidth: 300,
      maxWidth: 650,
      width: "100%"
    }}>
      <h3 style={{
        margin: "0 0 1.2em 0", color: "#006400", fontWeight: 800, fontSize: "1.13rem"
      }}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={valueKey} stroke={color} dot={false} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
