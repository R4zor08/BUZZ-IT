import { prisma } from "../lib/prisma.js";

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }
  return product;
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
}) {
  return prisma.product.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      quantity: input.quantity,
      category: input.category ?? "",
    },
  });
}

export async function updateProduct(
  id: number,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
  }>
) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  return prisma.product.update({
    where: { id },
    data: input,
  });
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }
  await prisma.product.delete({ where: { id } });
}
