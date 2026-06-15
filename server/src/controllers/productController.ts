import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/productService.js";
import { idParam } from "../utils/routeParams.js";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productService.listProducts();
    res.json({ success: true, data: products });
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getProduct(Number(idParam(req)));
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.updateProduct(Number(idParam(req)), req.body);
    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.deleteProduct(Number(idParam(req)));
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (e) {
    next(e);
  }
}
