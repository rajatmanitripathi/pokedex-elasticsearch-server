import { client } from "../app.js";




export const getEEData=async(req,res)=>{
  try {
    const result = await client.search({
      index: "easter_egg",
    });
  const documents = result.hits.hits.map((hit) => ({
    ...hit._source,
  }));
   res.status(200).json(documents);
  } catch (err) {
    console.log("Search error:", err);
     res.status(500).json({ error: 'Error fetching documents'});
  }
};
