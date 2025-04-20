import { Router } from "express";
import multer from "multer";
import { processCSV, uploadFile } from "../controllers/upload.controller";

const upload = multer({ dest: "uploads/" });
export const uploadRoutes = Router();

uploadRoutes.post("/upload", upload.single("file"), uploadFile);
uploadRoutes.post("/process", processCSV);
