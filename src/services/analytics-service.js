// Basic Analytics Service for TripWise
// Can be integrated with PostHog, Segment, or Google Analytics later

const ENABLE_LOGGING = import.meta.env.MODE === 'development';

export const analytics = {
    track: (eventName, properties = {}) => {
        if (ENABLE_LOGGING) {
            console.log(`[ANALYTICS] ${eventName}`, properties);
        }

        // Production Implementation Placeholder
        // if (window.gtag) {
        //     window.gtag('event', eventName, properties);
        // }
    },

    identify: (userId, traits = {}) => {
        if (ENABLE_LOGGING) {
            console.log(`[ANALYTICS] Identify: ${userId}`, traits);
        }
    },

    page: (pageName) => {
        if (ENABLE_LOGGING) {
            console.log(`[ANALYTICS] Page: ${pageName}`);
        }
    }
};

export const EVENTS = {
    SIGNUP: 'signup_completed',
    LOGIN: 'login_success',
    TRIP_CREATED: 'trip_created',
    EXPENSE_ADDED: 'expense_added',
    BOOKING_INITIATED: 'booking_initiated',
    BOOKING_COMPLETED: 'booking_completed',
    AD_CLICKED: 'affiliate_link_clicked'
};
