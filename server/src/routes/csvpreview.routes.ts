import { Router } from "express";
import multer from "multer";
import { previewCSV } from "../controllers/csvPreview.controller";

const upload = multer({ dest: "uploads/" });
export const csvPreviewRoutes = Router();

csvPreviewRoutes.post("/preview", upload.single("file"), previewCSV);