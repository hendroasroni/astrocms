import { fetchApi } from "@core/api/client";
import type { Post, ApiResponse } from "@core/api/types";

export async function getPosts(): Promise<Post[]> {
  const res = await fetchApi<Post[]>("getPosts");
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetchApi<Post>("getPost", { slug });
  return res.success && res.data ? res.data : null;
}

export async function createPost(post: Partial<Post>): Promise<ApiResponse<Post>> {
  return await fetchApi<Post>("createPost", { post }, { method: "POST", requiresAuth: true });
}

export async function updatePost(id: string, post: Partial<Post>): Promise<ApiResponse<Post>> {
  return await fetchApi<Post>("updatePost", { id, post }, { method: "POST", requiresAuth: true });
}

export async function deletePost(id: string): Promise<ApiResponse<void>> {
  return await fetchApi<void>("deletePost", { id }, { method: "POST", requiresAuth: true });
}
