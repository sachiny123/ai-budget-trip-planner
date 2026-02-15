const API_URL = "http://localhost:5000/api";

export const searchFlights = async (origin, destination, date, adults = 1) => {
    try {
        const response = await fetch(`${API_URL}/flights/search?origin=${origin}&destination=${destination}&date=${date}&adults=${adults}`);
        if (!response.ok) throw new Error("Flight search failed");
        return await response.json();
    } catch (error) {
        console.error("Flight Search UI Error:", error);
        return [];
    }
};

export const searchHotels = async (cityCode) => {
    try {
        const response = await fetch(`${API_URL}/hotels/search?cityCode=${cityCode}`);
        if (!response.ok) throw new Error("Hotel search failed");
        return await response.json();
    } catch (error) {
        console.error("Hotel Search UI Error:", error);
        return [];
    }
};
