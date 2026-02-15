
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://sachinyadavpy23_db_user:Sac@2332@cluster0.crec2ze.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

export async function connectDB() {
    try {
        await client.connect();
        // Assuming database name 'tripwise' - change if needed or parse from URI
        db = client.db("tripwise");
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return db;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
}
