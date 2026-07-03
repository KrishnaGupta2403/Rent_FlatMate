import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';

export const metadata = {
  title: 'RentFlatmate AI | Enterprise Matchmaking & Real-time Chat',
  description: 'AI-powered compatibility matching and real-time Socket.IO communication for tenants and property owners.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main className="page-wrapper container">
              {children}
            </main>
            <Footer />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
