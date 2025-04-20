import { Request, Response } from "express";
import fs from "fs";
import csvParser from "csv-parser";
import { PrismaClient } from "../generated/prisma";
import { mappedRowSchema } from "../utils/validation";
import { logger } from "../utils/logger";

export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  res.status(200).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    originalname: req.file.originalname,
  });
};

const prisma = new PrismaClient();

export const processCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { filename } = req.body;
  if (!filename) res.status(400).json({ error: "Filename is required" });

  const filePath = `uploads/${filename}`;
  const rawRows: Record<string, string>[] = [];
  const validItems: any[] = [];
  const errorRows: { index: number; reason: string }[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => rawRows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const mappings = await prisma.fileMapping.findMany({ where: { filename } });
    const mapObj = Object.fromEntries(
      mappings.map((m) => [m.original.trim(), m.mappedTo.trim()])
    );

    const vendorsMap = new Map<number, number>();

    for (let i = 0; i < rawRows.length; i++) {
      const rawRow = rawRows[i];
      const row: any = {};
      for (const key in rawRow) {
        const mappedKey = mapObj[key];
        if (mappedKey) row[mappedKey] = rawRow[key];
      }

      const result = mappedRowSchema.safeParse(row);
      if (!result.success) {
        const msg = result.error.issues
          .map((issue) => issue.message)
          .join(", ");
        logger.warn(`Row ${i + 1} skipped: ${msg}`);
        errorRows.push({ index: i + 1, reason: msg });
        continue;
      }

      const parsed = result.data;

      if (!vendorsMap.has(parsed.vendorNumber)) {
        const exists = await prisma.vendor.findUnique({
          where: { id: parsed.vendorNumber },
        });
        if (!exists) {
          await prisma.vendor.create({
            data: { id: parsed.vendorNumber, name: parsed.vendorName },
          });
        }
        vendorsMap.set(parsed.vendorNumber, parsed.vendorNumber);
      }

      validItems.push({
        id: parsed.brand,
        description: parsed.description,
        price: parsed.price,
        volume: parsed.volume,
        classification: parsed.classification,
        vendorId: parsed.vendorNumber,
      });
    }

    await prisma.purchaseItem.createMany({
      data: validItems,
      skipDuplicates: true,
    });

    res.status(200).json({
      message: "CSV processed",
      saved: validItems.length,
      errors: errorRows,
    });
  } catch (err) {
    logger.error(`Failed to process CSV: ${(err as Error).message}`);
    res.status(500).json({ error: "Failed to process file" });
  }
};
