import Amadeus from 'amadeus';
import dotenv from 'dotenv';

dotenv.config();

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

// Helper to handle Amadeus API responses
const handleResponse = async (apiCall) => {
    try {
        const response = await apiCall;
        return response.data;
    } catch (error) {
        console.error("Amadeus API Error:", error.response ? error.response.result : error);
        throw error;
    }
};

export const searchFlights = async (origin, destination, date, adults = 1) => {
    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults,
            max: 10 // Limit results for now
        });
        return response.data;
    } catch (error) {
        console.error("Flight Search Error:", error);
        return [];
    }
};

export const searchHotels = async (cityCode) => {
    // Note: Hotel search in Amadeus is complex (City Search -> Hotel IDs -> Offers)
    // For simplicity in this iteration, we'll fetch hotels in a city
    try {
        const response = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: cityCode
        });
        return response.data;
    } catch (error) {
        console.error("Hotel Search Error:", error);
        return [];
    }
};

export default amadeus;
