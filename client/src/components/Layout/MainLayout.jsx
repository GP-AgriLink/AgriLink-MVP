import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="app flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" style={{ zoom: "0.8", minHeight: "125vh" }}>
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
        style={{ zIndex: 99999 }}
      />
      <main className="main-content mx-auto w-full flex-grow px-4 sm:px-6 lg:w-5/6 lg:px-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
