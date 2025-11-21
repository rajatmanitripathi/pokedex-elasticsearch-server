import { client } from "../app.js";
import { updateUserSearchHistory } from "./historyService.js";

export const filterService = async (req, res) => {
  const param = req.query.inputValue;
  const docsPerPage = req.query.docsPerPage;
  const userId = req.query.uuidForThisPort;
  const exactMatch=req.query.exactMatch
  try {
    const newTypedObject = {
      searchedField: param,
      timestamp: new Date().toISOString(),
    };
    updateUserSearchHistory(userId, newTypedObject);
  } catch (error) {
    console.error("Error storing search history:", error);
  }

  try {
    const trimmedParam = param ? param.trim() : "";

    const index = trimmedParam ? "pokedex" : "searchhistory";
    const sourceParameter = index === "searchhistory" ? "history" : "name";

    const queryBody = {
    query: trimmedParam
      ? exactMatch
        ? {
            term: {
              name: {
                value: trimmedParam,
              },
            },
          }
        : {
            bool: {
              should: [
                {
                  match: {
                    name: {
                      query: trimmedParam,
                      fuzziness: "AUTO",
                    },
                  },
                },
                {
                  wildcard: {
                    name: `${trimmedParam.toLowerCase()}*`,
                  },
                },
                {
                  prefix: {
                    name: {
                      value: trimmedParam.toLowerCase(),
                    },
                  },
                },
              ],
              minimum_should_match: 1,
            },
          }
      : {
          match: {
            userId: {
              query: userId,
            },
          },
        },
    // _source: sourceParameter,
  };
    // const deleteQuery={
    //   index: 'searchhistory',
    //   id: docId,
    // }
    if (!exactMatch) {
  body._source = sourceParameter;
}
    let finalResult = {};
    let theFinalResultArr = [];
    const response = await client.search({
      index: index,
      body: {
        ...queryBody,
      },
      size: docsPerPage,
    });
    if (response.hits.total.value > 0 && sourceParameter == "history") {
      const source = response.hits.hits[0]._source;

      const sortedHistory = source.history.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      console.log("Sorted History:", sortedHistory);
      sortedHistory.map((history) => {
        let finalResultforHistory = {};
        finalResultforHistory.searchedField = history.searchedField;
        finalResultforHistory.timestamp = history.timestamp;
        theFinalResultArr.push(finalResultforHistory);
      });
     
      return res.status(200).json(theFinalResultArr);
    } else {
      console.log("No user history found for userId:", userId);
    }
    if (response.hits.total.value > 0) {
      const results = response.hits.hits.map((hit) =>hit._source);
      finalResult.pokemonData = results;
      finalResult.totalDocs = response.hits.total.value;
      return res.status(200).json(finalResult);
    }
  } catch (error) {
    console.error("Error performing search:", error);
    return res
      .status(500)
      .json({ error: "Error performing search", details: error.message });
  }
};
