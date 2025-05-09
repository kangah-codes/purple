import Image from 'next/image';
import Section from '../shared/Section';

export default function Master() {
    return (
        <div className='bg-purple-50 py-20'>
            <Section
                title={
                    <div className='flex flex-col'>
                        <h5 className='inline text-sm font-medium text-purple-600'>ACCOUNTS</h5>
                        <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                            Master your <span className='text-purple-600'>money</span>
                        </h1>
                    </div>
                }
                reverse
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
                                    expenses, and balances—across all accounts.
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
                                        d='M7 9.50006L2 12.0001L11.6422 16.8212C11.7734 16.8868 11.839 16.9196 11.9078 16.9325C11.9687 16.9439 12.0313 16.9439 12.0922 16.9325C12.161 16.9196 12.2266 16.8868 12.3578 16.8212L22 12.0001L17 9.50006M7 14.5001L2 17.0001L11.6422 21.8212C11.7734 21.8868 11.839 21.9196 11.9078 21.9325C11.9687 21.9439 12.0313 21.9439 12.0922 21.9325C12.161 21.9196 12.2266 21.8868 12.3578 21.8212L22 17.0001L17 14.5001M2 7.00006L11.6422 2.17895C11.7734 2.11336 11.839 2.08056 11.9078 2.06766C11.9687 2.05622 12.0313 2.05622 12.0922 2.06766C12.161 2.08056 12.2266 2.11336 12.3578 2.17895L22 7.00006L12.3578 11.8212C12.2266 11.8868 12.161 11.9196 12.0922 11.9325C12.0313 11.9439 11.9687 11.9439 11.9078 11.9325C11.839 11.9196 11.7734 11.8868 11.6422 11.8212L2 7.00006Z'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Purple automatically categorizes your transactions to give you
                                    smart, actionable insights.
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
                                    Swipe to quickly review or edit transactions as they come in.
                                </p>
                            </div>
                        </li>
                    </ul>
                }
            >
                <div className='w-full xl:pl-10 grid place-items-center'>
                    <div className='flex items-center justify-center flex-row space-x-10 mx-auto w-full relative h-[600]'>
                        <Image
                            alt='Logo'
                            width={276}
                            height={600}
                            decoding='async'
                            data-nimg={1}
                            className='rounded-md z-[2]'
                            style={{ color: 'transparent' }}
                            src='/graphics/account_screen.png'
                        />
                    </div>
                </div>
            </Section>
        </div>
    );
}
