import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";

export const previewCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const results: Record<string, string>[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csvParser())
        .on("data", (data) => {
          if (results.length < 10) results.push(data);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    fs.unlinkSync(req.file!.path);
    res.status(200).json(results);
  } catch (error) {
    console.error("Preview Error:", error);
    res.status(500).json({ error: "Failed to parse CSV" });
  }
};
