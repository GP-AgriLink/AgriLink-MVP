import { memo } from "react";
import OrdersPage from "../../pages/OrdersPage";

/**
 * DashboardOrdersView - Memoized wrapper for orders page
 * No max-height to allow parent scrollbar to work
 */
const DashboardOrdersView = memo(() => {
  return (
    <div className="flex h-full min-h-[500px] flex-col pb-8">
      <OrdersPage />
    </div>
  );
});

DashboardOrdersView.displayName = "DashboardOrdersView";

export default DashboardOrdersView;
