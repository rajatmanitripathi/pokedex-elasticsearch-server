import { Client } from "@elastic/elasticsearch";
import express from "express";
import cron from 'node-cron';
import cors from "cors";
import dotenv from 'dotenv';
// import ConnectDB from "./config/db.js";

dotenv.config();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
import getAllDocs from "./ElasticRoute/ElasticRoute.js";
import characters from "./ElasticRoute/ElasticRoute.js"
import { uploadToElasticController } from "./Controllers/Controller.js";
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true, 
};


// Create an Elasticsearch client
export const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});
const PORT =  process.env.PORT;
export const app = express();
app.use("/public", express.static("public"));

// Test connection
(async () => {
  try {
    const health = await client.cluster.health();
    console.log("Elasticsearch cluster health:", health);
  } catch (error) {
    console.error("Error connecting to Elasticsearch:", error);
  }
})();
app.get("/", (req, res) => {
  res.send({
    message: `Server is running on ${PORT}`,

  });
});
// await uploadToElasticController();
uploadToElasticController();
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task...');

  // Clear Elasticsearch data (you can adjust this based on how you're doing it)
  try {
    await client.indices.delete({ index: 'pokedex' }); // This deletes the current index
    console.log('Elasticsearch index "pokedex" cleared!');
  } catch (error) {
    console.error('Error clearing Elasticsearch index:', error);
  }

  // Push new bulk data (this is where you get new Pokémon data)
  try {
    await uploadToElasticController(); // This will fetch data and insert it into Elasticsearch
    console.log('New Pokémon data has been uploaded!');
  } catch (error) {
    console.error('Error updating Pokémon data:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata", // Set to India Standard Time (IST)
});
// ConnectDB();
app.listen(PORT, () => {
  console.log(`Server is Running on port : ${PORT}`);
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", getAllDocs);
app.use("/api",characters)
