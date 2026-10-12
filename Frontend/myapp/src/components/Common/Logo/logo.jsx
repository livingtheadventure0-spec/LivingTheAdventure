import logo1 from '../../../assets/LTA_2.png';

function Logo() {
    return (
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={logo1}
                alt="Living the Adventure"
                className="h-12 w-auto max-w-full object-contain sm:h-16 md:h-20 ml-6"
            />
        </div>
    );
}

export default Logo;
