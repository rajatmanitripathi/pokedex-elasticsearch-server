import { pushBulkData, pushEasterEggData } from "../Services/uploadPokemon.js";

export const uploadToElasticController = async () => {
    // const batchSize = 31;
    // const totalPokemon = 1302;
  
    // for (let offset = 0; offset < totalPokemon; offset += batchSize) {
    //   console.log(`Uploading Pokémon batch from offset ${offset}`);
    //   await pushBulkData(batchSize, offset);
    // }
    
    // console.log("✅ All 1302 Pokémon uploaded to Elasticsearch.");
    await pushEasterEggData();
  };
  