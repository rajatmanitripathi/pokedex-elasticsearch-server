import { client } from "../app.js";
import { characters } from "../constants/characters.js";
import { formateeCharacterToElasticIndex } from "../formattingToElasticIndex/formattingEasterEggToElasticIndex.js";
import { formatToElasticIndex } from "../formattingToElasticIndex/formattingToElasticIndex.js";
import { updatePokemonDataListFromApi } from "./joinRequestsResponse.js";

const getBulkData = (chunks) => {
  let bulkData = [];
  chunks.forEach((chunk, index) => {
    if (!chunk) {
      console.log("ERROR_AT:::::::::::::", index);
    }
    try {
      bulkData.push(
        formatToElasticIndex(chunk?.details, chunk?.details?.id)
      );
    } catch (error) {
      console.log("error during bulk push:"`${error}`);
    }
   
  });
  return bulkData;
};

export const pushBulkData = async (limit,offset) => {
  // const i = 5;
  // const offset=0;
  updatePokemonDataListFromApi(limit,offset).then(async (res) => {
    try {
      console.log(res + "here");
      const bulkData = getBulkData(res);
      try {
        const response = await client.bulk({
          body: bulkData,
        });
        if (response.errors) {
          response.items.forEach((item, i) => {
            if (item.index && item.index.error) {
              console.error(`Error indexing document ${i} (ID: ${bulkData[i * 2]?.index?._id}):`, item.index.error);
            }
          });
        }
        // console.log(response);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.group(error);
    }
  });
};


const getBulkEasterEggData = (characters) => {
  let bulkData = [];

  characters.forEach((char, index) => {
    if (!char) {
      console.log("NULL_CHARACTER_AT_INDEX:", index);
      return;
    }

    try {
      bulkData.push(
        formateeCharacterToElasticIndex(char, char.id)
      );
    } catch (error) {
      console.log(`Error formatting character at ${index}: ${error}`);
    }
  });

  return bulkData;
};

export const pushEasterEggData = async () => {
  try {
    const bulkData = getBulkEasterEggData(characters);

    const response = await client.bulk({
      body: bulkData,
    });

    if (response.errors) {
      response.items.forEach((item, i) => {
        if (item.index && item.index.error) {
          console.error(
            `Error indexing character ${i} (ID: ${
              bulkData[i * 2]?.index?._id
            }):`,
            item.index.error
          );
        }
      });
    }

    console.log("✔ Easter Egg Data bulk inserted successfully.");

  } catch (err) {
    console.log("Bulk Insert Error:", err);
  }
};

