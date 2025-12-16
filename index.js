// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkciokq.mongodb.net/?appName=Cluster0`;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("blood_donet_db");
    const donorsCollection = db.collection("donors");

    console.log("Connected successfully to MongoDB!");

    // --------> API ROUTES <--------

    // Root
    app.get("/", (req, res) => {
      res.send("Blood donation API is running!");
    });

    // Get all donors
    app.get("/donors", async (req, res) => {
      try {
        const donors = await donorsCollection.find().toArray();
        res.send(donors);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Add a new donor
    app.post("/donors", async (req, res) => {
      try {
        const donor = req.body;
        const result = await donorsCollection.insertOne(donor);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

