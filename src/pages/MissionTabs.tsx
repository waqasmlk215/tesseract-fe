import React from "react";
import "./MissionTabs.css";

interface MissionTabsProps {
  tab: "current" | "launch" | "completed" | "archive" |"planets";
  setTab: (tab: "current" | "launch" | "completed" | "archive" | "planets") => void;
}

const MissionTabs: React.FC<MissionTabsProps> = ({ tab, setTab }) => {
  const tabs: { key: "current" | "launch" | "completed" | "archive" |"planets"; label: string }[] = [
    { key: "current", label: "Current Missions" },
    { key: "launch", label: "Launch Options" },
    { key: "completed", label: "Completed Missions" },
    { key: "archive", label: "Archived Missions" },
    { key: "planets", label: "planets" },
  ];

  return (
    <div className="tabs">
      {/* Left side - Title */}
      <div className="brand">Tesseract</div>

      {/* Right side - Tabs */}
      <div className="tab-group">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "tab active-tab" : "tab"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MissionTabs;