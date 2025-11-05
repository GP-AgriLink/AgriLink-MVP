import { useState, useEffect } from 'react';
import { getNearbyFarms, getAllFarms } from '../services/farmApi';
import FarmCard, { FarmCardSkeleton } from '../components/Discover/FarmCard';
import DistanceFilter from '../components/Discover/DistanceFilter';

const DEFAULT_FILTER = { mode: 'nearby', distance: 10000 }; // Default 10km

const DiscoverPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER);

  const fetchFarms = (loc, filter) => {
    setLoading(true);
    setError(null);

    if (filter.mode === 'all') {
      getAllFarms()
        .then(setFarms)
        .catch(() => setError('Could not fetch farms.'))
        .finally(() => setLoading(false));
    } else if (filter.mode === 'nearby') {
      if (!loc) {
        setLocationError('Please enable location services to find nearby farms.');
        setLoading(false);
        setFarms([]);
        return;
      }
      setLocationError(null);
      getNearbyFarms({
        latitude: loc.latitude,
        longitude: loc.longitude,
        distance: filter.distance,
      })
        .then(setFarms)
        .catch(() => setError('Could not fetch nearby farms.'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(userLocation);
          fetchFarms(userLocation, currentFilter);
        },
        () => {
          setLocationError('Unable to retrieve your location. "Nearby" search is disabled.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []); // Only runs on initial mount

  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter);
    fetchFarms(location, newFilter);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <FarmCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-12 text-red-500 font-medium">{error}</div>;
    }

    if (farms.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {farms.map((farm) => (
            <FarmCard key={farm._id} farm={farm} />
          ))}
        </div>
      );
    }

    if (!locationError) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">No Farms Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try expanding your search radius to find more farms.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Discover Local Farms</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Find fresh produce and support farmers near you.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit">
          <DistanceFilter
            onFilterChange={handleFilterChange}
            isLoading={loading}
            defaultFilter={DEFAULT_FILTER}
          />
          {locationError && (
            <div className="mt-4 text-center p-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg">
              {locationError}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 mt-10 lg:mt-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;