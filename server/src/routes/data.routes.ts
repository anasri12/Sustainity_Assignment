import { Router } from "express";
import { getAllData, getDataById } from "../controllers/data.controller";

export const dataRoutes = Router();

dataRoutes.get("/data", getAllData);
dataRoutes.get("/data/:id", getDataById);