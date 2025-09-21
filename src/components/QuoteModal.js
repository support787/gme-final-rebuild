"use client";

import { useState, useEffect } from 'react';
// 1. Import Firestore functions
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Adjust this path if your firebase.js is elsewhere

export default function QuoteModal({ isOpen, onClose, productDescription }) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    country: '',
    message: '',
  });
  const [status, setStatus] = useState(''); // '' | 'sending' | 'success' | 'error'

  useEffect(() => {
    if (productDescription) {
      setFormData(prev => ({
        ...prev,
        message: `Hi, please provide a quote and the terms for "${productDescription}"`
      }));
    }
  }, [productDescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      setStatus('error');
      return;
    }
    setStatus('sending');

    try {
      // Instead of fetch, we now add a document to the 'mail' collection
      await addDoc(collection(db, 'mail'), {
        // CORRECTED: Replace the placeholder with your actual email address.
        to: ['support@grandmedicalequipment.com'], 
        message: {
          subject: `Quote Request from ${formData.fullName} for ${productDescription}`,
          html: `
            <h2>New Quote Request</h2>
            <p><strong>Product:</strong> ${productDescription}</p>
            <hr>
            <p><strong>Name:</strong> ${formData.fullName}</p>
            <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Country:</strong> ${formData.country || 'Not provided'}</p>
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        {status === 'success' ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-600 mb-4">Thank You!</h2>
            <p className="text-gray-700 mb-6">Your quote request has been sent successfully. We will get back to you shortly.</p>
            <button
              onClick={() => {
                onClose();
                setStatus('');
              }}
              className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600 transition duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                  <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea name="message" id="message" rows="5" value={formData.message} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
              </div>
              <div className="flex justify-end items-center gap-4 pt-4">
                {status === 'error' && <p className="text-red-500 text-sm">Failed to send. Please try again.</p>}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-300 transition duration-300"
                  disabled={status === 'sending'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 text-white font-bold py-2 px-6 rounded-full hover:bg-teal-700 transition duration-300 disabled:bg-teal-400"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

