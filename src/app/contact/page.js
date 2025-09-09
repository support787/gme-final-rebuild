// src/app/contact/page.js

// This is for SEO
export const metadata = {
  title: "Contact Us | Grand Medical Equipment",
  description: "Contact Grand Medical Equipment for inquiries about our used medical imaging systems and parts. We are based in Cranbury, NJ.",
};

export default function ContactPage() {
  // This is a standard, secure URL for embedding Google Maps.
  const mapEmbedUrl = "https://www.google.com/maps/embed/v1/place?key=$";

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Get In Touch</h2>
            <div className="text-gray-600 space-y-4">
              <p>We are here to help. Please use the form to send us a message, or contact us directly using the information below.</p>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Location</h3>
              <address className="text-gray-600 not-italic space-y-2">
                <p><strong>Grand Medical Equipment, Inc.</strong></p>
                <p>3 Corporate Drive<br />Cranbury, NJ 08512 USA</p>
                <p><strong>Phone:</strong> +1 (888) 519-2788</p>
                <p><strong>Email:</strong> support@grandmedicalequipment.com</p>
              </address>
              <div className="mt-4 h-64 bg-gray-200 rounded-lg">
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={mapEmbedUrl}
                  allowFullScreen>
                </iframe>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
            <form action="https://formspree.io/f/xwpqleeo" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                <input type="text" id="name" name="name" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                <input type="email" id="email" name="email" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" required />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" id="subject" name="subject" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="message" rows="5" className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-full hover:bg-teal-700 transition duration-300">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}