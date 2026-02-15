import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,

    onAuthStateChanged
} from "firebase/auth";
import { api } from "../services/api-service";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await api.syncUser({
            uid: result.user.uid,
            email: result.user.email,
        });
        return result;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
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
