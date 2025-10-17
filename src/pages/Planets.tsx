import React, { useEffect, useState } from "react";
import "./Planets.css";

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

// 🪐 Hardcoded image mapping for the 10 planets
const imageMap: Record<string, string> = {
  "kepler-6 b": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mega-earth.jpg",
  "kepler-257 b": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Kepler186f-ArtistConcept-20140417.jpg",
  "kepler-216 b": "https://science.nasa.gov/wp-content/uploads/2023/06/may102022-x1pt5flare-171-131-304-jpg.webp?w=1024",
  "kepler-32 c": "https://cdn.sci.news/images/enlarge4/image_5811e-K2-151b.jpg",
  "kepler-259 c": "https://exoplanets.nasa.gov/system/news_items/main_images/903_exoplanet-art-5.jpg", // fixed NASA art
  "kepler-148 c": "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/exo-explore/assets/content/planets/gasgiant-7.jpg",
  "kepler-222 d": "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/exo-explore/assets/content/planets/neptunelike-8.jpg",
  "kepler-29 c": "https://www.exoplanetkyoto.org/wp-content/uploads/2016/08/HD209458b2.jpg",
  "kepler-179 b": "https://chview.nova.org/solcom/stars2/hd70642b.jpg",
};

const Planets: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/planets")
      .then((res) => res.json())
      .then((data) => setPlanets(data))
      .catch((err) => console.error("Error fetching planets:", err));
  }, []);

  return (
    <div className="planets-container">
      <h2 className="planets-title">Exoplanets & Stars</h2>
      <div className="planets-grid">
        {planets.map((planet) => {
          const imageSrc =
            imageMap[planet.name.toLowerCase()] || "/fallback.jpg";

          return (
            <div key={planet.id} className="planet-card">
              <img
                src={imageSrc}
                alt={planet.name}
                className="planet-image"
                onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              />
              <div className="planet-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
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
                <div className="info-row">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{planet.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Planets;
