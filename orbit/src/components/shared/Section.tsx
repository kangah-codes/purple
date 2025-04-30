import React from 'react';

interface SectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    reverse?: boolean;
}

export default function Section({ title, description, children, reverse = false }: SectionProps) {
    return (
        <div className='bg-purple-50 w-full overflow-hidden py-20'>
            <div
                className={`
                  max-w-3xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl
                  px-4 w-full grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2 xl:gap-x-16 mx-auto
                `}
            >
                <div
                    className={`relative text-center lg:text-left ${reverse ? 'lg:order-last' : ''}`}
                >
                    <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                        {title}
                    </h1>
                    <p className='text-lg text-black mt-5'>{description}</p>
                </div>

                <div
                    className={`w-full xl:pl-10 grid place-items-center ${reverse ? 'lg:order-first' : ''}`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
