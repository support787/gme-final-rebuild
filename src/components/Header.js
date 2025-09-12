// src/components/Header.js
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

export const Header = () => {
    const { user, isAdmin, signIn, logOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    const headerClasses = isHomePage && !isMobileMenuOpen ? 'absolute top-0 left-0 right-0 z-50 bg-transparent' : 'sticky top-0 z-50 bg-white shadow-md';
    const linkBaseColor = isHomePage && !isMobileMenuOpen ? 'text-white' : 'text-gray-600';
    const logoTextColor = isHomePage && !isMobileMenuOpen ? 'text-white' : 'text-gray-800';
    const logoSubTextColor = isHomePage && !isMobileMenuOpen ? 'text-gray-200' : 'text-gray-500';

    const navLinkClasses = (href) => {
        const isActive = pathname === href;
        const activeColor = 'text-teal-600 font-semibold';
        const homeActiveColor = 'text-white font-bold border-b-2 border-white';

        if (isActive) {
            return `transition duration-300 cursor-pointer pb-1 ${isHomePage && !isMobileMenuOpen ? homeActiveColor : activeColor}`;
        }
        return `transition duration-300 cursor-pointer pb-1 ${linkBaseColor} hover:text-teal-600`;
    };
    
    const svgStrokeColor = '#0D9488';
    const svgFillColor = '#FBBF24';

    return (
        <header className={headerClasses}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                    <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M163 100C163 137.647 132.647 168 95 168C57.353 168 27 137.647 27 100C27 62.353 57.353 32 95 32C121.42 32 144.353 47.391 155.41 68" stroke={svgStrokeColor} strokeWidth="22" strokeLinecap="round"/>
                        <path d="M125 100H163" stroke={svgStrokeColor} strokeWidth="22" strokeLinecap="round"/>
                        <path d="M95 32C80.203 48.031 73 69.5 73 100C73 130.5 80.203 151.969 95 168" stroke={svgFillColor} strokeWidth="12" strokeLinecap="round"/>
                    </svg>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-bold ${logoTextColor} leading-tight`}>GRAND</span>
                        <span className={`text-xs font-semibold ${logoSubTextColor} tracking-wider leading-tight`}>Medical Equipment, Inc.</span>
                    </div>
                </Link>
                {/* --- THIS IS THE DESKTOP MENU --- */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/" className={navLinkClasses('/')}>Home</Link>
                    <Link href="/products/Systems" className={navLinkClasses('/products/Systems')}>Systems</Link>
                    <Link href="/products/Parts" className={navLinkClasses('/products/Parts')}>Parts</Link>
                    <Link href="/about" className={navLinkClasses('/about')}>About Us</Link>
                    <Link href="/contact" className={navLinkClasses('/contact')}>Contact Us</Link>
                    <div className="flex items-center space-x-4 pl-4 border-l border-gray-200/50">
                       {user ? (
                           <>
                                <span className={`text-sm font-medium ${linkBaseColor}`}>{isAdmin ? 'Admin:' : ''} {user.displayName}</span>
                                <button onClick={logOut} className={`text-sm font-semibold ${linkBaseColor} hover:underline`}>Sign Out</button>
                           </>
                       ) : (
                           <button onClick={signIn} className={`text-sm font-semibold ${linkBaseColor} hover:underline`}>Admin Login</button>
                       )}
                    </div>
                </div>
                {/* --- THIS IS THE MOBILE MENU BUTTON (HAMBURGER) --- */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <svg className={`w-6 h-6 ${isHomePage && !isMobileMenuOpen ? 'text-white' : 'text-gray-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                    </button>
                </div>
            </nav>
            {/* --- THIS IS THE MOBILE MENU DROPDOWN --- */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white py-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-gray-600 hover:bg-gray-100">Home</Link>
                    <Link href="/products/Systems" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-gray-600 hover:bg-gray-100">Systems</Link>
                    <Link href="/products/Parts" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-gray-600 hover:bg-gray-100">Parts</Link>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-gray-600 hover:bg-gray-100">About Us</Link>
                    <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-6 text-gray-600 hover:bg-gray-100">Contact Us</Link>
                     <div className="border-t border-gray-200 mt-4 pt-4 px-6">
                       {user ? (
                           <div className="space-y-2">
                            <p className="text-sm text-gray-500">{isAdmin ? 'Admin:' : ''} {user.displayName}</p>
                            <button onClick={() => { logOut(); setIsMobileMenuOpen(false); }} className="w-full text-left text-teal-600 font-semibold">Sign Out</button>
                           </div>
                       ) : (
                           <button onClick={() => { signIn(); setIsMobileMenuOpen(false); }} className="w-full text-left text-teal-600 font-semibold">Admin Login</button>
                       )}
                    </div>
                </div>
            )}
        </header>
    );
};