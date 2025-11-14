import { useState } from "react";
import DiscoverSection from "../components/Discover/DiscoverSection";
import FarmsDisplay from "../components/Discover/FarmsDisplay";
import HowWorkingSection from "../components/Discover/HowWorkingSection";
import MissionSection from "../components/Discover/MissionSection";
import CategoriesSection from "../components/Discover/CategoriesSection";

const DiscoverPage = () => {
  const [userCoords, setUserCoords] = useState(null);

  return (
    <div className="flex min-h-screen flex-col">

      <HowWorkingSection />

      <DiscoverSection onLocationSet={setUserCoords} userCoords={userCoords} />

      {userCoords && <FarmsDisplay userCoords={userCoords} />}

      <MissionSection />

      <CategoriesSection />
    </div>
  );
};

export default DiscoverPage;