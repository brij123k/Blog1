"use client";

import React, { useState } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Passion+One:wght@400;700;900&family=Poppins:wght@400;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.only1-hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  background: #000;
  color: #fff;
  background-image: url("/portal.jpeg");
  background-size: cover;
  background-position: 55% 45%;
  background-repeat: no-repeat;
}

.only1-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .25);
  z-index: 0;
}

.only1-screen {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;

  opacity: 0;
  pointer-events: none;
  transform: translateX(100%);
  transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1),
              opacity 0.6s ease;
}

.only1-screen.active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0%);
}

.only1-screen.slide-out-left {
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

.only1-content {
  width: 100%;
  max-width: min(560px, 42vw);
  text-align: center;
  padding: 20px;
}

.only1-content h1 {
  font-family: 'Passion One', sans-serif;
  font-weight: 900;
  font-size: clamp(30px, 4.6vw, 56px);
  line-height: 1.05;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  color: #fff;
}

.only1-content h1 span {
  color: #00E8FF;
}

.only1-content p {
  max-width: 480px;
  margin: 0 auto 28px;
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.6;
  color: #fff;
}

.btn-sweep {
  position: relative;
  overflow: hidden;
  padding: 13px 38px;
  border: none;
  cursor: pointer;
  border-radius: 40px;
  font-size: 17px;
  font-weight: 700;
  font-family: 'Passion One', sans-serif;
  text-transform: uppercase;
  color: #000;
  background: #00E8FF;
  transition: transform 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 1px;
}

.btn-sweep .arrow {
  display: inline-block;
  transition: transform 0.3s;
}

.btn-sweep:hover .arrow {
  transform: translateX(5px);
}

.btn-sweep::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
  );
  animation: sweep 2.4s ease-in-out infinite;
}

@keyframes sweep {
  0%   { left: -100%; }
  60%  { left: 140%; }
  100% { left: 140%; }
}

.btn-sweep:hover {
  transform: translateY(-4px);
}

.circles-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.circles-row {
  display: flex;
  flex-direction: row;
  gap: 50px;
  justify-content: center;
  align-items: center;
}

.circle-card {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(5, 15, 40, 0.4) 0%, rgba(0, 5, 20, 0.6) 100%);
  border: 3px solid #eafffe;
  box-shadow:
      0 0 8px 2px rgba(234, 255, 254, 0.9),
      0 0 25px 8px rgba(0, 232, 255, 0.55),
      0 0 55px 18px rgba(0, 180, 255, 0.35),
      inset 0 0 30px rgba(0, 150, 220, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.circle-card:hover {
  transform: scale(1.06);
  border-color: #ffffff;
  box-shadow:
      0 0 10px 3px rgba(255, 255, 255, 1),
      0 0 35px 12px rgba(0, 232, 255, 0.7),
      0 0 75px 25px rgba(0, 180, 255, 0.45),
      inset 0 0 40px rgba(0, 170, 240, 0.3);
}

.circle-card h2 {
  font-family: 'Passion One', sans-serif;
  font-weight: 900;
  font-size: clamp(20px, 1.9vw, 28px);
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.15;
  letter-spacing: 0.5px;
}

.circle-card h2 .num {
  font-size: 1.6em;
  color: #00E8FF;
  line-height: 1;
}

.circle-card .highlight {
  font-family: 'Passion One', sans-serif;
  font-weight: 700;
  font-size: clamp(15px, 1.3vw, 19px);
  text-transform: uppercase;
  color: #E87EFF;
  line-height: 1.3;
  letter-spacing: 1px;
}

.btn-back {
  background: transparent;
  border: 2px solid #fff;
  color: #fff;
  padding: 10px 28px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: 0.3s;
}

.btn-back:hover {
  background: #fff;
  color: #000;
}

@media (min-width: 1600px) {
  .only1-content { max-width: 600px; }
  .circle-card { width: 260px; height: 260px; }
}

@media (max-width: 991px) {
  .only1-content { max-width: min(440px, 80vw); }
  .only1-content h1 { font-size: clamp(26px, 5.2vw, 42px); }
  .only1-content p { font-size: clamp(12px, 1.6vw, 15px); }
  .circles-row { gap: 30px; }
  .circle-card { width: 200px; height: 200px; }
}

@media (max-width: 768px) {
  .only1-content { max-width: 85%; }
  .only1-content h1 { font-size: clamp(24px, 7vw, 34px); }
  .only1-content p { font-size: clamp(11px, 3vw, 14px); }
  .circles-row { flex-direction: column; gap: 20px; }
  .circles-wrapper { gap: 25px; }
  .circle-card { width: 170px; height: 170px; }
  .circle-card h2 { font-size: 18px; }
  .circle-card .highlight { font-size: 15px; }
}

@media (max-width: 480px) {
  .only1-content { max-width: 90%; }
  .circle-card { width: 150px; height: 150px; }
}
`;

type ScreenId = 1 | 2;

const Only1Dashboard: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>(1);

  const screen1Classes = [
    "only1-screen",
    screen === 1 ? "active" : "",
    screen === 2 ? "slide-out-left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const screen2Classes = ["only1-screen", screen === 2 ? "active" : ""]
    .filter(Boolean)
    .join(" ");
 const handleStartNow = () => {
   localStorage.setItem("visited", "true");
    window.location.href = "/dashboard";
  };
  return (
    <>
      <style>{styles}</style>
      <section className="only1-hero">
        <div className="only1-overlay" />

        {/* SCREEN 1: Hero Content */}
        <div className={screen1Classes}>
          <div className="only1-content">
            <h1>
              The <span>ONLY1</span>
              <br />
              Dashboard
            </h1>
            <p>
              The ONLY1 dashboard for all small and medium businesses
              to increase store traffic, increase sales, and rank
              in AEO, GEO and AI Search.
            </p>
            <button
              className="btn-sweep"
              onClick={() => setScreen(2)}
              type="button"
            >
              Explore Options
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        {/* SCREEN 2: Two Circles */}
        <div className={screen2Classes}>
          <div className="circles-wrapper">
            <div className="circles-row">
              <div className="circle-card">
                <h2>YOUR WAY</h2>
                <p className="highlight">
                  YOU SET
                  <br />
                  PARAMETERS
                </p>
              </div>

              <div className="circle-card">
                <h2>
                  The <span className="num">1</span> WAY
                </h2>
                <p className="highlight">
                  FULLY
                  <br />
                  AUTOMATED
                </p>
              </div>
            </div>

             <button
              className="btn-sweep"
              onClick={handleStartNow}
              type="button"
            >
              Start Now
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Only1Dashboard;
