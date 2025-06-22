'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export default function Nav() {
    return (
        <div className='absolute z-[99999] w-full'>
            <header className='mx-auto max-w-2xl lg:max-w-7xl p-5 '>
                <div className='relative flex justify-between'>
                    <div className='relative flex gap-6'>
                        <Link href='/' className='py-3 group/item relative'>
                            <Image
                                alt='Logo'
                                src='/logo-white.svg'
                                width={35}
                                height={35}
                                className='rounded-md'
                            />
                        </Link>
                    </div>
                    <nav className='relative hidden lg:flex'>
                        <div className='flex group/item relative'>
                            <Link
                                className='flex items-center px-5 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/[2.5%]'
                                data-headlessui-state=''
                                href='/blog'
                            >
                                Blog
                            </Link>
                        </div>
                    </nav>
                    <div className='flex size-12 items-center justify-center self-center rounded-lg data-hover:bg-black/5 lg:hidden'>
                        <div className='flex gap-8'>
                            <Popover>
                                <PopoverButton className='block text-sm/6 font-semibold text-black focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-white'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        viewBox='0 0 24 24'
                                        fill='currentColor'
                                        aria-hidden='true'
                                        data-slot='icon'
                                        className='size-6'
                                    >
                                        <path
                                            fillRule='evenodd'
                                            d='M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                </PopoverButton>
                                <PopoverPanel
                                    transition
                                    anchor='bottom'
                                    className={`
                                        mt-5 w-full z-10 px-5 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)]
                                        data-[closed]:-translate-y-1 data-[closed]:opacity-0
                                    `}
                                >
                                    {({ close }) => (
                                        <div
                                            className={`
                                                p-5 bg-gradient-to-br from-purple-50 to-purple-100 divide-y divide-white/5 rounded-[3rem]
                                                h-full w-full z-10 text-sm/6 max-w-2xl lg:max-w-7xl mx-auto
                                              `}
                                        >
                                            <Link
                                                onMouseUp={() => close()}
                                                className='block py-2.5 px-3.5 transition hover:bg-purple-200 rounded-3xl'
                                                href='/blog'
                                            >
                                                <p className='font-bold text-lg text-black'>Blog</p>
                                                <p className='text-black'>
                                                    Stay updated with the lastest information about
                                                    Purple
                                                </p>
                                            </Link>
                                            <Link
                                                onMouseUp={() => close()}
                                                className='block py-2.5 px-3.5 transition hover:bg-purple-200 rounded-3xl'
                                                href='/changelog'
                                            >
                                                <p className='font-bold text-lg text-black'>
                                                    Changelog
                                                </p>
                                                <p className='text-black'>
                                                    Stay updated with the lastest releases of Purple
                                                </p>
                                            </Link>
                                        </div>
                                    )}
                                </PopoverPanel>
                            </Popover>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
