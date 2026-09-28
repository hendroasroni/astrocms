import { fetchApi } from "@core/api/client";
import type { Product, ApiResponse } from "@core/api/types";

export async function getProducts(): Promise<Product[]> {
  const res = await fetchApi<Product[]>("getProducts");
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function createProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
  return await fetchApi<Product>("createProduct", { product }, { method: "POST", requiresAuth: true });
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
  return await fetchApi<Product>("updateProduct", { id, product }, { method: "POST", requiresAuth: true });
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  return await fetchApi<void>("deleteProduct", { id }, { method: "POST", requiresAuth: true });
}
