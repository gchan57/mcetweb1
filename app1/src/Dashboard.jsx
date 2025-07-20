import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";


function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const dataRef = ref(db, "/"); // Adjust if your data is nested
    const unsubscribe = onValue(dataRef, (snapshot) => {
      setData(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ margin: "2rem", fontFamily: "sans-serif" }}>
      <h2>Firebase Data Dashboard</h2>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td><strong>Flow Read</strong></td>
            <td>{data.flowread}</td>
          </tr>
          <tr>
            <td><strong>String</strong></td>
            <td>{data.string}</td>
          </tr>
          <tr>
            <td><strong>Temp</strong></td>
            <td>{data.temp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default Dashboard;
