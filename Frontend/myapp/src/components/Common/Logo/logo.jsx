import logo1 from '../../../assets/LTA_2.png';

function Logo() {
    return (
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={logo1}
                alt="Living the Adventure"
                className="mx-auto block h-8 w-auto max-w-full object-contain sm:h-8 md:h-10 lg:h-10"
            />
        </div>
    );
}

export default Logo;