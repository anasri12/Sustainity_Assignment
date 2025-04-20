import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const getAllData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.purchaseItem.findMany({
      skip,
      take: limit,
      include: { vendor: true },
    }),
    prisma.purchaseItem.count(),
  ]);

  res.status(200).json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

export const getDataById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id);
  const item = await prisma.purchaseItem.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.status(200).json(item);
};
