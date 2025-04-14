
import { client } from "../app.js";

export const getAllPokeDocService=async(req, res)=>{
 
  try {
    const body  = await client.search({
      index: 'pokedex',
      body: {
        query: {
          match_all: {},
        },
        size: 10,
      },
    });

  const documents = body.hits.hits.map((hit) => ({
    ...hit._source,
  }));
  res.status(200).json(documents);

    

    
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching documents' });
  }

}