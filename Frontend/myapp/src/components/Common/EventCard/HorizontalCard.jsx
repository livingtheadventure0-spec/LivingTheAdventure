import { useRef } from "react";
import Spinner from "../../Spinner/Spinner";
import useHoverDetails from "./useHoverDetails";
import { GoPlus, GoCheck } from "react-icons/go";

const HorizontalEventCard = ({ item, isFavourite, onToggleFavourite }) => {
    const cardRef = useRef(null);

    const {
        isHovered,
        details,
        isLoading,
        handleMouseEnter,
        handleMouseLeave,
    } = useHoverDetails(item);

    const handleFavouriteClick = (e) => {
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
        w-full
        max-w-52 sm:max-w-sm md:max-w-sm
        group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <a href={`/eventDetails/${item.id}`} className="block">
                <div
                    className={`
            relative aspect-[5/3]
            rounded-lg overflow-hidden bg-gray-800
            transition-all duration-300
            ${isHovered
                            ? "shadow-xl ring-1 ring-white/20"
                            : "group-hover:shadow-lg"}
          `}
                >
                    {/* Image */}
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        width="480"
                        height="288"
                        className="
                w-full h-full object-cover
                transition-transform duration-300
                transform-gpu will-change-transform backface-hidden
                group-hover:scale-102
                lg:hover:scale-105
                "
                    />

                    {/* Gradient */}
                    <div
                        className="
              absolute inset-0
              bg-gradient-to-r from-black/70 via-black/30 to-transparent
              pointer-events-none
            "
                    />

                    {/* Loader (desktop hover only) */}
                    {isHovered && isLoading && (
                        <div className="absolute inset-0 hidden lg:flex items-center justify-center z-30">
                            <Spinner />
                        </div>
                    )}

                    {/* Hover Content (desktop only) */}
                    {isHovered && !isLoading && (
                        <div className="absolute inset-0 hidden lg:flex flex-col justify-end p-3 z-20">
                            <h3 className="text-sm font-semibold text-white truncate mb-0.5">
                                {item.name}
                            </h3>

                            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
                                {details?.short_description || item.description}
                            </p>

                            <div className="flex gap-2">
                                <button className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-md">
                                    Book
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
                    )}
                </div>
            </a>

            {/* Mobile / Tablet content (always visible) */}
            <div className="mt-2 px-1 lg:hidden">
                <h3 className="text-sm font-semibold text-white truncate">
                    {item.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                    {item.description}
                </p>
            </div>
        </div>
    );
};

export default HorizontalEventCard;
