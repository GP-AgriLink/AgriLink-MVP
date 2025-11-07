/**
 * DashboardOrdersView
 * Renders the orders management interface within the dashboard layout
 */

import IncomingOrders from '../Order/IncomingOrders';

const DashboardOrdersView = () => {
  return (
    <div className="text-center py-12 min-h-[400px] flex flex-col">
      <IncomingOrders />
    </div>
  );
};

export default DashboardOrdersView;
