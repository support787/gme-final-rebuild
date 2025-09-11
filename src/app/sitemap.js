// src/app/sitemap.js

export default function sitemap() {
  const baseUrl = 'https://www.grandmedicalequipment.com';

  // Add your static pages here
  const staticRoutes = [
    '/',
    '/about',
    '/contact',
    '/products/Systems',
    '/products/Parts',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // Note: We will add your dynamic product pages here in a later step
  // after connecting to the database.

  return [...staticRoutes];
}