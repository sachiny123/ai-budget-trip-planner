
const API_URL = "http://localhost:5000/api";

export const api = {
    // USER
    syncUser: async (user) => {
        const res = await fetch(`${API_URL}/users/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        return res.json();
    },

    getUser: async (uid) => {
        const res = await fetch(`${API_URL}/users/${uid}`);
        if (!res.ok) return null;
        return res.json();
    },

    updateCredits: async (uid, amount) => {
        const res = await fetch(`${API_URL}/users/credits`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, amount }),
        });
        return res.json();
    },

    // TRIPS
    createTrip: async (tripData) => {
        const res = await fetch(`${API_URL}/trips`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tripData),
        });
        return res.json();
    },

    getUserTrips: async (uid) => {
        const res = await fetch(`${API_URL}/trips/user/${uid}`);
        return res.json();
    },

    getTrip: async (id) => {
        const res = await fetch(`${API_URL}/trips/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    deleteTrip: async (id) => {
        await fetch(`${API_URL}/trips/${id}`, { method: "DELETE" });
    },

    // BOOKING
    confirmBooking: async (tripId, bookingData) => {
        const res = await fetch(`${API_URL}/trips/${tripId}/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
        });
        return res.json();
    },

    // ADMIN
    getAllUsers: async () => {
        const res = await fetch(`${API_URL}/users`);
        return res.json();
    },

    getAllTrips: async () => {
        const res = await fetch(`${API_URL}/trips`);
        return res.json();
    }
};
