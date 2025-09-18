import React, { useEffect, useState } from "react";
import MissionTimer from "./MissionTimer";
import MissionTabs from "./MissionTabs"; // ✅ new import

interface Mission {
  id: number;
  name: string;
  date: string;
  description: string;
  onExpire?: (id: number) => void;
}

const MissionCard: React.FC<{
  mission: Mission;
  onDelete: (id: number) => void;
  onComplete?: (id: number) => void;
}> = ({ mission, onDelete, onComplete }) => {
  return (
    <div style={styles.missionLine}>
      <div>
        <h3 style={{ margin: "0", fontSize: "18px" }}>{mission.name}</h3>
        <p style={{ margin: "2px 0", color: "#bbb" }}>{mission.description}</p>
        <p style={{ margin: "2px 0", fontSize: "14px" }}>
          Scheduled: <b>{mission.date}</b>{" "}
          {mission.onExpire && (
            <MissionTimer
              date={mission.date}
              onExpire={() => mission.onExpire!(mission.id)}
            />
          )}
        </p>
      </div>
      <div style={styles.missionActions}>
        {onComplete && (
          <button style={styles.actionButton} onClick={() => onComplete(mission.id)}>
            ✅ Complete
          </button>
        )}
        <button style={styles.actionButton} onClick={() => onDelete(mission.id)}>
          ❌ Delete
        </button>
      </div>
    </div>
  );
};

