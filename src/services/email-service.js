export const sendBookingConfirmation = async (email, bookingDetails) => {
    console.log(`[Email Service] Sending confirmation to ${email}...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[Email Service] Email Sent Successfully!`);
    console.log(`[Email Content] 
    Subject: Booking Confirmed! #${bookingDetails.bookingId}
    Hi there,
    Your trip to ${bookingDetails.destination} is confirmed.
    Total Paid: ₹${bookingDetails.totalPaid}
    
    Download your tickets from the dashboard.
    - Team TripWise
    `);

    return { success: true, timestamp: new Date().toISOString() };
};
