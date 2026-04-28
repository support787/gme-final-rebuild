import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Adjust this path if your firebase.js is elsewhere

// REPLACE THIS WITH YOUR ACTUAL DOMAIN
const BASE_URL = 'https://www.grandmedicalequipment.com'; 

export default async function sitemap() {
  // 1. Fetch all Parts
  const partsSnapshot = await getDocs(collection(db, 'products'));
  const parts = partsSnapshot.docs.map((doc) => ({
    url: `${BASE_URL}/product/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 2. Fetch all Systems
  const systemsSnapshot = await getDocs(collection(db, 'Systems'));
  const systems = systemsSnapshot.docs.map((doc) => ({
    url: `${BASE_URL}/product/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Define your static pages (Home, About, etc.)
  const routes = [
    '',
    '/products/Parts',
    '/products/Systems',
    '/contact',
    '/about',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 4. Combine everything
  return [...routes, ...parts, ...systems];
}