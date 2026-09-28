import { fetchApi } from "@core/api/client";
import type { Page, ApiResponse } from "@core/api/types";

export async function getPages(): Promise<Page[]> {
  const res = await fetchApi<Page[]>("getPages");
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const res = await fetchApi<Page>("getPage", { slug });
  return res.success && res.data ? res.data : null;
}

export async function createPage(page: Partial<Page>): Promise<ApiResponse<Page>> {
  return await fetchApi<Page>("createPage", { page }, { method: "POST", requiresAuth: true });
}

export async function updatePage(id: string, page: Partial<Page>): Promise<ApiResponse<Page>> {
  return await fetchApi<Page>("updatePage", { id, page }, { method: "POST", requiresAuth: true });
}

export async function deletePage(id: string): Promise<ApiResponse<void>> {
  return await fetchApi<void>("deletePage", { id }, { method: "POST", requiresAuth: true });
}
