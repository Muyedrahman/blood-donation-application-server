const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Blood-for life server is running successfully!');
});

const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const UsersCollection = client.db('blood-for-life').collection('users');
    const BlogPostCollection = client.db('blood-for-life').collection('blogPost');
    const DonationRequestCollection = client.db('blood-for-life').collection('donationRequests');

    app.get('/users', async (req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result);
    });
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await UsersCollection.find(query).toArray();
      res.send(result);
    });

    app.patch('/users/:email', async (req, res) => {
      const email = req.params.email;
      const updatedUserData = req.body;

      try {
        const result = await UsersCollection.updateOne(
          { email: email },
          { $set: updatedUserData }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.patch('/users/block/:id', async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'block' } }
      );
      res.send(result);
    });
    app.patch('/users/active/:id', async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'active' } }
      );
      res.send(result);
    });
    app.patch('/users/volunteer/:id', async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: 'volunteer' } }
      );
      res.send(result);
    });
    app.patch('/users/makeAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const result = await UsersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: 'admin' } }
      );
      res.send(result);
    });

   app.post('/users', async (req, res) => {
  const user = req.body;

  // Check if user already exists
  const existingUser = await UsersCollection.findOne({ email: user.email });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Insert new user
  const result = await UsersCollection.insertOne(user);
  res.send(result);
});


    app.get('/donation-requests', async (req, res) => {
      const result = await DonationRequestCollection.find().toArray();
      res.send(result);
    });
    app.get('/donation-requests/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await DonationRequestCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/donation-requests', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await DonationRequestCollection.insertOne(user);
      res.send(result);
    });
    app.get('/donation-requests/home/:status', async (req, res) => {
      const value = req.params.status;
      const query = { status: value };
      const result = await DonationRequestCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/donation-requests/single/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await DonationRequestCollection.find(query).toArray();
      res.send(result);
    });

    app.patch('/donation-requests/single-update/:id', async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'inprogress' } }
      );
      res.send(result);
    });
    app.patch('/donation-requests/done/:id', async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'done' } }
      );
      res.send(result);
    });
    app.patch('/donation-requests/cancel/:id', async (req, res) => {
      const id = req.params.id;
      const result = await DonationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'canceled' } }
      );
      res.send(result);
    });
    app.patch('/donation-requests/edit/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const result = await DonationRequestCollection.updateMany(
        { _id: new ObjectId(id) },
        {
          $set: {
            recipientName: user.recipientName,
            recipientDistrict: user.recipientDistrict,
            recipientUpazila: user.recipientUpazila,
            hospitalName: user.hospitalName,
            address: user.address,
            donationDate: user.donationDate,
            donationTime: user.donationTime,
            description: user.description,
            status: 'pending',
            email: user.email,
          },
        }
      );
      res.send(result);
    });

    app.delete('/donation-requests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await DonationRequestCollection.deleteOne(query);
      res.send(result);
    });
    app.get('/donation-requests/view-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await DonationRequestCollection.find(query).toArray();
      res.send(result);
    });

    //blog post route starts here
    app.post('/blog-post', async (req, res) => {
      const blogPost = req.body;
      const result = await BlogPostCollection.insertOne(blogPost);
      res.send(result);
    });

    app.get('/blog-post', async (req, res) => {
      const result = await BlogPostCollection.find().toArray();
      res.send(result);
    });
    app.get('/blog-post/status', async (req, res) => {
      const query = { status: 'Publish' };
      const result = await BlogPostCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/blog-post/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BlogPostCollection.find(query).toArray();
      res.send(result);
    });

    app.patch('/blog-post/publish/:id', async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'Publish' } }
      );
      res.send(result);
    });
    app.patch('/blog-post/unpublished/:id', async (req, res) => {
      const id = req.params.id;
      const result = await BlogPostCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'Draft' } }
      );
      res.send(result);
    });

    app.delete('/blog-post/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BlogPostCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db('admin').command({ ping: 1 });
    // console.log(
    //   'Pinged your deployment. You successfully connected to MongoDB!'
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`blood-for-life listening on port ${port}`);
});
