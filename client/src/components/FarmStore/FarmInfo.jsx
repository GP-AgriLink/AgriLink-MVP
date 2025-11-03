import React, {useEffect, useState} from "react";

/**
 * Mock fallback data for farms when API fields are missing.
 */
const MOCK_FARM_DATA = {
  highlightsDescription: "Farm has no description yet.",
  certifications: ["Certified soon"],
  pickupDelivery: [
    "Farmstand pickup Fridays 3-6 PM",
    "Regional co-op delivery Saturdays",
    "CSA subscriptions available quarterly",
  ],
};

/**
 * Green dot list item used across the sidebar.
 */
const GreenDotListItem = ({children}) => (
  <li className="text-sm text-gray-700 flex items-start">
    <span className="block w-2 h-2 bg-[#2a9d8f] rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
    <span>{children}</span>
  </li>
);

/**
 *  reverse-geocoding (tries both lat/lon and lon/lat orders).
 */
const reverseGeocodeSmart = async (coords) => {
  if (!coords || coords.length < 2) return null;

  const a = Number(coords[0]);
  const b = Number(coords[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  const candidates = [
    {lat: b, lon: a},
    {lat: a, lon: b},
  ];

  const results = await Promise.all(
    candidates.map(async (c) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
            c.lat
          )}&lon=${encodeURIComponent(c.lon)}&format=json&accept-language=en`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const display = data?.display_name || "";
        return display.length > 0 ? display : null;
      } catch {
        return null;
      }
    })
  );

  const valid = results.filter(Boolean);
  if (valid.length === 0) return null;

  // Prefer longer / more descriptive result
  valid.sort((a, b) => b.length - a.length);
  return valid[0];
};

/**
 * FarmInfo component
 */
const FarmInfo = ({farm}) => {
  const [locationName, setLocationName] = useState("");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  if (!farm) return null;

  const {
    farmName = "Unnamed Farm",
    farmBio = MOCK_FARM_DATA.highlightsDescription,
    specialties = [],
    certifications = MOCK_FARM_DATA.certifications,
    pickupDelivery = MOCK_FARM_DATA.pickupDelivery,
    avatarUrl,
    location,
  } = farm;

  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      if (!location?.coordinates) {
        setLocationName("");
        return;
      }
      setIsResolvingLocation(true);
      const name = await reverseGeocodeSmart(location.coordinates);
      if (mounted) {
        setLocationName(name || "");
        setIsResolvingLocation(false);
      }
    };
    resolve();
    return () => {
      mounted = false;
    };
  }, [location]);

  return (
    <aside
      className="
        bg-white
        rounded-3xl
        p-6 lg:p-8
        h-fit
        shadow-xl
        border border-gray-100
      "
    >
      {/* Farm Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {farmName || "Farm Highlights"}
      </h3>

      {/* Avatar */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={farmName}
          className="w-20 h-20 rounded-full mb-4 object-cover"
        />
      )}

      {/* Bio */}
      {farmBio && (
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{farmBio}</p>
      )}

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Specialties
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s, i) => (
              <span
                key={i}
                className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6 hidden sm:block">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Certifications
          </h4>
          <div className="bg-emerald-50/60 rounded-2xl p-4">
            <ul className="space-y-2">
              {certifications.map((c, idx) => (
                <GreenDotListItem key={idx}>{c}</GreenDotListItem>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pickup & Delivery */}
      {pickupDelivery.length > 0 && (
        <div className="mb-6 hidden sm:block">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Pickup & Delivery
          </h4>
          <div className="bg-emerald-50/60 rounded-2xl p-4">
            <ul className="space-y-2">
              {pickupDelivery.map((p, idx) => (
                <GreenDotListItem key={idx}>{p}</GreenDotListItem>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Location
        </h4>

        <div className="bg-emerald-50/60 rounded-2xl p-4">
          {isResolvingLocation ? (
            <p className="text-sm text-gray-700">Resolving location…</p>
          ) : locationName ? (
            <ul className="space-y-2">
              <GreenDotListItem>{locationName}</GreenDotListItem>
            </ul>
          ) : (
            <p className="text-sm text-gray-700">Location not provided</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FarmInfo;
