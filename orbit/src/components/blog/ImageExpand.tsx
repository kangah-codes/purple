/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export default function ImageExpand({ src, alt }: { src: string; alt: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const openImage = () => {
        setIsOpen(true);
    };

    return (
        <div className='cursor-pointer'>
            <img src={src} alt={alt} onClick={openImage} />
            <Lightbox open={isOpen} close={() => setIsOpen(false)} slides={[{ src }]} />
        </div>
    );
}
