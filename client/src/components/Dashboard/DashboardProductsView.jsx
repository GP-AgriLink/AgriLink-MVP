/**
 * DashboardProductsView
 * Renders the products management interface with add/edit capabilities
 * @param {Function} onEdit - Handler for product edit action
 * @param {Function} onAddNew - Handler for new product creation
 * @param {string} activeFilter - The currently selected filter
 * @param {Function} onFilterChange - Handler to change the filter
 */

import MyProductsPage from "../../pages/FarmProductsPage";
import { useProducts } from "../../context/ProductsContext";
import LogoSpinner from "../common/LogoSpinner";

const DashboardProductsView = ({ onEdit, onAddNew, activeFilter, onFilterChange }) => {
  // Get loading state from the context
  const { loading } = useProducts();

  return (
    // This div needs to be relative to contain the absolute spinner
    <div className="relative flex min-h-[400px] flex-col py-8">
      {/* Show spinner on top if loading. It will cover the content below. */}
      {loading && <LogoSpinner message="Loading Products..." />}

      <MyProductsPage
        onEdit={onEdit}
        onAddNew={onAddNew}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default DashboardProductsView;
