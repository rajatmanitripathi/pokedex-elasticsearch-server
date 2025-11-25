import { pushBulkData, pushEasterEggData } from "../Services/uploadPokemon.js";

export const uploadToElasticController = async (start, end, batchSize) => {
    // const batchSize = 14;
    // const totalPokemon = 1328;
  for (let offset = start; offset <= end; offset += batchSize) {
    console.log(`Uploading Pokémon batch: offset=${offset}, limit=${batchSize}`);
    await pushBulkData(batchSize, offset);
  }

  console.log(`✔ Range ${start} - ${end} uploaded.`);
    
    console.log("✅ All 1328 Pokémon uploaded to Elasticsearch.");
    // await pushEasterEggData();
  };
  