export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  language: string;
  theme: string;
  author: string;
  tagline?: string;
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export const site: SiteConfig = {
  name: "Pempek Ilen",
  url: "https://pempekilen.com",
  description: "Pempek Asli Palembang dengan cita rasa khas dan cuko mantap sejak 1998.",
  language: "id",
  theme: "pempek",
  author: "Pempek Ilen Team",
  tagline: "Gurih, Lembut, dan 100% Ikan Tenggiri Asli",
  contact: {
    email: "kontak@pempekilen.com",
    whatsapp: "6281234567890",
    phone: "0812-3456-7890",
    address: "Jl. Demang Lebar Daun No. 45, Palembang, Sumatera Selatan",
  },
  socials: {
    instagram: "https://instagram.com/pempekilen",
    facebook: "https://facebook.com/pempekilen",
    tiktok: "https://tiktok.com/@pempekilen",
  },
};
