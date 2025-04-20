import { Router } from "express";
import { uploadCSV } from "../controllers/upload.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
export const purchaseRoutes = Router();

purchaseRoutes.post("/upload", upload.single("file"), uploadCSV);
