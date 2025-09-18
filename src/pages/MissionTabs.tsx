import React from "react";

interface MissionTabsProps {
  tab: "current" | "launch" | "completed" | "archive";
  setTab: (tab: "current" | "launch" | "completed" | "archive") => void;
}

const MissionTabs: React.FC<MissionTabsProps> = ({ tab, setTab }) => {
  const tabs: { key: "current" | "launch" | "completed" | "archive"; label: string }[] = [
    { key: "current", label: "Current Missions" },
    { key: "launch", label: "Launch Options" },
    { key: "completed", label: "Completed Missions" },
    { key: "archive", label: "Archived Missions" },
  ];

  return (
    <div style={styles.tabs}>
      {/* Left side - Title */}
      <div style={styles.brand}>Tesseract</div>

      {/* Right side - Tabs */}
      <div style={styles.tabGroup}>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={tab === t.key ? styles.activeTab : styles.tab}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  tabs: {
    display: "flex",
    justifyContent: "space-between", // brand left, tabs right
    alignItems: "center",
    marginBottom: "40px",
    position: "sticky",
    top: "0",
    backgroundColor: "#000",
    padding: "15px 25px",
    zIndex: 10,
    flexWrap: "wrap",
  },
  brand: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#a72121ff",
    letterSpacing: "5px",
    textTransform: "uppercase",
  },
  tabGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tab: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    padding: "10px 22px",
    cursor: "pointer",
    borderRadius: "20px",
    textTransform: "uppercase",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  activeTab: {
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #fff",
    padding: "10px 22px",
    cursor: "pointer",
    borderRadius: "20px",
    fontWeight: "bold",
    boxShadow: "0 0 12px rgba(255,255,255,0.6)",
  },
};

export default MissionTabs;
