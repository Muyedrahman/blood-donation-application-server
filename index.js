// index.js
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");


const port = process.env.PORT || 3000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);



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

    // Collections
    const donorsCollection = db.collection("donors");
    const donationRequestsCollection = db.collection("donation_requests");
    const fundingCollection = db.collection("fundings");


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

    // GET donation requests by user email
    app.get("/donation-requests", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};
        if (email) {
          query.requesterEmail = email;
        }

        const result = await donationRequestsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch donation requests" });
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

    // POST donation request
    app.post("/donation-requests", async (req, res) => {
      try {
        const donation = req.body;
        donation.status = "pending";
        donation.createdAt = new Date();

        const result = await donationRequestsCollection.insertOne(donation);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to create donation request" });
      }
    });


    // payment related apis
    app.post("/create-payment-intent", async (req, res) => {
      const { amount } = req.body;
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // BDT cents
          currency: "bdt",
          payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        res.status(500).send({ error: error.message });
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

// // index.js
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { MongoClient, ServerApiVersion } = require("mongodb");

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // MongoDB connection URI
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkciokq.mongodb.net/?appName=Cluster0`;

// // MongoClient
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect to MongoDB
//     await client.connect();
//     const db = client.db("blood_donet_db");
//     const donorsCollection = db.collection("donors");

//     console.log("Connected successfully to MongoDB!");

//     // --------> API ROUTES <--------

//     // Root
//     app.get("/", (req, res) => {
//       res.send("Blood donation API is running!");
//     });

//     // 1 Get all donors
//     app.get("/donors", async (req, res) => {
//       try {
//         const donors = await donorsCollection.find().toArray();
//         res.send(donors);
//       } catch (err) {
//         res.status(500).send({ error: err.message });
//       }
//     });
//     //2 GET donation requests by user email
//     app.get("/donation-requests", async (req, res) => {
//       try {
//         const email = req.query.email;
//         let query = {};
//         if (email) {
//           query.requesterEmail = email;
//         }

//         const result = await donationRequestsCollection
//           .find(query)
//           .sort({ createdAt: -1 })
//           .toArray();

//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to fetch donation requests" });
//       }
//     });

//     // 1 Add a new donor
//     app.post("/donors", async (req, res) => {
//       try {
//         const donor = req.body;
//         const result = await donorsCollection.insertOne(donor);
//         res.send(result);
//       } catch (err) {
//         res.status(500).send({ error: err.message });
//       }
//     });
//     //2 POST donation request
//     app.post("/donation-requests", async (req, res) => {
//       try {
//         const donation = req.body;
//         donation.status = "pending";
//         donation.createdAt = new Date();

//         const result = await donationRequestsCollection.insertOne(donation);
//         res.send(result);
//       } catch (error) {
//         res.status(500).send({ error: "Failed to create donation request" });
//       }
//     });

//     // Ping to confirm connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//   }
// }

// run().catch(console.dir);

// // Start server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
