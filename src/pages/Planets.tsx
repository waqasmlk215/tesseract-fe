import React, { useEffect, useState } from "react";
import "./planets.css";

interface Planet {
  id: number;
  name: string;
  starName: string;
  discoveryYear: number;
  orbitalPeriod: string | number;
  equilibriumTemp: string | number;
  discoveryMethod: string;
  description: string;
}

const imageMap: Record<string, string> = {
  "kepler-186f":
    "https://upload.wikimedia.org/wikipedia/commons/c/c1/Kepler186f-ArtistConcept-20140417.jpg",
  "kepler-452b":
    "https://exoplanets.nasa.gov/system/exoplanet_thumbnails/kepler452b.jpg",
  "kepler-20d":
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mega-earth.jpg",
  "kepler-818b":
    "https://science.nasa.gov/wp-content/uploads/2023/06/may102022-x1pt5flare-171-131-304-jpg.webp?w=1024",
  "wasp-15b":
    "https://cdn.sci.news/images/enlarge5/image_6125e-HD-73344b.jpg",
  "wasp-58b":
    "https://asianatimes.com/wp-content/uploads/2023/09/Untitled-design-1.jpg",
  "kepler-61b":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kepler-61b.jpg/548px-Kepler-61b.jpg",
  "k2-151b":
    "https://cdn.sci.news/images/enlarge4/image_5811e-K2-151b.jpg",
  "hat-p-54b":
    "https://www.exoplanetkyoto.org/wp-content/uploads/2016/08/HD209458b2.jpg",
  "hd70642b":
    "https://chview.nova.org/solcom/stars2/hd70642b.jpg",
  "kepler-976b":
    "https://www.nasa.gov/wp-content/uploads/2025/09/1-pia26681-new-sun-image.jpg?w=1024",
  "kepler-188c":
    "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/exo-explore/assets/content/planets/neptunelike-8.jpg",
  "kepler-890b":
    "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/exo-explore/assets/content/planets/gasgiant-7.jpg",
};

const Planets: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/planets")
      .then((res) => res.json())
      .then((data) => setPlanets(data))
      .catch((err) => console.error("Error fetching planets:", err));
  }, []);

  const normalizeName = (name: string) =>
    name.replace(/\s+/g, "").toLowerCase();

  return (
    <div className="planets-container">
      <h2 className="planets-title">Exoplanets & Stars</h2>
      <div className="planets-grid">
        {planets.map((planet) => (
          <div key={planet.id} className="planet-card">
            <img
              src={imageMap[normalizeName(planet.name)] || "/fallback.jpg"}
              alt={planet.name}
              className="planet-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/fallback.jpg";
              }}
            />
            <div className="planet-info">
              <div className="info-row planet-name">
                <span className="info-value">{planet.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Star:</span>
                <span className="info-value">{planet.starName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Discovered:</span>
                <span className="info-value">{planet.discoveryYear}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Orbital Period:</span>
                <span className="info-value">{planet.orbitalPeriod}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Equilibrium Temp:</span>
                <span className="info-value">{planet.equilibriumTemp}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Discovery Method:</span>
                <span className="info-value">{planet.discoveryMethod}</span>
              </div>
              <div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Planets;
