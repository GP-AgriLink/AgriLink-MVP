import { useState } from "react";
import HeroSection from "../components/Discover/HeroSection";
import FeaturesSection from "../components/Discover/FeaturesSection";
import FarmsDisplay from "../components/Discover/FarmsDisplay";

const DiscoverPage = () => {
  const [userCoords, setUserCoords] = useState(null);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow mb-5">
        <HeroSection onLocationSet={setUserCoords} userCoords={userCoords} />

        {userCoords && <FarmsDisplay userCoords={userCoords} />}

        <FeaturesSection />
      </main>
    </div>
  );
};

export default DiscoverPage;