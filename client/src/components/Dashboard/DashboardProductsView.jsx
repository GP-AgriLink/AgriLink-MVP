import { useOutletContext } from "react-router-dom";
import MyProductsPage from "../../pages/FarmProductsPage";
import { useProducts } from "../../context/ProductsContext";
import LogoSpinner from "../common/LogoSpinner";

const DashboardProductsView = () => {
  const { loading } = useProducts();

  // Get the handlers passed from Dashboard.jsx's Outlet
  const { onAddNew, onEdit } = useOutletContext();

  return (
    <div className="relative flex min-h-[400px] flex-col py-8">
      {/* Show spinner on top if loading. It will cover the content below. */}
      {loading && <LogoSpinner message="Loading Products..." />}

      <MyProductsPage onEdit={onEdit} onAddNew={onAddNew} />
    </div>
  );
};

export default DashboardProductsView;
