// src/components/Footer.js
"use client";
import React from 'react';
import Link from 'next/link';

export const Footer = () => (
    <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="md:col-span-1">
                 <Link href="/" className="flex items-center space-x-3 cursor-pointer mb-4">
                    <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M163 100C163 137.647 132.647 168 95 168C57.353 168 27 137.647 27 100C27 62.353 57.353 32 95 32C121.42 32 144.353 47.391 155.41 68" stroke="#0D9488" strokeWidth="22" strokeLinecap="round"/>
                        <path d="M125 100H163" stroke="#0D9488" strokeWidth="22" strokeLinecap="round"/>
                        <path d="M95 32C80.203 48.031 73 69.5 73 100C73 130.5 80.203 151.969 95 168" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round"/>
    </svg>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white leading-tight">GRAND</span>
                        <span className="text-xs font-semibold text-gray-400 tracking-wider leading-tight">Medical Equipment</span>
                    </div>
                </Link>
                <p className="text-gray-400 text-sm mt-2">Your trusted partner for high-quality, pre-owned medical imaging equipment.</p>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                    <li><Link href="/" className="hover:text-white cursor-pointer">Home</Link></li>
                    <li><Link href="/products/Systems" className="hover:text-white cursor-pointer">Systems</Link></li>
                    <li><Link href="/products/Parts" className="hover:text-white cursor-pointer">Parts</Link></li>
                    <li><Link href="/about" className="hover:text-white cursor-pointer">About Us</Link></li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">Contact Us</h3>
                <address className="text-gray-400 text-sm not-italic space-y-2">
                    <p>3 Corporate Drive<br/>Cranbury, NJ 08512 USA</p>
                    <p><strong>Phone:</strong> +1 (888) 519-2788</p>
                    <p><strong>Email:</strong> support@grandmedicalequipment.com</p>
                </address>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                {/* Social media links can be added here */}
            </div>
        </div>
        <div className="container mx-auto px-6 mt-8 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Grand Medical Equipment. All Rights Reserved.</p>
        </div>
    </footer>
);