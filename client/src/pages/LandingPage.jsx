import { useState } from "react";
import HeroSection from "../components/Discover/HeroSection";
import HowWorkingSection from "../components/Discover/HowWorkingSection";
import DiscoverSection from "../components/Discover/DiscoverSection";
import FarmsDisplay from "../components/Discover/FarmsDisplay";
import MissionSection from "../components/Discover/MissionSection";
import CounterSection from "../components/Discover/CounterSection";
import CategoriesSection from "../components/Discover/CategoriesSection";
import FarmersSection from "../components/Discover/FarmersSection";
import SubscribeSection from "../components/Discover/SubscribeSection";

const DiscoverPage = () => {
  const [userCoords, setUserCoords] = useState(null);

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />

      <HowWorkingSection />

      <DiscoverSection onLocationSet={setUserCoords} userCoords={userCoords} />

      {userCoords && <FarmsDisplay userCoords={userCoords} />}

      <MissionSection />

      <CounterSection />

      <CategoriesSection />

      <FarmersSection />

      <SubscribeSection />
    </div>
  );
};

export default DiscoverPage;