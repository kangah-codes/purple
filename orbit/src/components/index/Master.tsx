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
                                        d='M19 21V15M16 18H22M22 10H2M22 12V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.0799 19 5.2 19H12'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Keep track of all your accounts - from checking to savings,
                                    mobile wallets, and even cash. All in one place
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
                                        d='M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M13 5V6.5M2 5V17C2 18.1046 4.46243 19 7.5 19M7.5 11C7.33145 11 7.16468 10.9972 7 10.9918C4.19675 10.9 2 10.0433 2 9M7.5 15C4.46243 15 2 14.1046 2 13M22 11.5C22 12.6046 19.5376 13.5 16.5 13.5C13.4624 13.5 11 12.6046 11 11.5M22 11.5C22 10.3954 19.5376 9.5 16.5 9.5C13.4624 9.5 11 10.3954 11 11.5M22 11.5V19C22 20.1046 19.5376 21 16.5 21C13.4624 21 11 20.1046 11 19V11.5M22 15.25C22 16.3546 19.5376 17.25 16.5 17.25C13.4624 17.25 11 16.3546 11 15.25'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Set monthly budgets for categories like groceries,
                                    entertainment, and bills
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
                                        d='M4.99993 13C4.99993 14.6484 5.66466 16.1415 6.74067 17.226C6.84445 17.3305 6.89633 17.3828 6.92696 17.4331C6.95619 17.4811 6.9732 17.5224 6.98625 17.5771C6.99993 17.6343 6.99993 17.6995 6.99993 17.8298V20.2C6.99993 20.48 6.99993 20.62 7.05443 20.727C7.10236 20.8211 7.17885 20.8976 7.27293 20.9455C7.37989 21 7.5199 21 7.79993 21H9.69993C9.97996 21 10.12 21 10.2269 20.9455C10.321 20.8976 10.3975 20.8211 10.4454 20.727C10.4999 20.62 10.4999 20.48 10.4999 20.2V19.8C10.4999 19.52 10.4999 19.38 10.5544 19.273C10.6024 19.1789 10.6789 19.1024 10.7729 19.0545C10.8799 19 11.0199 19 11.2999 19H12.6999C12.98 19 13.12 19 13.2269 19.0545C13.321 19.1024 13.3975 19.1789 13.4454 19.273C13.4999 19.38 13.4999 19.52 13.4999 19.8V20.2C13.4999 20.48 13.4999 20.62 13.5544 20.727C13.6024 20.8211 13.6789 20.8976 13.7729 20.9455C13.8799 21 14.0199 21 14.2999 21H16.2C16.48 21 16.62 21 16.727 20.9455C16.8211 20.8976 16.8976 20.8211 16.9455 20.727C17 20.62 17 20.48 17 20.2V19.2243C17 19.0223 17 18.9212 17.0288 18.8401C17.0563 18.7624 17.0911 18.708 17.15 18.6502C17.2114 18.59 17.3155 18.5417 17.5237 18.445C18.5059 17.989 19.344 17.2751 19.9511 16.3902C20.0579 16.2346 20.1112 16.1568 20.1683 16.1108C20.2228 16.0668 20.2717 16.0411 20.3387 16.021C20.4089 16 20.4922 16 20.6587 16H21.2C21.48 16 21.62 16 21.727 15.9455C21.8211 15.8976 21.8976 15.8211 21.9455 15.727C22 15.62 22 15.48 22 15.2V11.7857C22 11.5192 22 11.3859 21.9505 11.283C21.9013 11.181 21.819 11.0987 21.717 11.0495C21.6141 11 21.4808 11 21.2143 11C21.0213 11 20.9248 11 20.8471 10.9738C20.7633 10.9456 20.7045 10.908 20.6437 10.8438C20.5874 10.7842 20.5413 10.6846 20.4493 10.4855C20.1538 9.84622 19.7492 9.26777 19.2593 8.77404C19.1555 8.66945 19.1036 8.61716 19.073 8.56687C19.0437 8.51889 19.0267 8.47759 19.0137 8.42294C19 8.36567 19 8.30051 19 8.17018V7.06058C19 6.70053 19 6.52051 18.925 6.39951C18.8593 6.29351 18.7564 6.21588 18.6365 6.18184C18.4995 6.14299 18.3264 6.19245 17.9802 6.29136L15.6077 6.96922C15.5673 6.98074 15.5472 6.9865 15.5267 6.99054C15.5085 6.99414 15.4901 6.99671 15.4716 6.99826C15.4508 7 15.4298 7 15.3879 7H14.959M4.99993 13C4.99993 10.6959 6.29864 8.6952 8.20397 7.6899M4.99993 13H4C2.89543 13 2 12.1046 2 11C2 10.2597 2.4022 9.61337 3 9.26756M15 6.5C15 8.433 13.433 10 11.5 10C9.567 10 8 8.433 8 6.5C8 4.567 9.567 3 11.5 3C13.433 3 15 4.567 15 6.5Z'
                                        stroke='#ad46ff'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className='text-[#22201d]'>
                                    Plan for big purchases or emergencies with customizable savings
                                    targets
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
