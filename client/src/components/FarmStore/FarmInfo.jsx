import { useEffect, useState } from "react";
import { reverseGeocodeSmart } from "../../utils/geoCode.js";

// Fallback data in case farm is missing fields
const MOCK_FARM_DATA = {
  highlightsDescription: "Farm has no description yet.",
  certifications: ["Certified soon"],
  pickupDelivery: [
    "Farmstand pickup Fridays 3-6 PM",
    "Regional co-op delivery Saturdays",
    "CSA subscriptions available quarterly",
  ],
};

// Green dot list item
const GreenDotListItem = ({ children }) => (
  <li className="flex items-start text-sm text-gray-700">
    <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-[#2a9d8f]"></span>
    <span>{children}</span>
  </li>
);

const FarmInfo = ({ farm }) => {
  const [locationName, setLocationName] = useState("");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  // RESOLVE LOCATION

  useEffect(() => {
    if (!farm?.location?.coordinates) {
      setLocationName("");
      return;
    }

    let mounted = true;
    const resolve = async () => {
      setIsResolvingLocation(true);
      const name = await reverseGeocodeSmart(farm.location.coordinates);
      if (mounted) {
        setLocationName(name || "");
        setIsResolvingLocation(false);
      }
    };
    resolve();

    return () => {
      mounted = false;
    };
  }, [farm]);

  // ---------------------------
  // HANDLE CASE WHEN FARM NOT LOADED
  // ---------------------------
  if (!farm) {
    return (
      <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-xl lg:p-8">
        <p className="text-gray-700">Loading farm info…</p>
      </aside>
    );
  }

  // ---------------------------
  // DESTRUCTURE FARM DATA
  // ---------------------------
  const {
    farmName = "Unnamed Farm",
    farmBio = MOCK_FARM_DATA.highlightsDescription,
    specialties = [],
    certifications = MOCK_FARM_DATA.certifications,
    pickupDelivery = MOCK_FARM_DATA.pickupDelivery,
    avatarUrl,
  } = farm;

  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-xl lg:p-8">
      {/* Farm Title */}
      <h3 className="mb-3 text-xl font-bold text-gray-900">{farmName}</h3>

      {/* Avatar */}
      {avatarUrl && (
        <img src={avatarUrl} alt={farmName} className="mb-4 h-20 w-20 rounded-full object-cover" />
      )}

      {/* Bio */}
      {farmBio && <p className="mb-6 text-sm leading-relaxed text-gray-600">{farmBio}</p>}

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Specialties
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-semibold text-teal-800"
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
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Certifications
          </h4>
          <div className="rounded-2xl bg-emerald-50/60 p-4">
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
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Pickup & Delivery
          </h4>
          <div className="rounded-2xl bg-emerald-50/60 p-4">
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
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Location</h4>
        <div className="rounded-2xl bg-emerald-50/60 p-4 transition-all duration-700 ease-in-out">
          {isResolvingLocation ? (
            <p className="animate-pulse text-sm text-gray-700">Resolving location…</p>
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
