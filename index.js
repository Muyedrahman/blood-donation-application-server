// Users
app.get("/users", async (req, res) => {
  const result = await UsersCollection.find().toArray();
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

// Update user, block, activate, role
app.patch("/users/:email", async (req, res) => {
  const email = req.params.email;
  const updatedUserData = req.body;
  const result = await UsersCollection.updateOne(
    { email },
    { $set: updatedUserData },
  );
  res.json(result);
});

// Donation Requests
app.get("/donation-requests", async (req, res) => {
  const email = req.query.email;
  const query = email ? { email } : {};
  const result = await DonationRequestCollection.find(query)
    .sort({ createdAt: -1 })
    .toArray();
  res.send(result);
});

app.post("/donation-requests", async (req, res) => {
  const donation = req.body;
  donation.status = "pending";
  donation.createdAt = new Date();
  const result = await DonationRequestCollection.insertOne(donation);
  res.send(result);
});

// Blog Posts
app.post("/blog-post", async (req, res) => {
  const blogPost = req.body;
  const result = await BlogPostCollection.insertOne(blogPost);
  res.send(result);
});

app.get("/blog-post", async (req, res) => {
  const result = await BlogPostCollection.find().toArray();
  res.send(result);
});
