/**
 * DashboardOrdersView
 * Renders the orders management interface within the dashboard layout
 */

import OrdersPage from '../../pages/OrdersPage';

const DashboardOrdersView = () => {
  return (
    <div className="text-center py-12 min-h-[400px] flex flex-col">
      <OrdersPage />
    </div>
  );
};

export default DashboardOrdersView;
