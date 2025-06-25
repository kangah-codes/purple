import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className='relative'>
                <div className='absolute inset-5 rounded-[3rem] bg-gradient-to-br from-purple-300 via-purple-200 to-purple-300' />
                <div className='px-10 md:px-20 2xl:px-10'>
                    <div className='mx-auto max-w-2xl lg:max-w-7xl'>
                        <div className='relative text-center py-24'>
                            <div className='flex flex-row space-x-2 items-center justify-center mt-5'>
                                <h1 className='text-4xl lg:text-5xl font-semibold tracking-tight text-black sm:text-5xl'>
                                    Try Purple today{' '}
                                </h1>
                                <span className='relative inline-flex overflow-hidden rounded-full p-[1px] focus:outline-none'>
                                    <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#5d0ec0_50%,#E2CBFF_100%)]' />
                                    <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-purple-600 px-3 py-1 text-xs font-medium text-white backdrop-blur-3xl'>
                                        Beta
                                    </span>
                                </span>
                            </div>
                            <p className='mx-auto mt-6 max-w-3xl text-base text-black'>
                                Take control of your finances with ease. Purple helps you track,
                                manage, and optimize your spending, all in one place. Start your
                                journey toward smarter money management today!
                            </p>
                            <div className='mt-6 flex justify-center flex-row space-x-2.5'>
                                {/* <Link
                                    target='_blank'
                                    href='https://google.com'
                                    className='flex items-center justify-end flex-row space-x-2 cursor-pointer h-[40px]'
                                >
                                    <Image
                                        src='/graphics/play-store-badge.png'
                                        alt='Play Store Badge'
                                        width={130}
                                        height={40}
                                        style={{
                                            objectFit: 'contain',
                                            width: 'auto',
                                        }}
                                        className='mx-auto h-full'
                                    />
                                </Link> */}
                                <Link
                                    target='_blank'
                                    href='https://github.com/kangah-codes/purple/releases/latest'
                                    className='flex items-center justify-end flex-row space-x-2 cursor-pointer h-[40px]'
                                >
                                    <Image
                                        src='/graphics/github-badge.svg'
                                        alt='Github Badge'
                                        width={130}
                                        height={40}
                                        style={{
                                            objectFit: 'contain',
                                            width: 'auto',
                                        }}
                                        className='mx-auto h-full'
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className='pb-16'>
                            <div className='group/row relative isolate pt-[calc(--spacing(2)+1px)] last:pb-[calc(--spacing(2)+1px)]'>
                                <div className='grid grid-cols-2 gap-y-10 py-5 lg:grid-cols-9 lg:gap-8'>
                                    <div className='col-span-6 flex'>
                                        <div className='pt-6 lg:pb-6 group/item relative'>
                                            <Image
                                                alt='Logo'
                                                src='/logo.svg'
                                                width={35}
                                                height={35}
                                                className='rounded-md'
                                            />
                                        </div>
                                    </div>
                                    <div className='col-span-2 grid grid-cols-2 gap-x-8 gap-y-12 lg:col-span-3 lg:grid-cols-2 lg:pt-6'>
                                        <div>
                                            <h3 className='text-sm/6 font-medium text-purple-600'>
                                                Purple
                                            </h3>
                                            <ul className='mt-6 space-y-4 text-sm/6'>
                                                <li>
                                                    <Link
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/blog'
                                                    >
                                                        Blog
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/changelog'
                                                    >
                                                        Changelog
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/roadmap'
                                                    >
                                                        Roadmap
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className='text-sm/6 font-medium text-purple-600'>
                                                Legal
                                            </h3>
                                            <ul className='mt-6 space-y-4 text-sm/6'>
                                                <li>
                                                    <Link
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/terms'
                                                    >
                                                        Terms of service
                                                    </Link>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/privacy'
                                                    >
                                                        Privacy policy
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/license'
                                                    >
                                                        License
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className='col-span-full'>
                                        <div className='text-sm flex flex-col mt-8 space-y-1 z-10 font-semibold'>
                                            <p className='text-black'>
                                                All visuals and illustrations shown are for
                                                demonstration purposes only and may not reflect
                                                actual financial data or user experiences.
                                            </p>
                                            <p className='text-black'>
                                                Use of Purple and its services is subject to our{' '}
                                                <a
                                                    className='text-purple-500 hover:text-purple-500 pb-1 transition duration-300'
                                                    href='/terms'
                                                >
                                                    Terms of Service
                                                </a>{' '}
                                                and{' '}
                                                <a
                                                    className='text-purple-500 hover:text-purple-500 pb-1 transition duration-300'
                                                    href='/privacy'
                                                >
                                                    Privacy Policy
                                                </a>
                                                .
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-between group/row relative isolate pt-[calc(--spacing(2)+1px)] last:pb-[calc(--spacing(2)+1px)]'>
                                <div className='group/item relative'>
                                    <div className='text-sm/6 text-black font-semibold'>
                                        © {new Date().getFullYear()} Purple
                                    </div>
                                </div>

                                <div className='group/item relative flex flex-row space-x-2.5'>
                                    <Link
                                        target='_blank'
                                        href={'https://github.com/kangah-codes/purple'}
                                    >
                                        <Image
                                            src='/graphics/github-logo.svg'
                                            alt='GitHub Logo'
                                            width={20}
                                            height={20}
                                            className='inline-block'
                                        />
                                    </Link>
                                    <Link
                                        target='_blank'
                                        href={'https://linkedin.com/in/akangah89/'}
                                    >
                                        <Image
                                            src='/graphics/linkedin-logo.png'
                                            alt='GitHub Logo'
                                            width={20}
                                            height={20}
                                            className='inline-block'
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
