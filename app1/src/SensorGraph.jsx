import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function SensorGraph({ data, valueKey, color, title }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 13px #22223b11",
      padding: 20,
      marginBottom: 26,
      minWidth: 320,
      maxWidth: 740,
      width: "100%"
    }}>
      <h3 style={{
        margin: "0 0 1em 0", color: "#006400", fontWeight: 900, fontSize: "1.15rem",
        letterSpacing: ".01em"
      }}>{title}</h3>
      <ResponsiveContainer width="100%" height={230}>
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
