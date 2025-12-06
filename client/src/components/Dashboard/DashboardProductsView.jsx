import { memo } from "react";
import { useOutletContext } from "react-router-dom";
import MyProductsPage from "../../pages/FarmProductsPage";

/**
 * DashboardProductsView - Memoized wrapper for products page
 * No max-height to allow parent scrollbar to work
 */
const DashboardProductsView = memo(() => {
  const { onAddNew, onEdit } = useOutletContext();

  return (
    <div className="flex h-full min-h-[500px] flex-col py-6 pb-8">
      <MyProductsPage onEdit={onEdit} onAddNew={onAddNew} />
    </div>
  );
});

DashboardProductsView.displayName = "DashboardProductsView";

export default DashboardProductsView;
