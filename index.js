const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// index.js
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);
const { Ruleset } = require("firebase-admin/security-rules");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebaeVerefyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorization access" });
  }
  const token = authorization.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("console.log form firebaseVarifi Token", decoded);

    req.token_email = decoded.email;
    next();
  } catch (err) {
    return res.status(401).send({ message: "unauthorization access" });
  }

  // next();
};

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PSS}@cluster0.0pttuht.mongodb.net/?appName=Cluster0`;

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

    const allCouressCallacaion = DB.collection("all_courses");
    const myEnrullCallacrion = DB.collection("Enroll_courses");

    //  find All Entol courses

    app.get("/myEnroll_courses", async (req, res) => {
      const coursor = myEnrullCallacrion.find();
      const result = await coursor.toArray();
      res.send(result);
    });

    app.post("/myEnroll_courses",  async (req, res) => {
      console.log("my heardest ", req.headers);
      const newEnroll = req.body;
      const result = await myEnrullCallacrion.insertOne(newEnroll);
      res.send(result);
    });

    // find all coursess
    // app.get("/all_courses", async (req, res) => {
    //   const cursor = allCouressCallacaion.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    app.get("/all_courses", async (req, res) => {
      const email = req.query.email;
      const query = {};

      if (email) {
        query.email = email;
      }

      const cursor = allCouressCallacaion.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // find single courses
    app.get("/all_courses/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await allCouressCallacaion.findOne(quary);
      res.send(result);
    });

    // find for 6  feauturedCourses Home section
    app.get("/featuredCourses", async (req, res) => {
      const cursor = allCouressCallacaion.find().sort().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // myenroll Courses

    app.post("/all_courses", async (req, res) => {
      const newCours = req.body;
      const result = await allCouressCallacaion.insertOne(newCours);
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
