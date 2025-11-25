import { Client } from "@elastic/elasticsearch";
import express from "express";
import cron from 'node-cron';
import cors from "cors";
import dotenv from 'dotenv';

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
// uploadToElasticController();
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task...');
  try {
    await client.indices.delete({ index: 'pokedex' });
    console.log('Elasticsearch index "pokedex" cleared!');
  } catch (error) {
    console.error('Error clearing Elasticsearch index:', error);
  }
  try {
    await uploadToElasticController(0, 500, 10);

    await uploadToElasticController(501, 1000, 10);

    await uploadToElasticController(1001, 1300, 10);

    await uploadToElasticController(1301, 1329, 14);

    console.log("🎉 All Pokémon uploaded successfully!");
  } catch (error) {
    console.error('Error updating Pokémon data:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});
// ConnectDB();
app.listen(PORT, () => {
  console.log(`Server is Running on port : ${PORT}`);
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", getAllDocs);
app.use("/api",characters)
