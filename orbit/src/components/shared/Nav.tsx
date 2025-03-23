import Image from 'next/image';
import Link from 'next/link';

export default function Nav() {
    return (
        <div className='absolute z-[99999] w-full'>
            <header className='mx-auto max-w-2xl lg:max-w-7xl p-5 '>
                <div className=''>
                    <div className='relative flex justify-between group/row isolate pt-[calc(--spacing(2)+1px)] last:pb-[calc(--spacing(2)+1px)]'>
                        <div
                            aria-hidden='true'
                            className='absolute inset-y-0 left-1/2 -z-10 w-full -translate-x-1/2'
                        >
                            <div className='absolute inset-x-0 top-0 border-t border-black/5' />
                            <div className='absolute inset-x-0 top-2 border-t border-black/5' />
                            <div className='absolute inset-x-0 bottom-0 hidden border-b border-black/5 group-last/row:block' />
                            <div className='absolute inset-x-0 bottom-2 hidden border-b border-black/5 group-last/row:block' />
                        </div>
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
                                <a
                                    className='flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/[2.5%]'
                                    data-headlessui-state=''
                                    href='/features'
                                >
                                    Features
                                </a>
                            </div>
                            <div className='flex group/item relative'>
                                <a
                                    className='flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/[2.5%]'
                                    data-headlessui-state=''
                                    href='/pricing'
                                >
                                    Pricing
                                </a>
                            </div>
                            <div className='flex group/item relative'>
                                <a
                                    className='flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-hover:bg-black/[2.5%]'
                                    data-headlessui-state=''
                                    href='/about'
                                >
                                    About
                                </a>
                            </div>
                        </nav>
                        <button
                            className='flex size-12 items-center justify-center self-center rounded-lg data-hover:bg-black/5 lg:hidden'
                            aria-label='Open main menu'
                            id='headlessui-disclosure-button-:rl:'
                            type='button'
                            aria-expanded='false'
                            data-headlessui-state=''
                        >
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
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
}
