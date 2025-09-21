"use client";

import { useState } from 'react';
// Import Firestore functions
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust this path if needed

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState(''); // '' | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // This now writes a document to the 'mail' collection,
      // which the Firebase Extension will see and process.
      await addDoc(collection(db, 'mail'), {
        to: ['support@grandmedicalequipment.com'], // Your email address
        message: {
          subject: `Contact Form from ${formData.name}: ${formData.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Subject:</strong> ${formData.subject || 'Not provided'}</p>
            <hr>
            <h3>Message:</h3>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
          `,
        },
      });
      setStatus('success');

    } catch (error) {
      console.error('Error writing to mail collection:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-slate-50 py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          
          {status === 'success' ? (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-teal-600 mb-4">Thank You!</h2>
              <p className="text-gray-700 text-lg">Your message has been sent successfully. We will get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800">Contact Us</h1>
                <p className="text-gray-600 mt-4">Have a question or need assistance? Fill out the form below and we'll get in touch.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                  <textarea name="message" id="message" rows="6" required value={formData.message} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <div className="flex justify-end items-center gap-4 pt-4">
                  {status === 'error' && <p className="text-red-500 text-sm">Failed to send. Please try again.</p>}
                  <button
                    type="submit"
                    className="bg-teal-600 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-700 transition duration-300 disabled:bg-teal-400"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}