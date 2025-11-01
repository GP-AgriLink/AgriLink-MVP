// src/components/cart/ContactForm.jsx

export default function ContactForm({ 
  fullName, 
  setFullName, 
  phoneNumber, 
  setPhoneNumber, 
  onSubmit, 
  loading 
}) {
  return (
    // This is the white box on the right
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-fit">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Contact Information
      </h2>
      
      {/* Label text with the light emerald color you requested */}
      <p className="text-emerald-400 text-sm mb-6">
        We will reach out to confirm delivery details and timing.
      </p>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-emerald-400 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="your name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
        </div>
        
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-emerald-400 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+20 111 118 1111"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Confirming...' : 'Confirm Order (Pay on Delivery)'}
        </button>
      </div>
    </form>
  );
}