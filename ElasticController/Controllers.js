import { getAllPokeDocService } from "../ElasticQueryService/GetAllPokeDoc.js";
import { getPaginatedDocService } from "../ElasticQueryService/PaginatePokeDoc.js";
import { filterService } from "../ElasticQueryService/filterService.js";

export const getAllPokemonDocController = (req, res) => {
  getAllPokeDocService(req, res);
};


export const getPaginatedDocController=(req,res)=>{
    getPaginatedDocService(req,res);
}

export const searchPokemonController=(req,res)=>{
    filterService(req,res);
}