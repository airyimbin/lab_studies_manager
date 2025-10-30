import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [hello, setHello] = React.useState("loading…");
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    fetch("/api/hello").then(r => r.json()).then(d => setHello(d.hello)).catch(()=>setHello("error"));
    fetch("/api/items").then(r => r.json()).then(setItems).catch(()=>setItems([]));
  }, []);

  const addItem = async () => {
    const name = prompt("New item tesasting name?");
    if (!name) return;
    await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const updated = await fetch("/api/items").then(r => r.json());
    setItems(updated);
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Testing</h1>
      <p>API testing the test: <strong>{hello}</strong></p>
      <button onClick={addItem}>Add item</button>
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
