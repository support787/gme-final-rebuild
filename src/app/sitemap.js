// src/app/sitemap.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Adjust path to your firebase config

export default async function sitemap() {
  const baseUrl = 'https://www.grandmedicalequipment.com';

  // Get all product and system IDs from Firestore
  const productsSnapshot = await getDocs(collection(db, "products"));
  const systemsSnapshot = await getDocs(collection(db, "Systems"));

  const productUrls = productsSnapshot.docs.map(doc => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));
  
  const systemUrls = systemsSnapshot.docs.map(doc => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  // Add your static pages
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

  return [...staticRoutes, ...productUrls, ...systemUrls];
}