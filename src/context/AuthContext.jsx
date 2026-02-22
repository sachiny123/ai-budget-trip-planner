import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { api } from "../services/api-service";
import { analytics, EVENTS } from "../services/analytics-service";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ensure local persistence for production users
        setPersistence(auth, browserLocalPersistence);
    }, []);

    const signup = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        analytics.track(EVENTS.SIGNUP, { method: 'email', uid: result.user.uid });

        // [PRODUCTION HARDENING] Send verification email
        try {
            await sendEmailVerification(result.user);
        } catch (e) {
            console.error("Verification email failed:", e);
        }

        await api.syncUser({
            uid: result.user.uid,
            email: result.user.email,
        });
        return result;
    };

    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        analytics.track(EVENTS.LOGIN, { method: 'email', uid: result.user.uid });
        return result;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        analytics.track(EVENTS.LOGIN, { method: 'google', uid: result.user.uid });
        await api.syncUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
        });
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Sync user data from MongoDB
                try {
                    const userData = await api.getUser(user.uid);
                    if (userData) {
                        setUserData(userData);
                    } else {
                        // If not in DB for some reason, sync it
                        await api.syncUser({ uid: user.uid, email: user.email });
                        const newUserData = await api.getUser(user.uid);
                        setUserData(newUserData);
                    }
                } catch (err) {
                    console.error("Failed to fetch user data:", err);
                }
                setLoading(false);
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
