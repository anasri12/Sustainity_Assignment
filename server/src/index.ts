import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { uploadRoutes } from "./routes/upload.routes";
import { dataRoutes } from "./routes/data.routes";
import { mappingRoutes } from "./routes/mapping.routes";
import { csvPreviewRoutes } from "./routes/csvPreview.routes";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/", uploadRoutes);
app.use("/", dataRoutes);
app.use("/", mappingRoutes);
app.use("/", csvPreviewRoutes);

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
