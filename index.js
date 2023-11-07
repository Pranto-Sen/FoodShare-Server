const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9jgoh4.mongodb.net/?retryWrites=true&w=majority`;

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
    const foodCollection = client
      .db("foodShareDB")
      .collection("foodCollection)");

    const foodRequestCollection = client
      .db("foodShareDB")
      .collection("foodRequestCollection)");

    app.post("/addFood", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    app.post("/requestFood", async (req, res) => {
      const requestFood = req.body;
      // console.log(req.body.foodname);
          const filter = { _id: new ObjectId(req.body._id) }; // Use ObjectID to match the MongoDB _id field

          const updateDocument = {
            $set: {
              "status": "Pending",
            },
          };

      await foodCollection.updateOne(filter, updateDocument);
      delete requestFood._id;
      const result = await foodRequestCollection.insertOne(requestFood);
      res.send(result);
    });

    // app.post("/requestFood", async (req, res) => {
    //   const requestFood = req.body;

    //   try {
    //     const filter = { _id: new ObjectId(req.body._id) };
    //     const updateDocument = {
    //       $set: { status: "Pending" },
    //     };

    //     // Update the 'status' field in the 'foodCollection' collection
    //     await foodCollection.updateOne(filter, updateDocument);

    //     // Remove the '_id' field from the request body to avoid duplicate key error
    //     delete requestFood._id;

    //     // Insert the modified request body into 'foodRequestCollection'
    //     const result = await foodRequestCollection.insertOne(requestFood);
    //     res.send(result);
    //   } catch (error) {
    //     console.error("Error:", error);
    //     res.status(500).send("An error occurred while processing the request.");
    //   }
    // });

    app.get("/food", async (req, res) => {
      const cursor = foodCollection.find({ status: 'Available' });
      const result = await cursor.toArray();
      result.sort((a, b) => b.foodquantity - a.foodquantity);
      res.send(result);
    });

    app.get("/manageFood/:email", async (req, res) => {
      const email = req.params.email; // Get email from the URL parameter
      const cursor = await foodCollection.find({ donoremail: email }); // Assuming there's a field 'email' in your foodCollection
      const result = await cursor.toArray();

      res.send(result);
      
    });

    app.get("/food/:searchFood", async (req, res) => {
      const searchFood = req.params.searchFood; // Get email from the URL parameter
      const cursor = await foodCollection.find({ foodname: searchFood }); // Assuming there's a field 'email' in your foodCollection
      const result = await cursor.toArray();

      res.send(result);
      
    });

    app.get("/foodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    //  app.get("/sortFood", async (req, res) => {
    //     // const value = req.params.value; // Get email from the URL parameter
    //     const cursor = await foodCollection.find(); // Assuming there's a field 'email' in your foodCollection
    //     const result = await cursor.toArray();
    //      result.sort((a, b) => b.expiredtime - a.expiredtime);
    //    res.send(result);
    //  });


    //  app.get("/manageFood/", async (req, res) => {
    //    const id = req.params.id;
    //    const query = { _id: new ObjectId(id) };
    //    const result = await foodCollection.findOne(query);
    //    res.send(result);
    //  });

    // app.get("/manageFood/", async (req, res) => {
    //   const userEmail = req.user.email; // Assuming you have the user's email from authentication
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id), email: userEmail };
    //   const result = await foodCollection.findOne(query);

    //   if (result) {
    //     res.send(result);
    //   } else {
    //     res
    //       .status(404)
    //       .send("Food not found for the user's email and provided ID.");
    //   }
    // });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("Server running");
});
app.listen(port, () => {
  console.log(`FoodService is running on port ${port}`);
});
