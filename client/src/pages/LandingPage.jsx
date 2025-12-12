import { useState, useEffect, useRef } from "react";
import HeroSection from "../components/Discover/HeroSection";
import HowWorkingSection from "../components/Discover/HowWorkingSection";
import DiscoverSection from "../components/Discover/DiscoverSection";
import FarmsDisplay from "../components/Discover/FarmsDisplay";
import MissionSection from "../components/Discover/MissionSection";
import CounterSection from "../components/Discover/CounterSection";
import CategoriesSection from "../components/Discover/CategoriesSection";
import FarmersSection from "../components/Discover/FarmersSection";
import SubscribeSection from "../components/Discover/SubscribeSection";
import ScrollToTop from "../components/Discover/ScrollToTop";

const FadeInUp = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        setIsVisible(entry.isIntersecting);
      });
    }, {
      threshold: 0,
      rootMargin: "-50px 0px"
    });

    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transform transition-all duration-1000 ease-out ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-16'
        }`}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  const [userCoords, setUserCoords] = useState(null);
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">

      <FadeInUp>
        <HeroSection />
      </FadeInUp>

      <FadeInUp>
        <HowWorkingSection />
      </FadeInUp>

      <FadeInUp>
        <DiscoverSection onLocationSet={setUserCoords} userCoords={userCoords} />
      </FadeInUp>

      {userCoords && (
        <FadeInUp>
          <FarmsDisplay userCoords={userCoords} />
        </FadeInUp>
      )}

      <FadeInUp>
        <MissionSection />
      </FadeInUp>

      <FadeInUp>
        <CounterSection />
      </FadeInUp>

      <FadeInUp>
        <CategoriesSection />
      </FadeInUp>

      <FadeInUp>
        <FarmersSection userRole={currentUser?.role || 'guest'} />
      </FadeInUp>

      <FadeInUp>
        <SubscribeSection />
      </FadeInUp>

      <ScrollToTop />
    </div>
  );
};

export default LandingPage;