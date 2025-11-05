import { useState } from 'react';
import { Search, Map } from 'lucide-react';

const options = [
  { label: '1 km', value: 1000 },
  { label: '10 km (Default)', value: 10000 },
  { label: '100 km', value: 100000 },
  { label: '1000 km', value: 1000000 },
];

const DistanceFilter = ({ onFilterChange, isLoading, defaultFilter }) => {
  const [mode, setMode] = useState(defaultFilter.mode);
  const [distance, setDistance] = useState(defaultFilter.distance);
  const [customKm, setCustomKm] = useState('');

  const handleModeChange = (newMode, newDistance = null) => {
    setMode(newMode);
    if (newMode === 'all') {
      onFilterChange({ mode: 'all' });
    } else if (newMode === 'nearby' && newDistance) {
      setDistance(newDistance);
      onFilterChange({ mode: 'nearby', distance: newDistance });
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const distanceInMeters = parseFloat(customKm) * 1000;
    if (distanceInMeters > 0) {
      setDistance(distanceInMeters);
      setMode('nearby');
      onFilterChange({ mode: 'nearby', distance: distanceInMeters });
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Filter by Distance</h3>
      <fieldset disabled={isLoading}>
        <legend className="sr-only">Distance Options</legend>
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${mode === 'nearby' && distance === option.value
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="font-medium text-gray-800">{option.label}</span>
              <input
                type="radio"
                name="distance"
                value={option.value}
                checked={mode === 'nearby' && distance === option.value}
                onChange={() => handleModeChange('nearby', option.value)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
            </label>
          ))}

          {/* View All Farms Option */}
          <label
            className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${mode === 'all'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="font-medium text-gray-800">View All Farms</span>
            <input
              type="radio"
              name="distance"
              value="all"
              checked={mode === 'all'}
              onChange={() => handleModeChange('all')}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
          </label>
        </div>
      </fieldset>

      {/* Custom Input Section */}
      <form onSubmit={handleCustomSubmit} className="mt-6 pt-4 border-t">
        <label htmlFor="custom-distance" className="block text-sm font-semibold text-gray-700 mb-2">
          Custom Distance (km)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            id="custom-distance"
            value={customKm}
            onChange={(e) => setCustomKm(e.target.value)}
            disabled={isLoading}
            min="1"
            placeholder="e.g., 25"
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !customKm}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            aria-label="Search custom distance"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DistanceFilter;