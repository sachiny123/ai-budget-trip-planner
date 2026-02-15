
import express from 'express';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// CREATE TRIP
router.post('/', async (req, res) => {
    try {
        const tripData = req.body;
        if (!tripData.userId) {
            return res.status(400).json({ error: "Missing userId" });
        }

        const db = getDB();
        const result = await db.collection('trips').insertOne({
            ...tripData,
            createdAt: new Date()
        });

        res.json({ message: "Trip created", tripId: result.insertedId });
    } catch (error) {
        console.error("Error creating trip:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET ALL TRIPS (Admin)
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        // limit to 100 for safety, or implement pagination later
        const trips = await db.collection('trips').find().sort({ createdAt: -1 }).limit(100).toArray();
        res.json(trips);
    } catch (error) {
        console.error("Error fetching all trips:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET USER TRIPS
router.get('/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const db = getDB();

        const trips = await db.collection('trips')
            .find({ userId: uid })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(trips);
    } catch (error) {
        console.error("Error fetching trips:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET SINGLE TRIP
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Trip ID" });
        }

        const trip = await db.collection('trips').findOne({ _id: new ObjectId(id) });

        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json(trip);
    } catch (error) {
        console.error("Error fetching trip:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE TRIP
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Trip ID" });
        }

        const result = await db.collection('trips').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json({ message: "Trip deleted" });
    } catch (error) {
        console.error("Error deleting trip:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// CONFIRM BOOKING
router.post('/:id/book', async (req, res) => {
    try {
        const { id } = req.params;
        const bookingData = req.body; // should contain bookingId, paymentId, etc.
        const db = getDB();

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Trip ID" });
        }

        // 1. Update Trip
        const tripUpdate = await db.collection('trips').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isBooked: true,
                    bookingId: bookingData.bookingId,
                    bookedDetails: bookingData.bookedDetails, // transport, hotel, totalPaid
                    paymentId: bookingData.paymentId,
                    bookedAt: new Date()
                }
            }
        );

        if (tripUpdate.matchedCount === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        // 2. Add to User Bookings (Optimization: Embedding booking summary in user doc)
        const userId = bookingData.userId;
        if (userId) {
            await db.collection('users').updateOne(
                { uid: userId },
                { $push: { bookings: bookingData } }
            );
        }

        res.json({ message: "Booking confirmed" });
    } catch (error) {
        console.error("Error confirming booking:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
