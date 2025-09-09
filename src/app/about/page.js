// src/app/about/page.js
import Image from 'next/image';

// This is for SEO
export const metadata = {
  title: "About Us | Grand Medical Equipment",
  description: "Learn about Grand Medical Equipment, a trusted dealer of used medical imaging equipment with over 30 years of experience.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">About Grand Medical Equipment, Inc.</h1>
            <div className="space-y-6 text-gray-700 text-lg">
              <p>We are a large used medical equipment and parts dealer and supplier based in the United States, specializing in buying/selling complete used medical imaging systems and their parts in good working condition and at the most competitive prices. We operate our business professionally and honestly and have gained the best reputation and trust by our customers and suppliers all over the world throughout the past 30 plus years.</p>
              <p>Our pre-owned diagnostic imaging systems include CT scanners, MRI scanners, Cath and angio labs, Mammography, cardiac labs, PET/CT scanners, Ultrasound systems, Digital radiology(DR) rooms and fluoroscopy(R/F) rooms.</p>
              <p>We also have a huge inventory of used parts for sale. Our warehouse constantly has complete systems and spare parts in stock for all brands and modalities.</p>
              <p>We only sell systems and parts that we completely own.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Certifications & Memberships</h2>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <Image src="https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/fda-register.png?alt=media&token=ca0f869a-68f2-44b7-a9e0-84e1cb6aba16" alt="FDA Registered" width={200} height={96} className="h-24 w-auto" />
            <Image src="https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/dotMed_certified.png?alt=media&token=a1e20809-5620-4b4c-b69c-bb30c77f3efe" alt="DotMed Certified" width={180} height={80} className="h-20 w-auto" />
            <Image src="https://firebasestorage.googleapis.com/v0/b/grand-medical-website.firebasestorage.app/o/dotMed_parts.png?alt=media&token=508485be-7c7a-4745-9b27-a82846e9ac9a" alt="DotMed Gold Parts Vendor" width={180} height={80} className="h-20 w-auto" />
          </div>
        </div>
      </section>
    </>
  );
}