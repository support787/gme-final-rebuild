"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    authDomain: "grand-medical-website.firebaseapp.com",
    projectId: "grand-medical-website",
    storageBucket: "grand-medical-website.appspot.com",
    messagingSenderId: "799272313892",
    appId: "1:799272313892:web:6dd4ee226cb9e791e524b1",
    measurementId: "G-HK1ZM18JET"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
}
const auth = getAuth(app);

const Header = ({ user, isAdmin, handleSignIn, handleSignOut }) => {
    const svgStrokeColor = '#0D9488'; 
    const svgFillColor = '#FBBF24';

    return (
        <header className="absolute top-0 left-0 right-0 z-50 bg-transparent text-white">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                    <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M163 100C163 137.647 132.647 168 95 168C57.353 168 27 137.647 27 100C27 62.353 57.353 32 95 32C121.42 32 144.353 47.391 155.41 68" stroke={svgStrokeColor} strokeWidth="22" strokeLinecap="round"/>
                        <path d="M125 100H163" stroke={svgStrokeColor} strokeWidth="22" strokeLinecap="round"/>
                        <path d="M95 32C80.203 48.031 73 69.5 73 100C73 130.5 80.203 151.969 95 168" stroke={svgFillColor} strokeWidth="12" strokeLinecap="round"/>
                    </svg>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold leading-tight">GRAND</span>
                        <span className="text-xs font-semibold tracking-wider leading-tight">Medical Equipment, Inc.</span>
                    </div>
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    <a className="cursor-pointer pb-1 font-bold border-b-2 border-white">Home</a>
                    <a className="cursor-pointer pb-1 hover:text-gray-200">Systems</a>
                    <a className="cursor-pointer pb-1 hover:text-gray-200">Parts</a>
                    <a className="cursor-pointer pb-1 hover:text-gray-200">About Us</a>
                    <a className="cursor-pointer pb-1 hover:text-gray-200">Contact Us</a>
                    <div className="flex items-center space-x-4 pl-4 border-l border-gray-200/50">
                       {user ? (
                            <>
                             <span className="text-sm font-medium">{isAdmin ? 'Admin:' : ''} {user.displayName}</span>
                             <button onClick={handleSignOut} className="text-sm font-semibold hover:underline">Sign Out</button>
                            </>
                       ) : (
                            <button onClick={handleSignIn} className="text-sm font-semibold hover:underline">Admin Login</button>
                       )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 text-center">
            <p>&copy; {new Date().getFullYear()} Grand Medical Equipment. All Rights Reserved.</p>
        </div>
    </footer>
);


export default function ClientLayout({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const adminList = useMemo(() => ['support@grandmedicalequipment.com'], []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setIsAdmin(adminList.includes(currentUser.email));
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, [adminList]);
    
    const handleSignIn = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Sign-in error", error);
        }
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut(auth);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
          <Header user={user} isAdmin={isAdmin} handleSignIn={handleSignIn} handleSignOut={handleSignOut} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
    );
}



