import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className='relative'>
                <div className='absolute inset-5 rounded-[3rem] bg-gradient-to-br from-purple-100 to-purple-300 animate-gradient-xy' />
                <div className='px-10 md:px-20 2xl:px-10 rounded-t-[3rem]'>
                    <div className='mx-auto max-w-2xl lg:max-w-7xl'>
                        <div className='relative pt-20 pb-16 text-center sm:py-24'>
                            <h1 className='mt-5 text-4xl lg:text-5xl font-semibold tracking-tight text-black sm:text-5xl'>
                                Get Purple today
                            </h1>
                            <p className='mx-auto mt-6 max-w-3xl text-base text-black'>
                                Take control of your finances with ease. Purple helps you track,
                                manage, and optimize your spending, all in one place. Start your
                                journey toward smarter money management today!
                            </p>
                            <div className='mt-6 flex justify-center flex-row space-x-2.5'>
                                <Link
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
                                </Link>
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
                                </div>
                            </div>
                            <div className='flex justify-between group/row relative isolate pt-[calc(--spacing(2)+1px)] last:pb-[calc(--spacing(2)+1px)]'>
                                <div className='py-3 group/item relative'>
                                    <div className='text-sm/6 text-black font-semibold'>
                                        © {new Date().getFullYear()} Purple
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