const MissionPage: React.FC = () => {
  const [tab, setTab] = useState<"current" | "launch" | "completed" | "archive">("current");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completed, setCompleted] = useState<Mission[]>([]);
  const [archived, setArchived] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState({ name: "", date: "", description: "" });
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  // Load archive
  useEffect(() => {
    const savedArchive = localStorage.getItem("archivedMissions");
    if (savedArchive) setArchived(JSON.parse(savedArchive));
  }, []);

  // Save archive
  useEffect(() => {
    localStorage.setItem("archivedMissions", JSON.stringify(archived));
  }, [archived]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const refreshMissions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/missions`, {
        headers: getAuthHeaders(),
      });
      const allMissions: Mission[] = await res.json();
      const now = new Date();
      setMissions(
        allMissions.filter(
          (m) =>
            new Date(m.date) >= now && !archived.find((a) => a.id === m.id)
        )
      );
    } catch (err) {
      console.error("Error fetching missions:", err);
    }
  };

  useEffect(() => {
    refreshMissions();
  }, []);

  const handleAddMission = async () => {
    if (!newMission.name || !newMission.date) return;

    await fetch(`${import.meta.env.VITE_API_URL}/missions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newMission),
    });

    setNewMission({ name: "", date: "", description: "" });
    refreshMissions();
  };

  const handleDeleteMission = async (id: number) => {
    await fetch(`${import.meta.env.VITE_API_URL}/missions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setMissions((prev) => prev.filter((m) => m.id !== id));
    setCompleted((prev) => prev.filter((m) => m.id !== id));
    setArchived((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCompleteMission = (id: number) => {
    const missionToComplete = missions.find((m) => m.id === id);
    if (!missionToComplete) return;

    setMissions((prev) => prev.filter((m) => m.id !== id));
    setCompleted((prev) => [...prev, missionToComplete]);
  };

  const handleExpireMission = (id: number) => {
    const missionToArchive = missions.find((m) => m.id === id);
    if (!missionToArchive) return;

    setMissions((prev) => prev.filter((m) => m.id !== id));
    setArchived((prev) => [...prev, missionToArchive]);
    alert(`Mission "${missionToArchive.name}" expired and moved to Archive.`);
  };

  const startReschedule = (id: number) => {
    setRescheduleId(id);
    const mission = archived.find((m) => m.id === id);
    if (mission) setRescheduleDate(mission.date);
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !rescheduleDate) return;

    await fetch(`${import.meta.env.VITE_API_URL}/missions/${rescheduleId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ date: rescheduleDate }),
    });

    const updatedMission = archived.find((m) => m.id === rescheduleId);
    if (updatedMission) {
      updatedMission.date = rescheduleDate;
      setArchived((prev) => prev.filter((m) => m.id !== rescheduleId));
      setMissions((prev) => [...prev, updatedMission]);
    }

    setRescheduleId(null);
    setRescheduleDate("");
  };

  return (
    <div style={{ color: "white", padding: "20px", textAlign: "center" }}>
      {/* ✅ Tabs moved into its own component */}
      <MissionTabs tab={tab} setTab={setTab} />

      {/* Current Missions */}
      {tab === "current" && (
        <>
          <h1>Upcoming Launches</h1>
          {missions.length === 0 && <p>No upcoming missions.</p>}
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={{ ...m, onExpire: handleExpireMission }}
              onDelete={handleDeleteMission}
              onComplete={handleCompleteMission}
            />
          ))}
        </>
      )}

      {/* Launch Options */}
      {tab === "launch" && (
        <div style={styles.launchFormWrapper}>
          <h1 style={styles.launchHeading}>Launch Options</h1>
          <p style={styles.launchParagraph}>
            Configure and schedule new missions.
          </p>

          <input
            type="text"
            placeholder="Mission Name"
            value={newMission.name}
            onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
            style={styles.launchInput}
          />
          <input
            type="datetime-local"
            value={newMission.date}
            onChange={(e) => setNewMission({ ...newMission, date: e.target.value })}
            style={styles.launchInput}
          />
          <input
            type="text"
            placeholder="Description"
            value={newMission.description}
            onChange={(e) =>
              setNewMission({ ...newMission, description: e.target.value })
            }
            style={styles.launchInput}
          />
          <button style={styles.launchButton} onClick={handleAddMission}>
            ➕ Add Mission
          </button>
        </div>
      )}

      {/* Completed Missions */}
      {tab === "completed" && (
        <div>
          <h1>Completed Missions</h1>
          {completed.length === 0 ? (
            <p>No completed missions.</p>
          ) : (
            completed.map((m) => (
              <div key={m.id} style={styles.completedLine}>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <p>
                  Completed Date: <b>{m.date}</b>
                </p>
                <button style={styles.actionButton} onClick={() => handleDeleteMission(m.id)}>
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Archived Missions */}
      {tab === "archive" && (
        <div>
          <h1>Archived Missions</h1>
          {archived.length === 0 ? (
            <p>No missions in archive.</p>
          ) : (
            archived.map((m) => (
              <div key={m.id} style={styles.completedLine}>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <p>
                  Archived Date: <b>{m.date}</b>
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={styles.actionButton} onClick={() => startReschedule(m.id)}>
                    ⏰ Reschedule
                  </button>
                  <button style={styles.actionButton} onClick={() => handleDeleteMission(m.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {rescheduleId && (
            <div style={{ marginTop: "20px" }}>
              <h3>Reschedule Mission</h3>
              <input
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={styles.launchInput}
              />
              <button style={styles.launchButton} onClick={handleReschedule}>
                ✅ Update Date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  missionLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: "1px solid rgba(252, 168, 0, 0.2)",
    padding: "12px 0",
    maxWidth: "1300px",
    margin: "0 auto",
  },
  missionActions: { 
    display: "grid",
    gap: "5px",
  },
  actionButton: {
    background: "transparent",
    border: "2px double darkred",
    color: "white",
    padding: "6px 20px",
    borderRadius: "2px",
    cursor: "pointer",
  },
  completedLine: {
    borderBottom: "1px solid rgba(23, 29, 23, 0.3)",
    padding: "10px 0",
    maxWidth: "900px",
    margin: "0 auto",
  },
  launchFormWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "12px",
    backgroundColor: "#000",
    padding: "10px",
  },
  launchHeading: {
    fontSize: "28px",
    marginBottom: "10px",
    fontWeight: "bold",
    textTransform: "capitalize",
    letterSpacing: "2px",
  },
  launchParagraph: {
    fontSize: "14px",
    marginBottom: "20px",
    color: "#aaa",
  },
  launchInput: {
    width: "280px",
    padding: "12px",
    border: "1px solid #444",
    borderRadius: "4px",
    backgroundColor: "#111",
    color: "#fff",
    fontSize: "14px",
    marginBottom: "10px",
  },
  launchButton: {
    width: "220px",
    height: "45px",
    border: "1px solid white",
    borderRadius: "4px",
    background: "transparent",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    textTransform: "uppercase",
  },
};

export default MissionPage;
