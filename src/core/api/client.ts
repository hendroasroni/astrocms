import type { ApiResponse, Post, SiteSettings, Page, Product } from "./types";
import { getIdToken } from "@core/auth/auth";

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("astrocms_api_url");
    if (custom) return custom.trim();
  }
  return (import.meta.env.PUBLIC_API_URL || "").trim();
}

export function setApiUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("astrocms_api_url", url.trim());
  }
}

// Storage keys for local caching & demo fallback
const STORAGE_PREFIX = "astrocms_";

export function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  const stored = localStorage.getItem(STORAGE_PREFIX + key) || localStorage.getItem("astro_cms_mock_" + key);
  if (!stored) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultVal;
  }
}

export function setLocalData<T>(key: string, val: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    localStorage.setItem("astro_cms_mock_" + key, JSON.stringify(val));
  }
}

const defaultMockPosts: Post[] = [
  {
    id: "post-1",
    title: "Selamat Datang di Pempek Ilen Palembang",
    slug: "selamat-datang-di-pempek-ilen",
    excerpt: "Nikmati kelezatan pempek asli Palembang dengan resep warisan turun temurun sejak 1998.",
    content: "Pempek Ilen menyajikan berbagai varian pempek berkualitas premium yang dibuat dari 100% daging ikan tenggiri segar tanpa bahan pengawet. Dilengkapi dengan cuko kental pedas manis gula batok asli Linggau.",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80",
    status: "published",
    category: "Berita",
    tags: ["pempek", "palembang", "kuliner"],
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Admin Pempek Ilen",
  },
  {
    id: "post-2",
    title: "5 Tips Menggoreng Pempek Kulit Agar Crispy & Mengembang",
    slug: "5-tips-menggoreng-pempek-kulit-agar-crispy",
    excerpt: "Cara mudah dan praktis menggoreng pempek kulit agar renyah di luar dan lembut di dalam.",
    content: "Gunakan api sedang dan minyak yang cukup banyak. Pastikan minyak sudah benar-benar panas sebelum pempek dimasukkan. Jangan membalik pempek terlalu sering agar minyak tidak banyak terserap.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80",
    status: "published",
    category: "Tips & Trik",
    tags: ["tips", "resep", "goreng"],
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Chef Ilen",
  },
];

const defaultMockSettings: SiteSettings = {
  site_name: "Pempek Ilen",
  site_tagline: "Gurih, Lembut, dan 100% Ikan Tenggiri Asli",
  site_description: "Pempek Asli Palembang dengan cita rasa khas dan cuko mantap sejak 1998.",
  whatsapp: "6281234567890",
  email: "kontak@pempekilen.com",
  instagram: "https://instagram.com/pempekilen",
  indexnow_key: "32a1b2c3d4e5f67890abcdef12345678",
  deploy_hook_url: "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/demo-sample",
  custom_head_scripts: "<!-- Demo GA4 Tracking Script -->",
};

export async function fetchApi<T = any>(
  action: string,
  params: Record<string, any> = {},
  options: { method?: "GET" | "POST"; requiresAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", requiresAuth = false } = options;
  const apiUrl = getApiUrl();

  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) {
      return { success: false, error: "Unauthorized: Please login first." };
    }
  }

  // If no backend API configured, serve Mock LocalStorage Database for instant testing!
  if (!apiUrl) {
    if (typeof window !== "undefined") {
      await new Promise((r) => setTimeout(r, 60));
    }

    if (action === "getPosts") {
      const posts = getLocalData<Post[]>("posts", defaultMockPosts);
      return { success: true, data: posts as unknown as T };
    }

    if (action === "getPost") {
      const posts = getLocalData<Post[]>("posts", defaultMockPosts);
      const post = posts.find((p) => p.slug === params.slug) || null;
      return { success: true, data: post as unknown as T };
    }

    if (action === "createPost") {
      const posts = getLocalData<Post[]>("posts", defaultMockPosts);
      const newPost: Post = {
        id: "post-" + Date.now(),
        ...params.post,
      };
      posts.unshift(newPost);
      setLocalData("posts", posts);
      return { success: true, data: newPost as unknown as T };
    }

    if (action === "updatePost") {
      const posts = getLocalData<Post[]>("posts", defaultMockPosts);
      const index = posts.findIndex((p) => p.id === params.id);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...params.post };
        setLocalData("posts", posts);
        return { success: true, data: posts[index] as unknown as T };
      }
      return { success: true, data: params.post as unknown as T };
    }

    if (action === "deletePost") {
      let posts = getLocalData<Post[]>("posts", defaultMockPosts);
      posts = posts.filter((p) => p.id !== params.id);
      setLocalData("posts", posts);
      return { success: true, data: null as unknown as T };
    }

    if (action === "getSettings") {
      const settings = getLocalData<SiteSettings>("settings", defaultMockSettings);
      return { success: true, data: settings as unknown as T };
    }

    if (action === "updateSettings") {
      const settings = params.settings || {};
      setLocalData("settings", settings);
      return { success: true, data: settings as unknown as T };
    }

    return { success: true, data: null as unknown as T };
  }

  // Real Google Apps Script fetch
  try {
    let result: ApiResponse<T>;

    if (method === "GET") {
      const queryParams = new URLSearchParams({ action, ...params });
      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        redirect: "follow",
      });
      result = await response.json();
    } else {
      // POST with text/plain body avoids CORS preflight on Google Apps Script
      const body = JSON.stringify({ action, ...params });
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body,
        redirect: "follow",
      });
      result = await response.json();
    }

    // Automatically sync local storage on every successful operation for real-time frontend rendering
    if (result.success) {
      if (action === "getPosts" && Array.isArray(result.data)) {
        setLocalData("posts", result.data);
      } else if (action === "createPost" && result.data) {
        const posts = getLocalData<Post[]>("posts", []);
        posts.unshift(result.data as unknown as Post);
        setLocalData("posts", posts);
      } else if (action === "updatePost" && result.data) {
        const posts = getLocalData<Post[]>("posts", []);
        const idx = posts.findIndex((p) => p.id === params.id);
        if (idx !== -1) {
          posts[idx] = { ...posts[idx], ...params.post };
          setLocalData("posts", posts);
        }
      } else if (action === "deletePost") {
        let posts = getLocalData<Post[]>("posts", []);
        posts = posts.filter((p) => p.id !== params.id);
        setLocalData("posts", posts);
      }
    }

    return result;
  } catch (err: any) {
    console.error(`API Error [${action}]:`, err);
    return { success: false, error: err.message || "Gagal berkomunikasi dengan Google Apps Script API." };
  }
}
