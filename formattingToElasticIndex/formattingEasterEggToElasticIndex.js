export const formateeCharacterToElasticIndex = (data, indexId) => {
    return (
      `{ "index": { "_index": "easter_egg", "_id": "${String(indexId)}" } }\n` +
      `${JSON.stringify(data)}\n`
    );
  };