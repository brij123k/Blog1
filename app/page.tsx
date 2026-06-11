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