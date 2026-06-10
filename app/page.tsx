"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CosmicBackgroundWrapper from "./components/CosmicBackgroundWrapper";

function WelcomePage() {
  const router = useRouter();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCountries, setOtherCountries] = useState<string[]>([]);
  const [currentOtherInput, setCurrentOtherInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const countries = [
    { code: "us", name: "United States", flag: "🇺🇸" },
    { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
    { code: "ca", name: "Canada", flag: "🇨🇦" },
    { code: "au", name: "Australia", flag: "🇦🇺" },
    { code: "de", name: "Germany", flag: "🇩🇪" },
    { code: "fr", name: "France", flag: "🇫🇷" },
    { code: "es", name: "Spain", flag: "🇪🇸" },
    { code: "it", name: "Italy", flag: "🇮🇹" },
    { code: "jp", name: "Japan", flag: "🇯🇵" },
    { code: "in", name: "India", flag: "🇮🇳" },
    { code: "br", name: "Brazil", flag: "🇧🇷" },
    { code: "mx", name: "Mexico", flag: "🇲🇽" },
  ];

  // Load cached data on mount
  useEffect(() => {
    const cachedCountries = localStorage.getItem("userCountries");
    if (cachedCountries) {
      const parsed = JSON.parse(cachedCountries);
      // Separate predefined countries from custom ones
      const predefined = parsed.filter((c: string) => 
        countries.some(country => country.name === c)
      );
      const custom = parsed.filter((c: string) => 
        !countries.some(country => country.name === c)
      );
      setSelectedCountries(predefined);
      setOtherCountries(custom);
      if (custom.length > 0) {
        setShowOtherInput(true);
      }
    }
  }, []);

  const toggleCountry = (countryName: string) => {
    if (selectedCountries.includes(countryName)) {
      setSelectedCountries(selectedCountries.filter(c => c !== countryName));
    } else {
      setSelectedCountries([...selectedCountries, countryName]);
    }
  };

  const handleAddOtherCountry = () => {
    const trimmed = currentOtherInput.trim();
    if (trimmed && !otherCountries.includes(trimmed)) {
      setOtherCountries([...otherCountries, trimmed]);
      setCurrentOtherInput("");
      // Keep input focused for adding more countries
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleRemoveOtherCountry = (country: string) => {
    setOtherCountries(otherCountries.filter(c => c !== country));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOtherCountry();
    }
  };

  const handleContinue = async () => {
    const allCountries = [...selectedCountries, ...otherCountries];

    if (allCountries.length === 0) {
      alert("Please select at least one country");
      return;
    }

    setIsSubmitting(true);
    
    // Save to localStorage
    localStorage.setItem("userCountries", JSON.stringify(allCountries));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to /course page
    router.push("/portal");
    setIsSubmitting(false);
  };

  const handleSkip = () => {
    router.push("/portal");
  };

  return (
    <CosmicBackgroundWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes float-rocket {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(0px) translateX(20px) rotate(10deg);
          }
          75% {
            transform: translateY(15px) translateX(10px) rotate(5deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float-orb {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-40px) translateX(-20px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .rocket-icon {
          animation: float-rocket 6s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(59,130,246,0.5));
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
        }

        .planet-orbit {
          position: absolute;
          border: 1px solid rgba(100,160,255,0.1);
          border-radius: 50%;
          animation: spin-slow 20s linear infinite;
        }

        .country-badge {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden transparent">
        {/* Stars Background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 4 + 2}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Orbiting Planets */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="planet-orbit"
            style={{
              width: "300px",
              height: "300px",
              left: "10%",
              top: "20%",
              animationDuration: "25s",
            }}
          >
            <div className="absolute w-4 h-4 rounded-full bg-purple-400/50" style={{ top: "-2px", left: "50%" }} />
          </div>
          <div 
            className="planet-orbit"
            style={{
              width: "500px",
              height: "500px",
              right: "5%",
              bottom: "10%",
              animationDuration: "35s",
              animationDirection: "reverse",
            }}
          >
            <div className="absolute w-6 h-6 rounded-full bg-blue-400/40" style={{ top: "-3px", left: "50%" }} />
          </div>
        </div>

        {/* Floating Space Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-32 h-32 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
              top: "15%",
              right: "10%",
              animation: "float-orb 15s ease-in-out infinite",
            }}
          />
          <div 
            className="absolute w-48 h-48 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent)",
              bottom: "20%",
              left: "5%",
              animation: "float-orb 12s ease-in-out infinite reverse",
            }}
          />
          <div 
            className="absolute w-40 h-40 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(236,72,153,0.08), transparent)",
              top: "60%",
              right: "15%",
              animation: "float-orb 18s ease-in-out infinite",
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl w-full">
            {/* Welcome Card */}
            <div
              className="rounded-2xl border p-8 md:p-12 backdrop-blur-xl text-center mb-8"
              style={{
                background: "rgba(6,16,48,0.6)",
                borderColor: "rgba(100,160,255,0.2)",
                animation: "fadeInUp 0.6s ease-out",
              }}
            >
              {/* Rocket Icon with Space Elements */}
              <div className="relative mb-6">
                {/* Rocket exhaust glow */}
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full blur-2xl"
                  style={{
                    background: "radial-gradient(circle, rgba(59,130,246,0.4), transparent)",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                />
                
                {/* Rocket flames */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <div className="w-2 h-8 bg-orange-500 rounded-full blur-sm animate-pulse" style={{ animationDuration: "0.3s" }} />
                  <div className="w-3 h-12 bg-orange-400 rounded-full blur-sm animate-pulse" style={{ animationDuration: "0.4s", animationDelay: "0.1s" }} />
                  <div className="w-2 h-8 bg-yellow-500 rounded-full blur-sm animate-pulse" style={{ animationDuration: "0.35s" }} />
                </div>
                
                {/* Rocket icon */}
                <div className="rocket-icon relative z-10">
                  <img 
                    src="/rocket.png" 
                    alt="Rocket Icon" 
                    className="w-32 h-32 md:w-40 md:h-40 mx-auto"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(59,130,246,0.6))",
                    }}
                  />
                </div>

                {/* Floating particles around rocket */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <h1
                className="text-5xl md:text-7xl font-bold mb-4"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome to Blog1
              </h1>
              
              <p
                className="text-lg md:text-xl text-white/60 mb-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Let's get your store optimized for global success
              </p>
              
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Countries Selection Card */}
            <div
              className="rounded-2xl border p-8 md:p-10 backdrop-blur-xl relative overflow-hidden"
              style={{
                background: "rgba(6,16,48,0.6)",
                borderColor: "rgba(100,160,255,0.2)",
                animation: "fadeInUp 0.6s ease-out 0.2s both",
              }}
            >
              {/* Decorative space elements inside card */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-2xl" />
              
              <div className="text-center mb-8 relative z-10">
                <div
                  className="inline-flex items-center gap-2 mb-4"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    color: "rgba(160,205,255,0.85)",
                    border: "1px solid rgba(100,160,255,0.22)",
                    borderRadius: 999,
                    padding: "6px 16px",
                    background: "rgba(30,65,170,0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#60a5fa",
                      display: "inline-block",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                  STEP 1 OF 1
                </div>
                
                <h2
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}
                >
                  Where does your store operate?
                </h2>
                
                <p
                  className="text-white/40 text-sm font-mono"
                >
                  Select all countries where you sell products or services
                </p>
              </div>

              {/* Countries Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 relative z-10">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      selectedCountries.includes(country.name)
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-white text-sm font-medium">{country.name}</span>
                    {selectedCountries.includes(country.name) && (
                      <span className="ml-auto text-blue-400 text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Other Country Option */}
              <div className="mb-8 relative z-10">
                <button
                  onClick={() => setShowOtherInput(!showOtherInput)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 w-full ${
                    showOtherInput
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <span className="text-2xl">🌍</span>
                  <span className="text-white text-sm font-medium">Add Other Countries</span>
                  {showOtherInput && (
                    <span className="ml-auto text-purple-400 text-sm">▼</span>
                  )}
                </button>

                {/* Other Country Input Section */}
                {showOtherInput && (
                  <div className="mt-4 animate-fadeIn">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={currentOtherInput}
                        onChange={(e) => setCurrentOtherInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type country name and press Enter"
                        className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={handleAddOtherCountry}
                        disabled={!currentOtherInput.trim()}
                        className={`px-6 rounded-xl font-mono text-sm transition-all ${
                          currentOtherInput.trim()
                            ? "bg-purple-500/20 border border-purple-500 text-purple-300 hover:bg-purple-500/30"
                            : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                    
                    <p className="text-white/30 text-xs font-mono mt-2">
                      Press Enter or click Add to add multiple countries
                    </p>

                    {/* Added Other Countries List */}
                    {otherCountries.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white/40 text-xs font-mono mb-2 flex items-center gap-2">
                          <span>🌍</span> ADDED COUNTRIES:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {otherCountries.map((country, index) => (
                            <span
                              key={index}
                              className="country-badge px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-sm flex items-center gap-2"
                            >
                              {country}
                              <button
                                onClick={() => handleRemoveOtherCountry(country)}
                                className="hover:text-white transition-colors"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Countries Summary */}
              {(selectedCountries.length > 0 || otherCountries.length > 0) && (
                <div
                  className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 relative z-10"
                  style={{
                    animation: "fadeInUp 0.3s ease-out",
                  }}
                >
                  <p className="text-white/40 text-xs font-mono mb-2 flex items-center gap-2">
                    <span>🚀</span> ALL SELECTED COUNTRIES:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((country) => (
                      <span
                        key={country}
                        className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm flex items-center gap-1"
                      >
                        {country}
                      </span>
                    ))}
                    {otherCountries.map((country, index) => (
                      <span
                        key={`other-${index}`}
                        className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm flex items-center gap-1"
                      >
                        🌍 {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isSubmitting || (selectedCountries.length === 0 && otherCountries.length === 0)}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden group ${
                  isSubmitting || (selectedCountries.length === 0 && otherCountries.length === 0)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95"
                }`}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
                  boxShadow: "0 0 30px rgba(59,130,246,0.3)",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </div>
                ) : (
                  "Continue →"
                )}
              </button>

              {/* Skip Option */}
              <p className="text-center mt-6">
                <button
                  onClick={handleSkip}
                  className="text-white/30 text-sm font-mono hover:text-white/50 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <span>✨</span> Skip for now <span>✨</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </CosmicBackgroundWrapper>
  );
}

export default WelcomePage;