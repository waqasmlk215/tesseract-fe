import React, { useEffect, useState } from "react";
import "./ArchivePage.css";

interface Mission {
  id: number;
  name: string;
  date: string;
  description: string;
  image?: string;
}

const ArchivePage: React.FC = () => {
  const [archived, setArchived] = useState<Mission[]>([]);

  // --- helper to include JWT in requests ---
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchArchivedMissions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/missions/archive`, {
        headers: getAuthHeaders(),
      });
      const data: Mission[] = await res.json();
      setArchived(data);
    } catch (err) {
      console.error("Error fetching archived missions:", err);
    }
  };

  const handleRestoreMission = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/missions/${id}/archive`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      fetchArchivedMissions();
    } catch (err) {
      console.error("Error restoring mission:", err);
    }
  };

  const handleDeleteForever = async (id: number) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/missions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    fetchArchivedMissions();
  } catch (err) {
    console.error("Error deleting mission:", err);
  }
  };

  useEffect(() => {
    fetchArchivedMissions();
  }, []);

  return (
    <div style={{ color: "white", padding: "20px", textAlign: "center" }}>
      <h1 className="launch-heading">Completed Missions</h1>
      {archived.length === 0 && <p>No missions in archive.</p>}

      {archived.map((m) => (
        <div
          key={m.id}
          style={{
            backgroundColor: "#222",
            margin: "10px auto",
            padding: "15px",
            borderRadius: "6px",
            width: "90%",
            maxWidth: "500px",
          }}
        >
          <h3>{m.name}</h3>
          <p>{m.description}</p>
          <p>
            Archived Date: <b>{m.date}</b>
          </p>

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => handleRestoreMission(m.id)}
              style={{
                marginRight: "10px",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #0f0",
                backgroundColor: "transparent",
                color: "#0f0",
                cursor: "pointer",
              }}
            >
              ♻ Restore
            </button>
            <button
              onClick={() => handleDeleteForever(m.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid red",
                backgroundColor: "transparent",
                color: "red",
                cursor: "pointer",
              }}
            >
              ❌ Delete Forever
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchivePage;
