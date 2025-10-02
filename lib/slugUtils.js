// Utility functions for slug and canonical URL generation

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to slug
 * @returns {string} - URL-friendly slug
 */
export function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate canonical URL from slug
 * @param {string} slug - The slug to use in URL
 * @param {string} baseUrl - Base URL of the site (optional, defaults to NEXT_PUBLIC_BASE_URL)
 * @returns {string} - Complete canonical URL
 */
export function generateCanonicalUrl(slug, baseUrl = null) {
  if (!slug) return '';
  
  // Use provided baseUrl or get from environment or use window.location
  const base = baseUrl 
    || process.env.NEXT_PUBLIC_BASE_URL 
    || (typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com');
  
  // Remove trailing slash from base URL
  const cleanBase = base.replace(/\/$/, '');
  
  // Construct canonical URL
  return `${cleanBase}/blog/${slug}`;
}

/**
 * Validate slug format
 * @param {string} slug - The slug to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidSlug(slug) {
  if (!slug) return false;
  
  // Slug should only contain lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validate canonical URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidCanonicalUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Generate both slug and canonical URL from title
 * @param {string} title - The title to process
 * @param {string} baseUrl - Base URL of the site (optional)
 * @returns {object} - Object containing slug and canonicalUrl
 */
export function generateSlugAndCanonical(title, baseUrl = null) {
  const slug = generateSlug(title);
  const canonicalUrl = generateCanonicalUrl(slug, baseUrl);
  
  return {
    slug,
    canonicalUrl
  };
}

/**
 * Clean and format a slug (useful for user input)
 * @param {string} input - User input to clean
 * @returns {string} - Cleaned slug
 */
export function cleanSlugInput(input) {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove invalid characters
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}   