import logo1 from '../../../assets/livinglogowhite.png';

function Logo() {
    return (
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={logo1}
                alt="Living the Adventure"
                className="h-14 w-14 max-w-full scale-110 object-contain"
            />
        </div>
    );
}

export default Logo;