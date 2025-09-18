import React, { useEffect, useState } from "react";

interface MissionTimerProps {
  date: string; // ISO string date of mission
  onExpire: () => void;
}

const MissionTimer: React.FC<MissionTimerProps> = ({ date, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const target = new Date(date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        onExpire(); // notify MissionPage that mission expired
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(9, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [date, onExpire]);

  return <span style={{ color: "rgba(92, 94, 92, 1)", fontWeight: "bold" }}>{timeLeft}</span>;
};

export default MissionTimer;
