import logo1 from '../../../assets/livinglogowhite.png';

function Logo() {
    return (
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={logo1}
                alt="Living the Adventure"
                className="h-12 w-12 max-w-full object-contain"
            />
        </div>
    );
}

export default Logo;