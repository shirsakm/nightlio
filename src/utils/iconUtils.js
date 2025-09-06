// Generate a transparent-background version of an image by removing pixels
// close to the background color (sampled from the top-left corner).
// Returns a Promise that resolves to a data URL (PNG) or null on failure.
export async function generateTransparentIcon(src, { threshold = 20, scale = 1 } = {}) {
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = src;
    });

    const width = Math.max(1, Math.floor((img.width || 64) * (scale || 1)));
    const height = Math.max(1, Math.floor((img.height || 64) * (scale || 1)));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw scaled image
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample background color from top-left pixel
    const r0 = data[0], g0 = data[1], b0 = data[2];

    // Remove near-background pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (Math.abs(r - r0) <= threshold && Math.abs(g - g0) <= threshold && Math.abs(b - b0) <= threshold) {
        data[i + 3] = 0; // alpha -> transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (e) {
    // Fail silently and let caller fallback
    return null;
  }
}

// Replace the <link rel="icon"> with the generated transparent icon.
export async function applyTransparentFavicon({ src = '/logo.png', threshold = 20 } = {}) {
  const dataUrl = await generateTransparentIcon(src, { threshold });
  if (!dataUrl) return false;
  const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
  link.setAttribute('rel', 'icon');
  link.setAttribute('type', 'image/png');
  link.setAttribute('href', dataUrl);
  if (!link.parentNode) document.head.appendChild(link);
  return true;
}
