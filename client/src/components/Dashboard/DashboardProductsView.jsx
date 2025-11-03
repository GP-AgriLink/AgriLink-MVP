/**
 * DashboardProductsView
 * Renders the products management interface with add/edit capabilities
 * @param {Function} onEdit - Handler for product edit action
 * @param {Function} onAddNew - Handler for new product creation
 */

import MyProductsPage from '../../pages/FarmProductsPage';

const DashboardProductsView = ({ onEdit, onAddNew }) => {
  return (
    <div className="text-center py-12 min-h-[400px] flex flex-col">
      <MyProductsPage
        onEdit={onEdit}
        onAddNew={onAddNew}
      />
    </div>
  );
};

export default DashboardProductsView;
