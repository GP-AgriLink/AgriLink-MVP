/**
 * PastOrders
 * Displays a table of completed or cancelled orders.
 * @param {Array} orders - List of full order objects
 */
const PastOrders = ({ orders }) => {
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const canceledCount = orders.filter((o) => o.status === "Cancelled").length;

  const formatDate = (order) => {
    const dateStr = order.date; // Use the 'date' prop passed from OrdersPage
    if (!dateStr) return "Unknown Date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Unknown Date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  return (
    <section className="space-y-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">Past Orders</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
            {completedCount} Completed
          </span>
          <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium">
            {canceledCount} Cancelled
          </span>
        </div>
      </div>

      <p className="text-gray-500 text-left text-sm">
        Review completed deliveries and canceled orders for quick reference.
      </p>

      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-b from-white to-white/0 z-10"></div>

        <div className="bg-white shadow-lg rounded-2xl border border-green-100 overflow-y-auto max-h-[450px] scroll-smooth custom-scrollbar">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-green-100 text-gray-600 uppercase text-xs tracking-wide sticky top-0 z-20">
              <tr>
                <th className="py-4 px-6 text-center">Order ID</th>
                <th className="py-4 px-6 text-center">Customer</th>
                <th className="py-4 px-6 text-center">Total</th>
                <th className="py-4 px-6 text-center">Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-t hover:bg-green-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                >
                  <td className="py-4 px-6 font-medium">#{order.id.slice(-6)}</td>
                  <td className="py-4 px-6">{order.customer}</td>
                  <td className="py-4 px-6">${order.total.toFixed(2)}</td>
                  <td className="py-4 px-6">{formatDate(order)}</td>
                  <td
                    className={`py-4 px-6 font-semibold ${order.status === "Completed"
                        ? "text-green-600"
                        : "text-red-900"
                      }`}
                  >
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-t from-white to-white/0 z-10"></div>
      </div>
    </section>
  );
};

export default PastOrders;