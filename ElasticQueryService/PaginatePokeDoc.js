import { client } from "../app.js";

export const getPaginatedDocService = async (req, res) => {
  try {
    const param = req.query.inputValue;
    const { pageNo, docsPerPage } = req.query;
    const page = parseInt(pageNo, 10) || 0;
    const limit = parseInt(docsPerPage, 10) || 10;

    if (page < 0 || limit < 1) {
      return res
        .status(400)
        .json({ error: "Invalid pageNo or docsPerPage value" });
    }

    const startIndex = page * limit;
    let filterParam = req.query.selectionList || "";
    let filterParamArr = [];

    if (filterParam.trim() !== "") {
      filterParamArr = filterParam.split(",");
    }

    const query = {
      bool: {
        must: [],
        should: [],
      },
    };
    if (param) {
      query.bool.should.push(
        ...[
          {
            match: {
              name: {
                query: param,
                fuzziness: "AUTO",
              },
            },
          },
          {
            terms: {
              "types.type.name": filterParamArr,
            },
          },
          {
            wildcard: {
              name: `${param}*`,
            },
          },
          {
            prefix: {
              name: {
                value: param,
              },
            },
          },
        ]
      );
    } else {
      query.bool.must.push({ match_all: {} });
    }
    if (filterParamArr.length > 0) {
      query.bool.must = filterParamArr.map((type) => ({
        term: { "types.type.name": type },
      }));
    }
    const body = await client.search({
      index: "pokedex",
      body: {
        from: startIndex,
        size: limit,
        query: query,
      },
    });
    const totalDocs = body.hits.total.value;
    const pokemonData = body.hits.hits.map((doc) => ({
      ...doc._source,
    }));

    res.status(200).json({
      totalDocs,
      pokemonData,
      // pageNo: page,
      // docsPerPage: limit,
      // totalPages: Math.ceil(totalDocs / limit),
    });
  } catch (error) {
    console.error("Error fetching paginated documents:", error);
    res.status(500).json({ error: "Failed to fetch paginated documents" });
  }
};
