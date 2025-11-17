/**
 * DashboardOrdersView
 * Renders the orders management interface within the dashboard layout
 * Note: This component is currently not used in the routing.
 * The /dashboard/orders route directly uses OrdersPage.jsx instead.
 */

import OrdersPage from '../../pages/OrdersPage';

const DashboardOrdersView = () => {
  return (
    <div className="min-h-[400px]">
      <OrdersPage />
    </div>
  );
};

export default DashboardOrdersView;
