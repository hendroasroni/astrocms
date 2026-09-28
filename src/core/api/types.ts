// Core Type Definitions for Astro CMS

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  status: "published" | "draft";
  category: string;
  tags: string[];
  published_at: string; // ISO-8601 string
  updated_at: string;   // ISO-8601 string
  seo_title?: string;
  seo_description?: string;
  author?: string;
  disable_ads?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  discount_price?: number;
  category: string;
  status: "published" | "draft";
  updated_at: string;
}

export interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  logo?: string;
  favicon?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  default_og_image?: string;
  gsc_verification?: string;
  indexnow_key?: string;
  auto_indexnow?: boolean;
  deploy_hook_url?: string;
  
  // Ad Management Fields
  enable_ads_articles?: boolean;
  enable_ads_homepage?: boolean;
  ads_paragraph_interval?: number;
  ads_header?: string;
  ads_before_content?: string;
  ads_in_content?: string;
  ads_after_content?: string;
  ads_footer?: string;

  custom_head_scripts?: string;
  custom_body_start_scripts?: string;
  custom_body_end_scripts?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
