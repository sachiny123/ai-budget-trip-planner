import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    orderBy
} from "firebase/firestore";

const API_URL = "http://localhost:5000/api"; // Keep for AI/Payment endpoints

export const api = {
    // USER
    syncUser: async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // [ABUSE PREVENTION] Initial state for new users
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Explorer",
                photoURL: user.photoURL || "",
                createdAt: new Date(),
                credits: 3,             // Starting balance
                creditsUsed: 0,
                freeCreditsGranted: true,
                isPro: false,
                emailVerified: false,   // Default to false until first sync confirms
                lastLogin: new Date()
            });
        } else {
            // Update existing user with latest profile info
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: new Date()
            }, { merge: true });
        }
        return { message: "User synced" };
    },

    getUser: async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
    },

    // [CREDIT LOGIC]
    deductCredit: async (uid, actionType, metadata = {}) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) throw new Error("User not found");
        const userData = userSnap.data();

        if (userData.credits <= 0) throw new Error("No credits remaining");

        // 1. Atomic Update
        await updateDoc(userRef, {
            credits: increment(-1),
            creditsUsed: increment(1)
        });

        // 2. Audit Logging
        await addDoc(collection(db, "creditTransactions"), {
            userId: uid,
            amount: -1,
            action: actionType,
            timestamp: new Date(),
            metadata: {
                ...metadata,
                email: userData.email
            }
        });

        return { message: "Credit deducted successfully" };
    },

    updateCredits: async (uid, amount, source = "admin") => {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            credits: increment(amount)
        });

        // Log manual/admin boost
        await addDoc(collection(db, "creditTransactions"), {
            userId: uid,
            amount: amount,
            action: "admin_grant",
            source: source,
            timestamp: new Date()
        });

        return { message: "Credits updated" };
    },

    // [UPGRADE REQUESTS]
    submitUpgradeRequest: async (uid, data) => {
        const requestData = {
            userId: uid,
            ...data,
            status: "pending",
            createdAt: new Date()
        };
        const docRef = await addDoc(collection(db, "upgradeRequests"), requestData);
        return { id: docRef.id, message: "Request submitted" };
    },

    getUpgradeRequests: async () => {
        const q = query(collection(db, "upgradeRequests"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    resolveUpgradeRequest: async (requestId, status, adminNote = "") => {
        const reqRef = doc(db, "upgradeRequests", requestId);
        await updateDoc(reqRef, {
            status,
            adminNote,
            resolvedAt: new Date()
        });

        if (status === "approved") {
            const reqSnap = await getDoc(reqRef);
            const data = reqSnap.data();
            // Grant credits automatically on approval
            await api.updateCredits(data.userId, data.amountRequested || 10, "payment_approval");
        }
    },

    // TRIPS
    createTrip: async (tripData) => {
        const docRef = await addDoc(collection(db, "trips"), {
            ...tripData,
            createdAt: new Date()
        });
        return { message: "Trip created", tripId: docRef.id };
    },

    getUserTrips: async (uid) => {
        const q = query(
            collection(db, "trips"),
            where("userId", "==", uid)
            // Note: Firestore requires an index for complex queries (where + sort). 
            // Sorting client-side after fetch to avoid index errors for now.
        );
        const querySnapshot = await getDocs(q);
        const trips = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt descending
        return trips.sort((a, b) => b.createdAt - a.createdAt);
    },

    getTrip: async (id) => {
        const docRef = doc(db, "trips", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    deleteTrip: async (id) => {
        await deleteDoc(doc(db, "trips", id));
    },

    // BOOKING
    confirmBooking: async (tripId, bookingData) => {
        const tripRef = doc(db, "trips", tripId);

        // 1. Update Trip
        await updateDoc(tripRef, {
            isBooked: true,
            bookingId: bookingData.bookingId,
            bookedDetails: bookingData.bookedDetails,
            paymentId: bookingData.paymentId,
            bookedAt: new Date()
        });

        // 2. Add to User (using arrayUnion if we wanted, but sticking to logic)
        // Ideally we should have a subcollection or separate bookings collection, 
        // but to match previous behavior (embedding/updating user):

        // This part was a bit redundant in the original backend code (pushing to user bookings array).
        // Let's create a separate 'bookings' collection for cleaner NoSQL structure
        await addDoc(collection(db, "bookings"), bookingData);

        return { message: "Booking confirmed" };
    },

    // ADMIN - PROXY TO BACKEND OR CLIENT-SIDE FETCH?
    // User asked to revert. Assuming Admin panel also works on Firestore now.
    getAllUsers: async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => doc.data());
    },

    getAllTrips: async () => {
        const querySnapshot = await getDocs(collection(db, "trips"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    getAllBookings: async () => {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // API ENDPOINTS (Flight/Hotel Search, AI) - Still via Backend
    searchFlights: async (params) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/flights/search?${query}`);
        return res.json();
    },

    searchHotels: async (cityCode) => {
        const res = await fetch(`${API_URL}/hotels/search?cityCode=${cityCode}`);
        return res.json();
    }
};
