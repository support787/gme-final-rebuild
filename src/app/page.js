// Triggering a new build for Firebase....

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PartsSearchBar from '../components/PartsSearchBar';

const ModalityCard = ({ name, imageUrl }) => (
  <Link href={`/products/Systems?modality=${encodeURIComponent(name)}`} className="group block text-center cursor-pointer">
    <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden group-hover:shadow-lg transition duration-300">
      <div className="w-full h-full flex items-center justify-center">
        <Image 
          src={imageUrl} 
          alt={`${name} placeholder`} 
          width={400} 
          height={400} 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-800">{name}</h3>
  </Link>
);

export default function Home() {
  const heroBackgroundImage = 'https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/mri%20image.jpg?alt=media&token=40eedff6-4ec0-4d52-86e9-022d02cb5344';
  
  const modalities = [
    { name: "MRI", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/MRI%20sample.jpg?alt=media&token=c7524a27-de71-4e5b-a4cc-e552eb2cb65e" },
    { name: "CT", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/CT%20Sample.jpg?alt=media&token=355a9618-53ea-4b6c-93a0-2a320c0f8d7d" },
    { name: "CATH/ANGIO", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/cath%20sample.jpg?alt=media&token=d9480024-bfd7-44aa-bda5-e3152417dd33" },
    { name: "PET/CT", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/PET%20sample.jpg?alt=media&token=6e8aff9f-d2a2-47be-b533-91c45fe8be4d" },
    { name: "MAMMO", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/Mammo%20sample.jpg?alt=media&token=d9e09363-5a7e-4e34-8537-ec66fd0e2738" },
    { name: "SPECT/CT", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/spec%20samp.jpg?alt=media&token=9b9bc5c7-24b8-447f-b470-bbeda32f44fb" },
    { name: "C-ARM", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/C-arm%20sample.jpg?alt=media&token=b2775edb-d24f-4177-8daf-6bbfef1ff320" },
    { name: "DR", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/DR%20sample.jpg?alt=media&token=14bd6bae-e466-4199-a119-75b793cc4fd4" },
    { name: "R/F", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/RF%20sample.jpg?alt=media&token=70df59e8-68a2-4605-aadb-6904c9a44ac4" },
    { name: "ULTRASOUND", imageUrl: "https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/ultra%20sample.jpg?alt=media&token=f2bf339c-88dc-4e0c-9709-73d0fa284c4f" }
  ];

  return (
    <>
      <section className="relative text-white hero-section flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroBackgroundImage}')` }}>
          {/* UPDATED: Overlay is now lighter (20% opacity instead of 50%) */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative container mx-auto px-6 text-center pt-24">
          {/* UPDATED: Added a text shadow for better readability */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
            Grand Medical Equipment<sup className="text-2xl md:text-4xl top-[-0.5em]">®</sup>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">Your Trusted Source of Pre-Owned Medical Equipment and Parts for 30+ Years</p>
        </div>
      </section>

      
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">

          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-16 max-w-4xl mx-auto">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Quick Search For Parts
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Find the exact part you need from our extensive inventory.
            </p>
            <div className="flex justify-center">
              <PartsSearchBar />
            </div>
          </div>

          <h3 className="text-center text-3xl font-bold text-gray-800 mb-12">Browse All Modalities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {modalities.map(modality => (
              <ModalityCard key={modality.name} name={modality.name} imageUrl={modality.imageUrl} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl text-teal-500 mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">30+ Years of Experience</h3>
              <p className="text-gray-600">Our long-standing presence in the industry is a testament to our reliability and expertise.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-teal-500 mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quality Inspected Equipment</h3>
              <p className="text-gray-600">Every system and part we sell is thoroughly tested to ensure it meets our high standards.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-teal-500 mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Global Shipping & Logistics</h3>
              <p className="text-gray-600">We handle all logistics to deliver your equipment safely and efficiently, anywhere in the world.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

