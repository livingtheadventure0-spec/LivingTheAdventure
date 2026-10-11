import NavBar from '../Nav/NavBar';
import Hero from '../Hero/Hero';
import Footer from '../Footer/Footer';
import AuthButton from '../../Authentication/authButton';
import { useAuth } from '../../context/AuthContext';

function Home({ heroType }) {
    const { user } = useAuth();
    return (
        <main className="flex flex-col min-h-screen bg-black">

            {/* Navbar */}
            <div className="sticky top-0 z-40">
                <NavBar />
            </div>
            {user ? null : <div className='z-40'>
                <AuthButton />
            </div>}
            {/* Hero */}
            <div className="relative z-20">
                <Hero heroType={heroType} />
            </div>

            {/* Divider + Footer */}
            <div className="relative z-30 w-full">

                {/* Center Divider */}
                <div className="flex justify-center my-6">
                    <div className="w-40 sm:w-48 md:w-52 h-px bg-white/40 rounded-full" />
                </div>

                <Footer />
            </div>

        </main>
    );
}

export default Home;
