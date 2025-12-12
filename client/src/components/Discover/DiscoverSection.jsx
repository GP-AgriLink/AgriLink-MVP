import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_DISTANCE = 10000;
const FALLBACK_POSITION = [30.0444, 31.2357]; // Default Cairo

const FlyToLocation = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.latitude, coords.longitude], 13, {
                duration: 2,
                easeLinearity: 0.25,
            });
        }
    }, [coords, map]);
    return null;
};

const DiscoverSection = ({ onLocationSet, userCoords }) => {
    const [searchLocation, setSearchLocation] = useState("");
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(FALLBACK_POSITION);
    const [locationName, setLocationName] = useState("Your Selected Location");

    // Auto-fetch location on page load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        distance: DEFAULT_DISTANCE,
                    };
                    onLocationSet(coords);
                    setMapCenter([coords.latitude, coords.longitude]);
                },
                (err) => {
                    console.error("Error getting initial location:", err);
                }
            );
        }
    }, [onLocationSet]);

    useEffect(() => {
        if (userCoords) {
            setLocationName("Fetching address...");

            // 2. Call the API
            fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.latitude}&lon=${userCoords.longitude}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.state;
                        const country = data.address.country;

                        const displayName = city ? `${city}, ${country}` : country;

                        setLocationName(displayName || "Unknown Location");
                    } else {
                        setLocationName("Location Found");
                    }
                })
                .catch((err) => {
                    console.error("Reverse geocoding failed", err);
                    setLocationName("Selected Location");
                });
        }
    }, [userCoords]);

    // Handler for the "Use My Location" button
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setLoadingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    distance: DEFAULT_DISTANCE,
                };
                onLocationSet(coords);
                setLoadingLocation(false);
            },
            (err) => {
                console.error(err);
                setError("Unable to retrieve your location.");
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Handler for the search bar
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchLocation) return;
        setLoadingLocation(true);
        setError(null);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchLocation
                )}`
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coords = {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                    distance: DEFAULT_DISTANCE,
                };
                onLocationSet(coords);
            } else {
                setError("Location not found. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching location.");
        } finally {
            setLoadingLocation(false);
        }
    };

    return (
        <div className="relative w-full bg-emerald-50" id="DiscoverSection">

            <div className="mx-auto max-w-2xl text-center px-4 pt-16 lg:pt-20">
                <p className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wider mt-4 mb-2">
                    Discover
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Explore Our Farms
                </h2>
                <div className="mx-auto mt-5 w-20 h-1 bg-green-700"></div>
            </div>

            <div className="container mx-auto grid min-h-[60vh] lg:min-h-[70vh] grid-cols-1 items-center gap-12 px-4 py-12 lg:py-20 lg:grid-cols-2">

                <div className="text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 drop-shadow-sm leading-tight">
                        Discover fresh produce,<br className="hidden sm:block" />
                        grown near you.
                    </h1>

                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                        Explore AgriLink's interactive farm network map. Hover or click on a marker to learn more about each farm, their growing practices, and shop their seasonal offerings.
                    </p>

                    <div className="mt-8 sm:mt-10 max-w-lg mx-auto lg:mx-0 space-y-4">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full"
                        >
                            <input
                                type="text"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                placeholder="Enter your city or zip code"
                                className="w-full rounded-full border border-gray-300 px-6 py-4 pr-14 text-base sm:text-lg shadow-lg
                                focus:outline-none focus:border-emerald-200 focus:ring-1 focus:ring-emerald-200 caret-emerald-200"
                            />

                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 p-2.5 sm:p-3 text-white shadow-md transition-colors hover:bg-emerald-700"
                                disabled={loadingLocation}
                            >
                                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </form>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:justify-start">
                            <span className="text-gray-500 hidden sm:inline">or</span>
                            <button
                                onClick={handleUseMyLocation}
                                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-600 shadow-lg transition-all hover:shadow-xl w-full sm:w-auto justify-center"
                                disabled={loadingLocation}
                            >
                                <MapPin className="h-5 w-5" />
                                {loadingLocation ? "Locating..." : "Use My Location"}
                            </button>
                        </div>

                        {error && <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>}
                    </div>
                </div>

                {/* --- Map --- */}
                <div className="h-[400px] w-full rounded-2xl shadow-lg lg:h-[50vh] z-0 overflow-hidden relative">
                    <MapContainer
                        center={mapCenter}
                        zoom={10}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <FlyToLocation coords={userCoords} />

                        {userCoords && (
                            <Marker
                                position={[userCoords.latitude, userCoords.longitude]}
                            >
                                <Popup>{locationName}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default DiscoverSection;