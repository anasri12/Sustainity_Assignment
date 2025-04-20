import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const saveMapping = async (req: Request, res: Response) => {
  const { mapping, filename } = req.body;
  if (!filename || !mapping) {
    res.status(400).json({ error: "Missing data" });
  }

  const result = await prisma.fileMapping.createMany({
    data: mapping.map((m: any) => ({
      original: m.original,
      mappedTo: m.mappedTo,
      filename,
    })),
    skipDuplicates: true,
  });

  res.status(200).json({ message: "Mapping saved", count: result.count });
};

export const getMapping = async (req: Request, res: Response) => {
  const filename = req.query.filename as string;
  if (!filename) res.status(400).json({ error: "Missing filename" });

  const mappings = await prisma.fileMapping.findMany({ where: { filename } });
  res.status(200).json(mappings);
};
