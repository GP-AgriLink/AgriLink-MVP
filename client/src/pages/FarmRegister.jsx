import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InfoSection from "../components/Register/InfoSection";
import SignupForm from "../components/Register/SignupForm";

const FarmerSignup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard with profile view
    if (user) {
      navigate('/dashboard', { 
        replace: true,
        state: { activeView: 'profile' }
      });
    }
  }, [user, navigate]);

  // Don't render the signup form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-fit flex items-center justify-center py-6 px-6">
      <div className="relative flex flex-col md:flex-row items-center justify-between max-w-[1024px] w-full gap-12 z-10">
        <InfoSection />
        <SignupForm />
      </div>
    </div>
  );
};

export default FarmerSignup;
