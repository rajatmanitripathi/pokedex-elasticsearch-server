import { client } from '../app.js';

export async function updateUserSearchHistory(userId, newTypedObject) {
  try {
    const searchQuery = {
      index: 'searchhistory',
      body: {
        query: {
          match: {
            userId:{ query: userId}
          },
        },
      },
      size: 1,
    };

    const { hits } = await client.search(searchQuery);

    if (hits.total.value === 0) {
      const newDocument = {
        userId: userId,
        history: [newTypedObject],
      };
      await client.index({
        index: 'searchhistory',
        body: newDocument,
      });
      console.log('New document created with userId and typed array.');
      return;
    }
    const docId = hits.hits[0]._id;
    const source = hits.hits[0]._source;
    const currentTypedArray = source.history || [];
    const alreadyExists = currentTypedArray.some(
      (item) => item.searchedField === newTypedObject.searchedField
    );
    if (alreadyExists) {
      console.log(`The searchedField '${newTypedObject.searchedField}' already exists.`);
      return;
    }
    const updateQuery = {
      index: 'searchhistory',
      id: docId,
      body: {
        script: {
          source: `
            if (ctx._source.history == null) {
              ctx._source.history = [];
            }
              if (ctx._source.history.size() >=10) {
              ctx._source.history.remove(ctx._source.history.size() - 1);
            }
            ctx._source.history.add(params.newEntry);
          `,
          params: {
            newEntry: newTypedObject, 
          },
        },
      },
    };
    

    await client.update(updateQuery);
    console.log('New searchedField added to the typed array.');

  } catch (error) {
    console.error('Error updating user search history:', error);
  }
}




