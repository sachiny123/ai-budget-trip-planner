
import express from 'express';
import { getDB } from '../config/db.js';

const router = express.Router();

// SYNC USER (Create or Update)
router.post('/sync', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { uid: uid },
            {
                $set: {
                    email,
                    displayName,
                    photoURL,
                    lastLogin: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date(),
                    credits: 3, // Default credits
                    isPro: false
                }
            },
            { upsert: true }
        );

        res.json({ message: "User synced", result });
    } catch (error) {
        console.error("Error syncing user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET USER PROFILE
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const db = getDB();
        const user = await db.collection('users').findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET ALL USERS (Admin)
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('users').find().toArray();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// UPDATE CREDITS
router.post('/credits', async (req, res) => {
    try {
        const { uid, amount } = req.body; // Amount can be positive (add) or negative (deduct)

        if (!uid || amount === undefined) {
            return res.status(400).json({ error: "Missing uid or amount" });
        }

        const db = getDB();
        const result = await db.collection('users').updateOne(
            { uid: uid },
            { $inc: { credits: Number(amount) } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Credits updated", result });
    } catch (error) {
        console.error("Error updating credits:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
