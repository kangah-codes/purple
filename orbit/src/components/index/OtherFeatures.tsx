import Image from 'next/image';
import Section from '../shared/Section';

export default function OtherFeatures() {
    return (
        <div className='py-20'>
            <Section
                title={
                    <div className='flex flex-col'>
                        <h5 className='inline text-sm font-medium text-purple-600'>TRANSACTIONS</h5>
                        <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                            Penny in, <span className='text-purple-600'>Penny Out</span>
                        </h1>
                    </div>
                }
                description={
                    <ul className='space-y-3 mt-5 text-left'>
                        <li className='flex items-start gap-x-5'>
                            <div className='w-6 h-6 flex-shrink-0 mt-1'>
                                <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M2.50047 13H8.50047M15.5005 13H21.5005M12.0005 7V21M12.0005 7C13.3812 7 14.5005 5.88071 14.5005 4.5M12.0005 7C10.6198 7 9.50047 5.88071 9.50047 4.5M4.00047 21L20.0005 21M4.00047 4.50001L9.50047 4.5M9.50047 4.5C9.50047 3.11929 10.6198 2 12.0005 2C13.3812 2 14.5005 3.11929 14.5005 4.5M14.5005 4.5L20.0005 4.5M8.88091 14.3364C8.48022 15.8706 7.11858 17 5.50047 17C3.88237 17 2.52073 15.8706 2.12004 14.3364C2.0873 14.211 2.07093 14.1483 2.06935 13.8979C2.06838 13.7443 2.12544 13.3904 2.17459 13.2449C2.25478 13.0076 2.34158 12.8737 2.51519 12.6059L5.50047 8L8.48576 12.6059C8.65937 12.8737 8.74617 13.0076 8.82636 13.2449C8.87551 13.3904 8.93257 13.7443 8.9316 13.8979C8.93002 14.1483 8.91365 14.211 8.88091 14.3364ZM21.8809 14.3364C21.4802 15.8706 20.1186 17 18.5005 17C16.8824 17 15.5207 15.8706 15.12 14.3364C15.0873 14.211 15.0709 14.1483 15.0693 13.8979C15.0684 13.7443 15.1254 13.3904 15.1746 13.2449C15.2548 13.0076 15.3416 12.8737 15.5152 12.6059L18.5005 8L21.4858 12.6059C21.6594 12.8737 21.7462 13.0076 21.8264 13.2449C21.8755 13.3904 21.9326 13.7443 21.9316 13.8979C21.93 14.1483 21.9137 14.211 21.8809 14.3364Z'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Stay on top of your finances with a clear view of income,
                                    expenses, and balances across all accounts
                                </p>
                            </div>
                        </li>
                        <li className='flex items-start gap-x-5'>
                            <div className='w-6 h-6 flex-shrink-0 mt-1'>
                                <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M4.5 22V17M4.5 7V2M2 4.5H7M2 19.5H7M13 3L11.2658 7.50886C10.9838 8.24209 10.8428 8.60871 10.6235 8.91709C10.4292 9.1904 10.1904 9.42919 9.91709 9.62353C9.60871 9.8428 9.24209 9.98381 8.50886 10.2658L4 12L8.50886 13.7342C9.24209 14.0162 9.60871 14.1572 9.91709 14.3765C10.1904 14.5708 10.4292 14.8096 10.6235 15.0829C10.8428 15.3913 10.9838 15.7579 11.2658 16.4911L13 21L14.7342 16.4911C15.0162 15.7579 15.1572 15.3913 15.3765 15.0829C15.5708 14.8096 15.8096 14.5708 16.0829 14.3765C16.3913 14.1572 16.7579 14.0162 17.4911 13.7342L22 12L17.4911 10.2658C16.7579 9.98381 16.3913 9.8428 16.0829 9.62353C15.8096 9.42919 15.5708 9.1904 15.3765 8.91709C15.1572 8.60871 15.0162 8.24209 14.7342 7.50886L13 3Z'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div className='flex flex-row space-x-2.5 items-center justify-center'>
                                <p className='text-[#22201d]'>
                                    Automatically record & categorise your transactions, with our
                                    smart integrations{' '}
                                    <span className='inline-block bg-gradient-to-br from-purple-400 to-purple-600 rounded-full px-2 py-1 text-white text-xs'>
                                        <span className='font-bold'>Coming Soon</span>
                                    </span>
                                </p>
                            </div>
                        </li>
                        <li className='flex items-start gap-x-5'>
                            <div className='w-6 h-6 flex-shrink-0 mt-1'>
                                <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M10.101 4C11.3636 2.76281 13.0927 2 15 2C18.866 2 22 5.13401 22 9C22 10.9073 21.2372 12.6365 19.9999 13.899M7.5 13L9 12V17.5M7.5 17.5H10.5M16 15C16 18.866 12.866 22 9 22C5.13401 22 2 18.866 2 15C2 11.134 5.13401 8 9 8C12.866 8 16 11.134 16 15Z'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Set up daily, weekly, or monthly recurring payments so you never
                                    forget your bills or salaries
                                </p>
                            </div>
                        </li>
                    </ul>
                }
            >
                <div className='grid place-items-center w-full xl:pl-10'>
                    <div className='relative w-[276px] h-[600px] overflow-visible mb-6'>
                        <Image
                            alt='Logo'
                            width={276}
                            height={600}
                            decoding='async'
                            data-nimg={1}
                            className='rounded-md z-[2]'
                            style={{ color: 'transparent' }}
                            src='/graphics/screenshots/transaction_screen.png'
                            quality={100}
                        />
                        <div className='absolute bottom-3 w-[276px] h-3 rounded-full bg-purple-900/20 blur-md' />
                    </div>
                </div>
            </Section>
        </div>
    );
}
