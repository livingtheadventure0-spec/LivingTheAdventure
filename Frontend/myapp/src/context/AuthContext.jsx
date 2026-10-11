import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Authentication/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            try {
                // Simple client-side session expiry.
                // Firebase keeps users logged in by default (persistent local session + token refresh).
                // We enforce a max session age so the UI requires login again after N days.
                const MAX_AGE_DAYS = Number(import.meta.env?.VITE_AUTH_MAX_AGE_DAYS ?? 7);
                const MAX_AGE_MS = Math.max(0, MAX_AGE_DAYS) * 24 * 60 * 60 * 1000;

                if (firebaseUser) {
                    const key = "auth:loginAt";
                    const now = Date.now();
                    const stored = Number(localStorage.getItem(key));

                    // First time we see a logged-in user on this device, stamp login time.
                    if (!stored || Number.isNaN(stored)) {
                        localStorage.setItem(key, String(now));
                        setUser(firebaseUser);
                        setLoading(false);
                        return;
                    }

                    // Expired -> force sign out so app asks for login again.
                    if (MAX_AGE_MS > 0 && now - stored > MAX_AGE_MS) {
                        localStorage.removeItem(key);
                        signOut(auth).finally(() => {
                            setUser(null);
                            setLoading(false);
                        });
                        return;
                    }
                } else {
                    localStorage.removeItem("auth:loginAt");
                }
            } catch {
                // If anything goes wrong, fall back to normal behaviour.
            }

            setUser(firebaseUser);
            setLoading(false);
        });

        return unsubscribe;

    }, []);

    const logout = async () => {
        localStorage.removeItem("auth:loginAt");
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);