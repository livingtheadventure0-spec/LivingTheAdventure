function AuthButton() {
    return (
        <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur text-white rounded-xl shadow-lg border border-white/10 p-1.5">
                <a href="/auth">
                    <button className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition">
                        Login
                    </button>
                </a>
                <a href="/signup">
                    <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition">
                        Signup
                    </button>
                </a>
            </div>
        </div>
    );
}

export default AuthButton;