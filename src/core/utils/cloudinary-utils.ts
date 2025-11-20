/**
 * Cloudinary URL Utilities
 * 
 * Converts Cloudinary asset URLs to proper image delivery URLs
 */

/**
 * Converts a Cloudinary asset URL to a proper image delivery URL
 * 
 * Note: asset.cloudinary.com URLs work directly in browsers and should be used as-is.
 * The public_id in asset.cloudinary.com URLs may not match the actual image public_id
 * in res.cloudinary.com format, so we return the original URL to ensure correct image loading.
 * 
 * @param url - The Cloudinary URL (can be asset.cloudinary.com or res.cloudinary.com)
 * @returns The URL that can be used for image display (original URL for asset.cloudinary.com)
 */
export function transformCloudinaryUrl(url: string): string {
  if (!url) return url;

  // If it's already a res.cloudinary.com URL, return as is
  if (url.includes('res.cloudinary.com')) {
    return url;
  }

  // asset.cloudinary.com URLs work directly in browsers and should be used as-is
  // The backend stores asset references that may not match the actual image public_id,
  // so we return the original URL to ensure the correct image is loaded
  if (url.includes('asset.cloudinary.com')) {
    return url;
  }

  // Return original URL for any other format
  return url;
}

/**
 * Gets alternative Cloudinary URL formats to try if the primary one fails
 * 
 * @param url - The original Cloudinary URL
 * @returns Array of alternative URLs to try
 */
export function getAlternativeCloudinaryUrls(url: string): string[] {
  const alternatives: string[] = [];
  
  if (!url || !url.includes('asset.cloudinary.com')) {
    return alternatives;
  }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const cloudName = pathParts[0];
      const publicId = pathParts.slice(1).join('/');
      
      // Try with common image extensions if public_id doesn't have one
      const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(publicId);
      
      if (!hasExtension) {
        // Try with different extensions
        ['jpg', 'png', 'webp'].forEach(ext => {
          alternatives.push(`https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${ext}`);
        });
      }
      
      // Also try the original asset.cloudinary.com URL (sometimes it works)
      alternatives.push(url);
    }
  } catch (error) {
    console.warn('Failed to generate alternative Cloudinary URLs:', error);
  }
  
  return alternatives;
}

/**
 * Gets a Cloudinary image URL with optional transformations
 * 
 * @param url - The Cloudinary URL
 * @param options - Transformation options
 * @returns The transformed URL
 */
export function getCloudinaryImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
  }
): string {
  const baseUrl = transformCloudinaryUrl(url);
  
  if (!options || Object.keys(options).length === 0) {
    return baseUrl;
  }

  // If it's already a res.cloudinary.com URL, add transformations
  if (baseUrl.includes('res.cloudinary.com/image/upload')) {
    const transformations: string[] = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    
    if (transformations.length > 0) {
      // Insert transformations before the public_id
      const parts = baseUrl.split('/image/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/image/upload/${transformations.join(',')}/${parts[1]}`;
      }
    }
  }
  
  return baseUrl;
}

