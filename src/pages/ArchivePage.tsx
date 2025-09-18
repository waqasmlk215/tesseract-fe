import React from "react";

interface Mission {
  id: number;
  name: string;
  date: string;
  description: string;
}

interface ArchivePageProps {
  archivedMissions: Mission[];
}

const ArchivePage: React.FC<ArchivePageProps> = ({ archivedMissions }) => {
  return (
    <div style={{ color: "white", padding: "20px", textAlign: "center" }}>
      <h1>Archived Missions</h1>
      {archivedMissions.length === 0 && <p>No missions in archive.</p>}

      {archivedMissions.map((m) => (
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
        </div>
      ))}
    </div>
  );
};

export default ArchivePage;
