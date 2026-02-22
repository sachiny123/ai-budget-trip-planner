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
            // Create new user with default credits
            await setDoc(userRef, {
                ...user,
                createdAt: new Date(),
                credits: 3,
                isPro: false,
                lastLogin: new Date()
            });
        } else {
            // Update existing user
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

    updateCredits: async (uid, amount) => {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            credits: increment(amount)
        });
        return { message: "Credits updated" };
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
