import { Router } from "express";
import { getMapping, saveMapping } from "../controllers/mapping.controller";

export const mappingRoutes = Router();

mappingRoutes.post("/mapping", saveMapping);
mappingRoutes.get("/mapping", getMapping);
