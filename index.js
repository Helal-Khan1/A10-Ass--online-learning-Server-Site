const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// assignment10ServerBd
// BXfmEYGRJDaa7k84
const uri =
  "mongodb+srv://assignment10ServerBd:BXfmEYGRJDaa7k84@cluster0.0pttuht.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const DB = client.db("our_courses");
    const featuredCourses = DB.collection("FeaturedCourses");
    const allCouressCallacaion = DB.collection("all_courses");

    // find all coursess
    app.get("/all_courses", async (req, res) => {
      const cursor = allCouressCallacaion.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // find feauturedCourses
    app.get("/featuredCourses", async (req, res) => {
      const cursor = featuredCourses.find().sort().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // post featuredCourses
    app.post("/featuredCourses", async (req, res) => {
      const newCoreses = req.body;
      const result = await featuredCourses.insertOne(newCoreses);
      res.send(result);
    });

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
  res.send("server is running ");
});

app.listen(port, () => {
  console.log(`server is running on Port ${port}`);
});
