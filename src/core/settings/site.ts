import { fetchApi } from "@core/api/client";
import type { SiteSettings, ApiResponse } from "@core/api/types";

export async function getSettings(): Promise<SiteSettings> {
  const res = await fetchApi<SiteSettings>("getSettings");
  return res.success && res.data ? res.data : {};
}

export async function updateSettings(settings: SiteSettings): Promise<ApiResponse<SiteSettings>> {
  return await fetchApi<SiteSettings>("updateSettings", { settings }, { method: "POST", requiresAuth: true });
}

export async function triggerDeployHook(deployUrl: string): Promise<boolean> {
  try {
    if (!deployUrl) return false;
    const res = await fetch(deployUrl, { method: "POST" });
    return res.ok;
  } catch (e) {
    console.error("Deploy hook failed:", e);
    return false;
  }
}

export async function pingIndexNow(host: string, key: string, urlList: string[]): Promise<boolean> {
  try {
    if (!host || !key || urlList.length === 0) return false;
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        urlList,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("IndexNow ping failed:", e);
    return false;
  }
}
