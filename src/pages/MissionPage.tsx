import React, { useEffect, useState } from "react";
import MissionTimer from "./MissionTimer";
import MissionTabs from "./MissionTabs"; // ✅ new import
import "./MissionPage.css";
import Planets from "./Planets"; // ✅ planets import

interface Mission {
  id: number;
  name: string;
  date: string;
  description: string;
  image?: string;
  onExpire?: (id: number) => void;
}

const MissionCard: React.FC<{
  mission: Mission;
  onDelete: (id: number) => void;
  onComplete?: (id: number) => void;
}> = ({ mission, onDelete, onComplete }) => {
  return (
    <div className="mission-line">
      {/* Mission image */}
      <img
        src={mission.image || "/testicon.png"}
        alt={mission.name}
        style={{ width: "164px", height: "83px", marginRight: "16px" }}
        onError={(e) => {
          const t = e.currentTarget;
          if (!t.dataset.fallback) {
            t.dataset.fallback = "1";
            t.src = "/default-mission.png";
          }
        }}
      />

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
          <button
            className="action-button"
            onClick={() => onComplete(mission.id)}
          >
            ✅ Complete
          </button>
        )}
        <button
          className="action-button"
          onClick={() => onDelete(mission.id)}
        >
          ❌ Delete
        </button>
      </div>
    </div>
  );
};

const MissionPage: React.FC = () => {
  const [tab, setTab] = useState<
    "current" | "launch" | "completed" | "archive" | "planets"
  >("current");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completed, setCompleted] = useState<Mission[]>([]);
  const [archived, setArchived] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState({
    name: "",
    date: "",
    description: "",
    image: "",
  });
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [expiredMission, setExpiredMission] = useState<Mission | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Load archive
  useEffect(() => {
    const savedArchive = localStorage.getItem("archivedMissions");
    if (savedArchive) setArchived(JSON.parse(savedArchive));
  }, []);

  // Save archive
  useEffect(() => {
    localStorage.setItem("archivedMissions", JSON.stringify(archived));
  }, [archived]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      setScrolled(currentScroll > 50);
      if (currentScroll > lastScrollY && currentScroll > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

    setNewMission({ name: "", date: "", description: "", image: "" });
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
    const mission = missions.find((m) => m.id === id);
    if (!mission) return;
    setExpiredMission(mission);
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
    
  <div className={`mission-tabs-wrapper ${scrolled ? "scrolled" : ""} ${!showNavbar ? "hidden" : ""}`}>
    <MissionTabs tab={tab} setTab={setTab} />
  </div>

    {/* Current Missions */}
    {tab === "current" && (
      <>
      {/* 🚀 Hero Section */}
    <div className="hero-section">

      <div className="hero-overlay">
        <h1 className="hero-title">IMAP MISSION</h1>
        <p className="hero-subtitle">T-03:28:35</p>
        <button className="hero-button">WATCH →</button>
      </div>
    </div>

          <h1 className="launch-heading">Ongoing Launches</h1>
          {missions.length === 0 && <p>No Ongoing missions.</p>}
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
          <p className="launch-paragraph">Configure and schedule new missions.</p>

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

          <input
            type="text"
            placeholder="Image URL (e.g. /images/mission1.png)"
            value={newMission.image}
            onChange={(e) =>
              setNewMission({ ...newMission, image: e.target.value })
            }
            className="launch-input"
          />

          <button className="launch-button" onClick={handleAddMission}>
            ➕ Add Mission
          </button>
        </div>
      )}

{tab === "completed" && (
  <div>
    <h1 className="launch-heading">Completed Missions</h1>
    {completed.length === 0 ? (
      <p>No completed missions.</p>
    ) : (
      completed.map((m) => (
        <div key={m.id} className="completed-line">
          <img
            src={m.image || "/testicon.png"}
            alt={m.name}
            style={{ width: "164px", height: "83px", marginRight: "16px" }}
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.dataset.fallback) {
                t.dataset.fallback = "1";
                t.src = "/default-mission.png";
              }
            }}
          />
          <div className="mission-info">
            <h3 className="mission-title">{m.name}</h3>
            <p className="mission-description">{m.description || "--"}</p>
            <p className="mission-date">
              Completed Date: <b>{m.date}</b>
            </p>
          </div>
          <div className="mission-actions">
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
  </div>
)}


{tab === "archive" && (
  <div>
    <h1 className="launch-heading">Archived Missions</h1>
    {archived.length === 0 ? (
      <p>No missions in archive.</p>
    ) : (
      archived.map((m) => (
        <div key={m.id} className="completed-line">
          <img
            src={m.image || "/testicon.png"}
            alt={m.name}
            style={{ width: "164px", height: "83px", marginRight: "16px" }}
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.dataset.fallback) {
                t.dataset.fallback = "1";
                t.src = "/default-mission.png";
              }
            }}
          />
          <div className="mission-info">
            <h3 className="mission-title">{m.name}</h3>
            <p className="mission-description">{m.description || "--"}</p>
            <p className="mission-date">
              Archived Date: <b>{m.date}</b>
            </p>
          </div>
          <div className="mission-actions">
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

    {/* 🚨 Expired Mission Popup */}
    {expiredMission && (
      <div className="popup-overlay">
        <div className="popup-box">
          <h3>Mission "{expiredMission.name}" Timer Complete!</h3>
          <div className="popup-actions">
            <button
              onClick={() => {
                setMissions((prev) =>
                  prev.filter((m) => m.id !== expiredMission.id)
                );
                setCompleted((prev) => [...prev, expiredMission]);
                setExpiredMission(null);
              }}
            >
              🚀 Launch
            </button>
            <button
              onClick={() => {
                setMissions((prev) =>
                  prev.filter((m) => m.id !== expiredMission.id)
                );
                setArchived((prev) => [...prev, expiredMission]);
                setExpiredMission(null);
              }}
            >
              📦 Archive
            </button>
          </div>
        </div>
      </div>
    )}
  </div> 
);

}

export default MissionPage;
