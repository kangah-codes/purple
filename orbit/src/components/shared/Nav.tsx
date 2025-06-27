'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

const navItems = [
    { name: 'Blog', href: '/blog', description: 'Latest updates about Purple' },
    {
        name: 'Changelog',
        href: '/changelog',
        isMobileOnly: true,
        description: `See what's on the roadmap for Purple`,
    },
];

export default function Navbar() {
    return (
        <div className='fixed top-0 left-0 z-[30] w-full md:relative md:bg-purple-400'>
            <header className='mx-auto max-w-7xl px-5 py-5'>
                <div className='relative flex items-center justify-between rounded-full bg-purple-500/50 md:bg-transparent px-2.5 py-2 backdrop-blur-lg'>
                    <Link href='/' className='flex items-center'>
                        <Image
                            src='/logo-white.svg'
                            alt='Purple logo'
                            width={35}
                            height={35}
                            className='rounded-md'
                            priority
                        />
                    </Link>

                    {/* Desktop nav links */}
                    <nav className='hidden md:flex pr-2.5'>
                        <div className='flex items-center space-x-5'>
                            {navItems
                                .filter((item) => !item.isMobileOnly)
                                .map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className='text-base font-bold text-purple-50 transition-colors hover:text-purple-900 hover:shadow-sm'
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                        </div>
                    </nav>

                    {/* Mobile hamburger + dropdown */}
                    <div className='md:hidden'>
                        <Popover>
                            {({ open }) => (
                                <>
                                    <PopoverButton
                                        aria-label={open ? 'Close menu' : 'Open menu'}
                                        className='inline-flex items-center justify-center rounded-full p-2 text-white hover:bg-white/20 focus:outline-none'
                                    >
                                        {open ? (
                                            <svg
                                                className='h-6 w-6'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                fill='none'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M6 18L18 6M6 6l12 12'
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className='h-6 w-6'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                fill='none'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                                                />
                                            </svg>
                                        )}
                                    </PopoverButton>

                                    <PopoverPanel
                                        anchor='bottom'
                                        className={`md:hidden w-full px-5 mt-6 origin-top transform-gpu overflow-hidden
                                            transition-all duration-300 ease-out z-[200] pb-5
                                            ${
                                                open
                                                    ? 'max-h-[500px] scale-100 translate-y-0 opacity-100'
                                                    : 'max-h-0 scale-95 -translate-y-3 opacity-0'
                                            }`}
                                    >
                                        {({ close }) => (
                                            <div className='rounded-3xl bg-purple-400 px-2.5 py-2 shadow-lg backdrop-blur-md border border-purple-300'>
                                                <div className='space-y-2.5'>
                                                    <div className='grid grid-cols-2 gap-2.5'>
                                                        {navItems.map((item, idx) => (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                onClick={
                                                                    close as unknown as () => void
                                                                }
                                                                className='flex flex-col items-start justify-center focus:bg-purple-300/80 rounded-2xl py-2.5 px-3 hover:scale-[1.03]'
                                                            >
                                                                <div
                                                                    className={`block origin-left text-base font-bold text-purple-50 transition delay-[calc(${idx}*50ms)]`}
                                                                >
                                                                    {item.name}
                                                                </div>
                                                                <div
                                                                    className={`block text-sm text-purple-100 transition delay-[calc(${idx}*50ms)]`}
                                                                >
                                                                    {item.description}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    <div className='border-b h-[1px] border-purple-300 w-full' />

                                                    {/* CTA */}
                                                    <div className='pb-0.5'>
                                                        <Link
                                                            href='https://github.com/kangah-codes/purple/releases/latest'
                                                            target='_blank'
                                                            className='relative w-full inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none'
                                                        >
                                                            <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#5d0ec0_50%,#E2CBFF_100%)]' />
                                                            <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-purple-600 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl'>
                                                                Try Purple Today
                                                            </span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </PopoverPanel>
                                </>
                            )}
                        </Popover>
                    </div>
                </div>
            </header>
        </div>
    );
}
