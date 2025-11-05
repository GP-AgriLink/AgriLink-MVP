import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Tag } from 'lucide-react';

const FarmCard = ({ farm }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      {/* Image Placeholder */}
      <div className="w-full h-40 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center">
        <MapPin className="h-12 w-12 text-emerald-300" />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{farm.farmName}</h2>

        {/* Specialties as Tags */}
        {farm.specialties && farm.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400 mt-0.5" strokeWidth={1.5} />
            {farm.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/farm/${farm._id}`}
          className="inline-flex items-center justify-center w-full px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors group"
        >
          Visit Store
          <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export const FarmCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
      <div className="p-5">
        <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse mb-3"></div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default FarmCard;