import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3000/api";

export default function AssignResponderModal({ sos, onClose }) {
  const [responders, setResponders] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    axios.get(`${API}/responders`)
      .then(res => {
      console.log("Fetched responders:", res.data);
      setResponders(res.data);
    })
      .catch(err => console.error(err));
  }, []);

  const assign = async () => {
    if (!selected) return alert("Select a responder");
    try {
      await axios.post(`${API}/sos/assign`, { sosId: sos._id, responderId: selected });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to assign");
    }
  };

  return (
    <div style={{
      position: "fixed", left: 0, right: 0, top: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, minWidth: 320 }}>
        <h3>Assign responder to {sos.name}</h3>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- choose responder --</option>
          {responders.map(r => (
            <option key={r._id} value={r._id} disabled={!r.status}>
              {r.name} {r.status === "busy" ? "(busy)" : ""}
            </option>
          ))}
        </select>
        <div style={{ marginTop: 12 }}>
          <button onClick={assign}>Assign</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
