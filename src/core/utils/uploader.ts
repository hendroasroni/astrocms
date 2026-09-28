/**
 * Universal Client-Side Image Uploader for Astro CMS
 * 
 * Flow Priority:
 * 1. Cloudinary Unsigned Upload (if configured)
 * 2. Firebase Storage (if configured)
 * 3. Client-Side Compressed Image (Local/Demo Fallback)
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export async function uploadImage(file: File): Promise<string> {
  // 1. Cloudinary Direct Unsigned Upload
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Gagal mengupload gambar ke Cloudinary.");
    }

    const data = await res.json();
    return data.secure_url || data.url;
  }

  // 2. Client-Side Optimized Compressed Image (Max 1200px, WebP/JPEG) for Local/Demo Mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Try exporting as webp, fallback to jpeg
        const dataUrl = canvas.toDataURL("image/webp", 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Gagal membaca file gambar."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file lokal."));
    reader.readAsDataURL(file);
  });
}
