import React from 'react';

interface SectionProps {
    title: React.ReactNode;
    description: React.ReactNode;
    children: React.ReactNode;
    reverse?: boolean;
}

export default function Section({ title, description, children, reverse = false }: SectionProps) {
    return (
        <div className='w-full overflow-hidden'>
            <div
                className={`
                  max-w-3xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl
                  px-5 w-full grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2 xl:gap-x-16 mx-auto
                `}
            >
                <div
                    className={`relative text-center lg:text-left xl:pl-10 ${reverse ? 'lg:order-last' : ''}`}
                >
                    <div>{title}</div>
                    <div>{description}</div>
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
