"use server";

import { ProductListResponse } from "dodopayments/resources/index.mjs";

import { dodoClient } from "@/src/lib/dodoPayments";
import { ServerActionRes } from "@/src/types/serverAction";

export async function getProducts(): ServerActionRes<ProductListResponse[]> {
  try {
    const products = await dodoClient.products.list();
    return { success: true, data: products.items };
  } catch (error) {
    return { success: false, error: "Failed to fetch products" };
  }
}
