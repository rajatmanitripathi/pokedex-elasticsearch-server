export const formatToElasticIndex = (data, indexId) => {
    return (
      `{ "index": { "_index": "pokedex", "_id": "${String(indexId)}" } }\n` +
      `${JSON.stringify(data)}\n`
    );
  };
  
