
import { getAllPokemonDocController, getEasterEggDocController, getPaginatedDocController, searchPokemonController } from "../ElasticController/Controllers.js";
import express from "express";


const router = express.Router();
router.get('/getAllDocs',getAllPokemonDocController);
router.get('/characters',getEasterEggDocController);
router.get('/getPaginatedDocs',getPaginatedDocController);
router.get('/getMatchingDocs',searchPokemonController);

export default router;