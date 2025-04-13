import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Nav from '@/components/shared/Nav';
import Footer from '@/components/shared/Footer';
import { Analytics } from '@vercel/analytics/react';

const satoshi = localFont({
    src: '../../public/fonts/satoshi/Satoshi-Variable.woff2',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Purple | Making Budgeting Easy',
    description:
        'Take control of your money without the stress. Purple makes budgeting simple, fun, and easy to stick with',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <head>
                <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
                <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
            </head>
            <body className={`${satoshi.className} antialiased relative`}>
                <Analytics />
                <Nav />
                {children}
                <Footer />
            </body>
        </html>
    );
}
