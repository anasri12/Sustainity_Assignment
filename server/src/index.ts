import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { purchaseRoutes } from "./routes/purchase.routes";
import { csvPreviewRoutes } from "./routes/csvpreview.routes";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/", purchaseRoutes);
app.use("/", csvPreviewRoutes);

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
