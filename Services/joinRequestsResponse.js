import axios from "axios";
import { baseUrl } from "../constants/baseUrl.js";

export const updatePokemonDataListFromApi = async (i,offset) => {
  let pokeArr = [];
  try {

    const batch = await fetchAllPoke(i,offset);
    pokeArr.push(...batch);
    const joinedArr = await Promise.all(
      pokeArr.map(async (poke, index) => {
        try {
          const thatPokeSpecie = await fetchPokeSpecies(poke.details.name);
          poke.details.specie = thatPokeSpecie;

          try {
            const thatPokeEvoChain = await fetchEvoChain(
              thatPokeSpecie.evolution_chain.url
            );
            poke.details.evolutionChain = thatPokeEvoChain;
          } catch (evoError) {
            console.error(
              `Error fetching evolution chain for Pokémon ${poke.details.name} (Index: ${index}):`,
              evoError.message
            );
          }

          return poke;
        } catch (specieError) {
          console.error(
            `Error fetching species data for Pokémon ${poke.details.name} (Index: ${index}):`,
            specieError.message
          );
          return poke;
        }
      })
    );
    return joinedArr;
  } catch (error) {
    console.error("Error updating Pokémon data list:", error.message);
    return [];
  }
};

const fetchAllPoke = async (i,offset) => {
  try {
    const responsePokeList = await axios.get(
      `${baseUrl}pokemon?limit=${i}&offset=${offset}`
    );
    

    if (!Array.isArray(responsePokeList.data.results)) {
      console.error("fetching went wrong: expected an array of Pokémon");
      return [];
    }

    const updatedPokeObjectArr = await Promise.all(
      responsePokeList.data.results.map(async (pokemon) => {
        const pokemonDetails = await axios.get(pokemon.url);
        return { ...pokemon, details: pokemonDetails.data };
      })
    );

    return updatedPokeObjectArr;
  } catch (error) {
    console.error("Error fetching all PokémonData:", error.message);
    return [];
  }
};

const fetchPokeSpecies = async (name) => {
  try {
    const response = await axios.get(`${baseUrl}/pokemon-species/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching species for ${name}:`, error.message);
    throw error;
  }
};

const fetchEvoChain = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching evolution chain for ID ${id}:`,
      error.message
    );
    throw error;
  }
};
