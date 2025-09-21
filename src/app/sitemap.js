import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase'; // Make sure this path is correct

export default async function sitemap() {
  const baseUrl = 'https://www.grandmedicalequipment.com';

  // --- Fetch all dynamic product/system URLs ---
  const systemsRef = collection(db, 'Systems');
  const productsRef = collection(db, 'products');

  const [systemsSnapshot, productsSnapshot] = await Promise.all([
    getDocs(systemsRef),
    getDocs(productsRef)
  ]);

  const systemUrls = systemsSnapshot.docs.map(doc => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  const productUrls = productsSnapshot.docs.map(doc => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  // --- Define your static page URLs ---
  const staticUrls = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/products/Systems`, lastModified: new Date() },
    { url: `${baseUrl}/products/Parts`, lastModified: new Date() },
  ];

  // Combine all URLs
  return [...staticUrls, ...systemUrls, ...productUrls];
}