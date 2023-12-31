const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
// app.use(cors());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9jgoh4.mongodb.net/?retryWrites=true&w=majority`;

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
      const filter = { _id: new ObjectId(req.body._id) };
      const updateDocument = {
        $set: {
          status: "Pending",
        },
      };
      await foodCollection.updateOne(filter, updateDocument);
      delete requestFood._id;
      const result = await foodRequestCollection.insertOne(requestFood);
      res.send(result);
    });

    app.get("/food", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      result.sort((a, b) => b.foodquantity - a.foodquantity);
      res.send(result);
    });

    app.get("/manageFood/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await foodCollection.find({ donoremail: email });
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get("/food/:searchFood", async (req, res) => {
    //   const searchFood = req.params.searchFood;
    //   const query = { foodname: { $regex: new RegExp(searchFood, "i") } };
    //   const cursor = await foodCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.get("/food/:searchFood", async (req, res) => {
      const searchFood = req.params.searchFood;
      const query = {
        foodname: { $regex: new RegExp(`\\b${searchFood}\\b`, "i") },
      }; // Using \b for word boundary
      const cursor = await foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/foodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.get("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const query = { foodId: id };
      const result = await foodRequestCollection.findOne(query);
      res.send(result);
    });

    app.post("/status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { foodId: id };
      const updateDocument = {
        $set: {
          status: "Delivered",
        },
      };

      const result = await foodRequestCollection.updateOne(
        filter,
        updateDocument
      );
      res.send(result);
    });

    app.get("/foodRequest/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await foodRequestCollection.find({
        requesterEmail: email,
      });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/updateFood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateFood = req.body;
      const Food = {
        $set: {
          foodname: updateFood.foodname,
          foodquantity: updateFood.foodquantity,
          pickuplocation: updateFood.pickuplocation,
          expiredtime: updateFood.expiredtime,
          image: updateFood.image,
          status: updateFood.status,
          notes: updateFood.notes,
          donorphoto: updateFood.donorphoto,
          donorname: updateFood.donorname,
          donoremail: updateFood.donoremail,
        },
      };
      const result = await foodCollection.updateOne(filter, Food);

      res.send(result);
    });
    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/reqfood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodRequestCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running");
});
app.listen(port, () => {
  console.log(`FoodService is running on port ${port}`);
});
