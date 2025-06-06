const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0eyhim6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Create and connect to 'coffees' collection from 'coffeeDB' database
    const coffeesCollection = client.db("coffeeDB").collection("coffees");

    // GET API to fetch all coffee data from the MongoDB database
    app.get("/coffees", async (req, res) => {
      const cursor = coffeesCollection.find(); // find all documents in 'coffees' collection
      const result = await cursor.toArray(); // convert cursor to an array of objects
      res.send(result); // send the result as the response
    });
    
// Get a specific coffee by ID
app.get('/coffees/:id', async (req, res) => {
  const id = req.params.id; // Get the ID from URL params
  const query = { _id: new ObjectId(id) }; // Convert ID to MongoDB ObjectId
  const result = await coffeesCollection.findOne(query); // Find the coffee with this ID
  res.send(result); // Send the result back to the client
});

    // Handle POST requests to add a new coffee to the database
    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body; // Get the new coffee data sent from the frontend
      console.log(newCoffee); // Log the data to verify it's received correctly
      // Insert the new coffee into the 'coffees' collection in MongoDB
      const result = await coffeesCollection.insertOne(newCoffee);
      // Send back the result of the insert operation to the client
      res.send(result);
    });


  // UPDATE a specific coffee by ID
app.put('/coffees/:id', async (req, res) => {
  const id = req.params.id; // get the coffee id from URL
  const filter = { _id: new ObjectId(id) }; // find the coffee with this id
  const option = { upsert: true }; // if not found, insert it (optional)

  const updatedCoffee = req.body; // data received from client (updated info)

  const updatedDoc = {
    $set: updatedCoffee // set the updated fields
  };

  // If you want to update specific fields manually:
  // const updatedDoc = {
  //   $set: {
  //     name: updatedCoffee.name,
  //     supplier: updatedCoffee.supplier,
  //   }
  // };

  const result = await coffeesCollection.updateOne(filter, updatedDoc, option); // update in DB
  res.send(result); // send back the result
});

// Handle DELETE request to remove a specific coffee by ID
app.delete('/coffees/:id', async (req, res) => {
  
  // Extract the ID from the request URL parameters
  const id = req.params.id;

  // Create a MongoDB query object using the extracted ID
  const query = { _id: new ObjectId(id) };

  // Delete one matching document from the coffeesCollection
  const result = await coffeesCollection.deleteOne(query);

  // Send the result (success/failure info) back to the client
  res.send(result);
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffee server is getting hotter");
});

app.listen(port, () => {
  console.log(`coffee server is running port ${port} `);
});
