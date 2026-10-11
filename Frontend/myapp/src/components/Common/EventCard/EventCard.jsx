import VerticalEventCard from "./VerticalEventCard";
import HorizontalEventCard from "./HorizontalCard";


const EventCard = ({ item, title, favourites, onToggleFavourite }) => {
    const isSpecialType = ["Special Event", "Best Of The Year"].includes(title);
    const key = item.event_uuid || item.id;
    const isFavourite = favourites instanceof Set ? favourites.has(key) : false;

    return (
        <>
            {!isSpecialType ? (
                <div>
                    <VerticalEventCard
                        item={item}
                        isFavourite={isFavourite}
                        onToggleFavourite={onToggleFavourite}
                    />
                </div>
            ) : (
                <div>
                    <HorizontalEventCard
                        item={item}
                        isFavourite={isFavourite}
                        onToggleFavourite={onToggleFavourite}
                    />
                </div>
            )}
        </>
    );
};

export default EventCard;
