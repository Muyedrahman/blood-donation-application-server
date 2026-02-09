const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection 
const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkciokq.mongodb.net/?appName=Cluster0`;

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
    const db = client.db("blood-for-life");

    // Old collections
    const UsersCollection = db.collection("users");
    const BlogPostCollection = db.collection("blogPost");
    const DonationRequestCollection = db.collection("donationRequests");

    // New collections
    const donorsCollection = db.collection("donors");
    const fundingCollection = db.collection("fundings");

    console.log("Connected successfully to MongoDB!");

    // ---------------- ROUTES ----------------

    // Root
    app.get("/", (req, res) => {
      res.send("Blood donation API is running!");
    });

    // -------- Users --------
    app.get("/users", async (req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await UsersCollection.find({ email }).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await UsersCollection.findOne({ email: user.email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const updatedUserData = req.body;
      const result = await UsersCollection.updateOne(
        { email },
        { $set: updatedUserData },
      );
      if (result.modifiedCount === 0)
        return res.status(404).json({ message: "User not found" });
      res.json({ message: "User updated successfully" });
    });

    app.patch("/users/block/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "block" } },
      );
      res.send(result);
    });

    app.patch("/users/active/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "active" } },
      );
      res.send(result);
    });

    app.patch("/users/volunteer/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "volunteer" } },
      );
      res.send(result);
    });

    app.patch("/users/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "admin" } },
      );
      res.send(result);
    });

    // -------- Donation Requests --------
    app.get("/donation-requests", async (req, res) => {
      const email = req.query.email;
      const query = email ? { email } : {};
      const result = await DonationRequestCollection.find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/donation-requests/home/:status", async (req, res) => {
      const status = req.params.status;
      const result = await DonationRequestCollection.find({ status }).toArray();
      res.send(result);
    });

    app.get("/donation-requests/single/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.find({
        _id: new ObjectId(id),
      }).toArray();
      res.send(result);
    });

    app.get("/donation-requests/view-details/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.find({
        _id: new ObjectId(id),
      }).toArray();
      res.send(result);
    });

    app.post("/donation-requests", async (req, res) => {
      const donation = req.body;
      donation.status = "pending";
      donation.createdAt = new Date();
      const result = await DonationRequestCollection.insertOne(donation);
      res.send(result);
    });

    app.patch("/donation-requests/single-update/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "inprogress" } },
      );
      res.send(result);
    });

    app.patch("/donation-requests/done/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "done" } },
      );
      res.send(result);
    });

    app.patch("/donation-requests/cancel/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "canceled" } },
      );
      res.send(result);
    });

    app.patch("/donation-requests/edit/:id", async (req, res) => {
      const id = req.params.id;
      const donation = req.body;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...donation, status: "pending" } },
      );
      res.send(result);
    });

    app.delete("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // -------- Blog Posts --------
    app.post("/blog-post", async (req, res) => {
      const blogPost = req.body;
      const result = await BlogPostCollection.insertOne(blogPost);
      res.send(result);
    });

    app.get("/blog-post", async (req, res) => {
      const result = await BlogPostCollection.find().toArray();
      res.send(result);
    });

    app.get("/blog-post/status", async (req, res) => {
      const result = await BlogPostCollection.find({
        status: "Publish",
      }).toArray();
      res.send(result);
    });

    app.get("/blog-post/:id", async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.find({
        _id: new ObjectId(id),
      }).toArray();
      res.send(result);
    });

    app.patch("/blog-post/publish/:id", async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Publish" } },
      );
      res.send(result);
    });

    app.patch("/blog-post/unpublished/:id", async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Draft" } },
      );
      res.send(result);
    });

    app.delete("/blog-post/delete/:id", async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // -------- Donors (New) --------
    app.get("/donors", async (req, res) => {
      const donors = await donorsCollection.find().toArray();
      res.send(donors);
    });

    app.post("/donors", async (req, res) => {
      const donor = req.body;
      const result = await donorsCollection.insertOne(donor);
      res.send(result);
    });

    // -------- Fundings (New) --------
    app.get("/fundings", async (req, res) => {
      const fundings = await fundingCollection.find().toArray();
      res.send(fundings);
    });

    app.post("/fundings", async (req, res) => {
      const funding = req.body;
      const result = await fundingCollection.insertOne(funding);
      res.send(result);
    });

    // -------- Stripe Payment --------
    app.post("/create-payment-intent", async (req, res) => {
      const { amount } = req.body;
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100,
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
    console.log("Pinged your deployment. MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
