import { client } from "../app.js";
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
