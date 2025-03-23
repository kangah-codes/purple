import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className='relative'>
                <div className='absolute inset-2 rounded-[3rem] bg-gradient-to-br from-purple-100 to-purple-300 animate-gradient-xy' />
                <div className='px-10 rounded-t-[3rem]'>
                    <div className='mx-auto max-w-2xl lg:max-w-7xl'>
                        <div className='relative pt-20 pb-16 text-center sm:py-24'>
                            <hgroup>
                                <h1 className='mt-5 text-4xl lg:text-5xl font-semibold tracking-tight text-black sm:text-5xl'>
                                    Coming soon to an Android near you
                                </h1>
                            </hgroup>
                            <p className='mx-auto mt-6 max-w-lg text-base text-black'>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos nemo
                                rerum ipsam itaque consectetur corporis incidunt nostrum iure
                                voluptatum autem doloribus porro, maxime aliquam perferendis
                                eligendi ipsa dolorum dolor beatae?
                            </p>
                            <div className='mt-6 flex justify-center'>
                                <div className='flex items-center justify-end flex-row space-x-2 cursor-pointer'>
                                    <div className='bg-gradient-to-br from-purple-800 to-purple-400 animate-gradient-xy rounded-full flex p-[2px] text-white transition duration-500 overflow-hidden'>
                                        <div className='bg-black rounded-full flex px-4 py-2 text-white transition duration-500 text-[12px] 2xl:text-sm'>
                                            <p className='my-auto tracking-tight'>Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='pb-16'>
                            <div className='group/row relative isolate pt-[calc(--spacing(2)+1px)] last:pb-[calc(--spacing(2)+1px)]'>
                                <div
                                    aria-hidden='true'
                                    className='absolute inset-y-0 left-1/2 -z-10 w-full -translate-x-1/2'
                                >
                                    <div className='absolute inset-x-0 top-0 border-t border-black/5' />
                                    <div className='absolute inset-x-0 top-2 border-t border-black/5' />
                                    <div className='absolute inset-x-0 bottom-0 hidden border-b border-black/5 group-last/row:block' />
                                    <div className='absolute inset-x-0 bottom-2 hidden border-b border-black/5 group-last/row:block' />
                                </div>
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
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='/pricing'
                                                    >
                                                        Pricing
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='#'
                                                    >
                                                        Features
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                        {/* <div>
                                            <h3 className='text-sm/6 font-medium text-purple-600'>
                                                Company
                                            </h3>
                                            <ul className='mt-6 space-y-4 text-sm/6'>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'

                                                        href='#'
                                                    >
                                                        Careers
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'

                                                        href='/blog'
                                                    >
                                                        Blog
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'

                                                        href='/company'
                                                    >
                                                        Company
                                                    </a>
                                                </li>
                                            </ul>
                                        </div> */}
                                        {/* <div>
                                            <h3 className='text-sm/6 font-medium text-purple-600'>
                                                Support
                                            </h3>
                                            <ul className='mt-6 space-y-4 text-sm/6'>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'

                                                        href='#'
                                                    >
                                                        Help center
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'

                                                        href='#'
                                                    >
                                                        Community
                                                    </a>
                                                </li>
                                            </ul>
                                        </div> */}
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
                                                        href='#'
                                                    >
                                                        Privacy policy
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className='font-medium text-black data-hover:text-black/75'
                                                        href='#'
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
                                <div
                                    aria-hidden='true'
                                    className='absolute inset-y-0 left-1/2 -z-10 w-full -translate-x-1/2'
                                >
                                    <div className='absolute inset-x-0 top-0 border-t border-black/5' />
                                    <div className='absolute inset-x-0 top-2 border-t border-black/5' />
                                    <div className='absolute inset-x-0 bottom-0 hidden border-b border-black/5 group-last/row:block' />
                                    <div className='absolute inset-x-0 bottom-2 hidden border-b border-black/5 group-last/row:block' />
                                </div>
                                <div>
                                    <div className='py-3 group/item relative'>
                                        <div className='text-sm/6 text-black'>
                                            © {new Date().getFullYear()} Purple
                                        </div>
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div className='flex items-center gap-8 py-3 group/item relative'>
                                        {/* <a
                                            target='_blank'
                                            aria-label='Visit us on Facebook'
                                            className='text-black data-hover:text-black/75'
                                            href='https://facebook.com'
                                        >
                                            <svg
                                                viewBox='0 0 16 16'
                                                fill='currentColor'
                                                className='size-4'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    clipRule='evenodd'
                                                    d='M16 8.05C16 3.603 12.418 0 8 0S0 3.604 0 8.05c0 4.016 2.926 7.346 6.75 7.95v-5.624H4.718V8.05H6.75V6.276c0-2.017 1.194-3.131 3.022-3.131.875 0 1.79.157 1.79.157v1.98h-1.008c-.994 0-1.304.62-1.304 1.257v1.51h2.219l-.355 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.95z'
                                                />
                                            </svg>
                                        </a>
                                        <a
                                            target='_blank'
                                            aria-label='Visit us on X'
                                            className='text-black data-hover:text-black/75'
                                            href='https://x.com'
                                        >
                                            <svg
                                                viewBox='0 0 16 16'
                                                fill='currentColor'
                                                className='size-4'
                                            >
                                                <path d='M12.6 0h2.454l-5.36 6.778L16 16h-4.937l-3.867-5.594L2.771 16H.316l5.733-7.25L0 0h5.063l3.495 5.114L12.6 0zm-.86 14.376h1.36L4.323 1.539H2.865l8.875 12.837z' />
                                            </svg>
                                        </a>
                                        <a
                                            target='_blank'
                                            aria-label='Visit us on LinkedIn'
                                            className='text-black data-hover:text-black/75'
                                            href='https://linkedin.com'
                                        >
                                            <svg
                                                viewBox='0 0 16 16'
                                                fill='currentColor'
                                                className='size-4'
                                            >
                                                <path d='M14.82 0H1.18A1.169 1.169 0 000 1.154v13.694A1.168 1.168 0 001.18 16h13.64A1.17 1.17 0 0016 14.845V1.15A1.171 1.171 0 0014.82 0zM4.744 13.64H2.369V5.996h2.375v7.644zm-1.18-8.684a1.377 1.377 0 11.52-.106 1.377 1.377 0 01-.527.103l.007.003zm10.075 8.683h-2.375V9.921c0-.885-.015-2.025-1.234-2.025-1.218 0-1.425.966-1.425 1.968v3.775H6.233V5.997H8.51v1.05h.032c.317-.601 1.09-1.235 2.246-1.235 2.405-.005 2.851 1.578 2.851 3.63v4.197z' />
                                            </svg>
                                        </a> */}
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
