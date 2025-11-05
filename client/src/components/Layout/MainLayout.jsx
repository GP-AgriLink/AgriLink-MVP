import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="app min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <Navbar />
      {/* Toaster is now positioned relative to the main layout */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-20"
      />
      <main className="main-content w-full lg:w-5/6 mx-auto flex-grow px-4 sm:px-6 lg:px-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;