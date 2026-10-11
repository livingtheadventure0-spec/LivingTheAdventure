import Event from '../Event/Event';
import Slider from '../Slider/Slider';

function MainPage({ heroType, heroContent, favourites, onToggleFavourite }) {
    return (
        <div>
            <Slider
                heroContent={heroContent}
                favourites={favourites}
                onToggleFavourite={onToggleFavourite}
            />
            <Event heroType={heroType} />
        </div>
    );
}

export default MainPage;