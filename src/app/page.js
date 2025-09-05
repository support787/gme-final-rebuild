import React from 'react';

export default function Home() {
  // We define the image URL directly here for simplicity.
  const heroBackgroundImage = 'https://firebasestorage.googleapis.com/v0/b/grand-medical-website.appspot.com/o/mri%20image.jpg?alt=media&token=40edff6-4ec0-4d52-86e9-022d02cb5344';

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-white">
        
        {/* Background Image Container - UPDATED for better Tailwind compatibility */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBackgroundImage}')` }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-4">
            GRAND MEDICAL EQUIPMENT®
          </h1>
          <p className="text-lg md:text-xl">
            Your Trusted Source for Pre-Owned Medical Equipment
          </p>
        </div>

      </section>

      {/* "Expertise and Trust" Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-gray-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              30+ Years of Expertise and Trust
            </h2>
            <p className="mb-4">
              We are a large used medical equipment and parts dealer and supplier based in the United States, specializing in buying/selling imaging systems and their parts in good working condition and at the most competitive prices.
            </p>
            <p>
              We operate our business professionally and honestly and have gained the best reputation and trust by our customers and suppliers.
            </p>
          </div>

          {/* Empty div for layout spacing on larger screens */}
          <div className="hidden md:block"></div>
        </div>
      </section>
      
    </main>
  );
}

