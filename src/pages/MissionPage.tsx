import React, { useEffect, useState } from "react";
import MissionTimer from "./MissionTimer";
import MissionTabs from "./MissionTabs"; // ✅ new import
import "./MissionPage.css";

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
    <div className="mission-line">
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

<div className="mission-actions">
  {onComplete && (
    <button className="action-button" onClick={() => onComplete(mission.id)}>
      ✅ Complete
    </button>
  )}
  <button className="action-button" onClick={() => onDelete(mission.id)}>
    ❌ Delete
  </button>
</div>
</div>

  );
};

const MissionPage: React.FC = () => {
  const [tab, setTab] = useState<"current" | "launch" | "completed" | "archive" |"planets">("current");
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
  <div className="mission-page">
    {/* */}
    <MissionTabs tab={tab} setTab={setTab} />

    {/* Current Missions */}
    {tab === "current" && (
      <>
        <h1 className="launch-heading">Upcoming Launches</h1>
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
      <div className="launch-form-wrapper">
        <h1 className="launch-heading">Launch Options</h1>
        <p className="launch-paragraph">
          Configure and schedule new missions.
        </p>

        <input
          type="text"
          placeholder="Mission Name"
          value={newMission.name}
          onChange={(e) =>
            setNewMission({ ...newMission, name: e.target.value })
          }
          className="launch-input"
        />
        <input
          type="datetime-local"
          value={newMission.date}
          onChange={(e) =>
            setNewMission({ ...newMission, date: e.target.value })
          }
          className="launch-input"
        />
        <input
          type="text"
          placeholder="Description"
          value={newMission.description}
          onChange={(e) =>
            setNewMission({ ...newMission, description: e.target.value })
          }
          className="launch-input"
        />
        <button className="launch-button" onClick={handleAddMission}>
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
            <div key={m.id} className="completed-line">
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <p>
                Completed Date: <b>{m.date}</b>
              </p>
              <button
                className="action-button"
                onClick={() => handleDeleteMission(m.id)}
              >
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
            <div key={m.id} className="completed-line">
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <p>
                Archived Date: <b>{m.date}</b>
              </p>
              <div className="action-buttons-row">
                <button
                  className="action-button"
                  onClick={() => startReschedule(m.id)}
                >
                  ⏰ Reschedule
                </button>
                <button
                  className="action-button"
                  onClick={() => handleDeleteMission(m.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}

        {rescheduleId && (
          <div className="reschedule-box">
            <h3>Reschedule Mission</h3>
            <input
              type="datetime-local"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="launch-input"
            />
            <button className="launch-button" onClick={handleReschedule}>
              ✅ Update Date
            </button>
          </div>
        )}
      </div>
    )}
    {/* ✅ Planets Tab (inside return) */}
    {tab === "planets" && (
      <div>
        <h1 className="launch-heading">Habitable Planets</h1>
        <p className="launch-paragraph">
          Exploring potential worlds beyond Earth.
        </p>

        <div className="planet-list">
          {[
            {
              name: "Mars",
              desc: "The Red Planet – closest habitable candidate.",
              distance: "225M km",
            },
            {
              name: "Kepler-452b",
              desc: "An Earth-like planet in the habitable zone.",
              distance: "1,400 ly",
            },
            {
              name: "Proxima b",
              desc: "Orbits Proxima Centauri, our nearest star neighbor.",
              distance: "4.24 ly",
            },
          ].map((planet, idx) => (
            <div key={idx} className="planet-card">
              <h3 className="planet-title">{planet.name}</h3>
              <p className="planet-description">{planet.desc}</p>
              <p className="planet-distance">
                Distance: <b>{planet.distance}</b>
              </p>
            </div>
          ))}
        </div>
      </div>
    )}  
  </div> 
);


}



export default MissionPage;
