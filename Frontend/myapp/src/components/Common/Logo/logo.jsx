import logo1 from '../../../assets/livinglogowhite.png';

function Logo() {
    return (
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={logo1}
                alt="Living the Adventure"
                className="ml-0 h-8 w-auto max-w-full object-contain sm:ml-4 sm:h-8 md:ml-4 md:h-10 lg:h-10"
            />
        </div>
    );
}

export default Logo;