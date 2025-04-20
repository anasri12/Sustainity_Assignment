import { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const uploadCSV = async (req: Request, res: Response) => {
  const items: any[] = [];
  const vendorsMap: Map<string, number> = new Map();
  const purchaseItems: any[] = [];

  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csv())
        .on("data", (row) => {
          items.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    fs.unlinkSync(req.file!.path);

    for (const row of items) {
      const vendorNumber: number = parseInt(row["VendorNumber"]);
      const vendorName: string = row["VendorName"].trim();

      let vendorId: number;

      if (vendorsMap.has(vendorNumber.toString())) {
        vendorId = vendorsMap.get(vendorNumber.toString())!;
      } else {
        const existingVendor = await prisma.vendor.findUnique({
          where: { id: vendorNumber },
        });

        if (!existingVendor) {
          await prisma.vendor.create({
            data: {
              id: vendorNumber,
              name: vendorName,
            },
          });
        }

        vendorId = vendorNumber;
        vendorsMap.set(vendorNumber.toString(), vendorId);
      }

      purchaseItems.push({
        id: parseInt(row["Brand"]),
        description: row["Description"],
        price: parseFloat(row["Price"]),
        volume: parseInt(row["Volume"]) || 0,
        classification: parseInt(row["Classification"]),
        vendorId,
      });
    }

    // Batch insert
    await prisma.purchaseItem.createMany({
      data: purchaseItems,
      skipDuplicates: true, // avoids conflict if id already exists
    });

    res
      .status(200)
      .json({ message: "Data uploaded", count: purchaseItems.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CSV processing failed" });
  }
};
