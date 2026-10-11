import Spinner from "../../Spinner/Spinner";
import useHoverDetails from "./useHoverDetails";
import { useRef } from "react";
import { GoPlus, GoCheck } from "react-icons/go";

function VerticalEventCard({ item, isFavourite, onToggleFavourite }) {
    const cardRef = useRef(null);

    const {
        isHovered,
        details,
        isLoading,
        handleMouseEnter,
        handleMouseLeave,
    } = useHoverDetails(item);

    const handleFavouriteClick = (e) => {
        // Prevent navigation to event details when clicking the favourite icon
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavourite) {
            onToggleFavourite(item.event_uuid || item.id);
        }
    };

    return (
        <div
            ref={cardRef}
            className="
        shrink-0
        w-36 sm:w-40 md:w-44 lg:w-52
        group
      "
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative">
                <a
                    href={`/eventDetails/${item.id}`}
                    className="block cursor-pointer transition-all duration-500"
                >
                    <div
                        className={`
              aspect-[2/3]
              rounded-xl
              overflow-hidden
              bg-gray-800
              relative
              transition-all duration-500
              ${isHovered
                                ? "shadow-2xl ring-2 ring-white/20"
                                : "group-hover:shadow-xl"}
            `}
                    >
                        {/* Image */}
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="
                w-full h-full object-cover
                transition-transform duration-500
                transform-gpu will-change-transform backface-hidden
                group-hover:scale-105
                lg:group-hover:scale-105
                lg:group-hover:brightness-100
                lg:hover:scale-110
              "
                            onError={(e) => {
                                e.target.src =
                                    "https://placehold.co/200x300/1a202c/ffffff?text=Error";
                            }}
                        />

                        {/* Gradient Overlay (desktop hover only) */}
                        <div
                            className={`
                absolute inset-0
                bg-gradient-to-t from-black/90 via-black/50 to-transparent
                transition-opacity
                hidden lg:block
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
                        />

                        {/* Loader */}
                        {isHovered && isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <Spinner />
                            </div>
                        )}

                        {/* Hover Content (desktop only) */}
                        {isHovered && !isLoading && (
                            <div className="absolute inset-0 hidden lg:flex flex-col justify-end p-3 z-20">
                                {details?.cover_image_url && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                                        <img
                                            src={details.cover_image_url}
                                            alt={details.title}
                                            className="w-full h-20 object-cover"
                                        />
                                    </div>
                                )}

                                <div className="bg-[#131720]/95 rounded-lg p-2.5 border border-white/10 backdrop-blur-md">
                                    <h3 className="text-sm font-bold text-white mb-1 truncate">
                                        {item.name}
                                    </h3>

                                    <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                                        {details?.short_description || item.description}
                                    </p>

                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded-md">
                                            Book Now
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleFavouriteClick}
                                            className={`
                                                border rounded-md w-7 h-7 flex items-center justify-center
                                                ${isFavourite ? "bg-green-600 border-green-400" : "border-gray-500"}
                                            `}
                                        >
                                            {isFavourite ? (
                                                <GoCheck className="text-white text-sm" />
                                            ) : (
                                                <GoPlus className="text-white text-sm" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </a>

                {/* Text below card (always visible on mobile) */}
                <div
                    className="
            mt-2 px-1
            transition-opacity
            lg:group-hover:opacity-0
          "
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-white capitalize truncate">
                        {item.name}
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default VerticalEventCard;
