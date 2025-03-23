export default function Plans() {
    return (
        <section id='pricing' aria-labelledby='pricing-title' className='pb-20 sm:pb-32'>
            <div className='mx-auto max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl px-4 w-full flex items-center justify-center'>
                <div className='w-full max-w-3xl'>
                    <div className='mx-auto mt-16 grid max-w-sm w-full grid-cols-1 items-start gap-x-8 gap-y-10 sm:mt-20 lg:max-w-none lg:grid-cols-2'>
                        <section className='flex flex-col overflow-hidden rounded-[3rem] p-10 shadow-lg shadow-gray-900/5 bg-purple-50'>
                            <h3 className='flex items-center text-sm font-semibold text-gray-900'>
                                <span className=''>Starter</span>
                            </h3>
                            <h2 className='relative mt-5 flex text-7xl tracking-tight text-gray-900 font-semibold'>
                                $0
                            </h2>
                            <p className='mt-3 text-sm text-gray-700'>
                                You’re new to investing but want to do it right. Get started for
                                free.
                            </p>
                            <div className='order-last mt-6'>
                                <ul
                                    role='list'
                                    className='-my-2 divide-y text-sm divide-gray-200 text-gray-700'
                                >
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-cyan-500'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Commission-free trading</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-cyan-500'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Multi-layered encryption</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-cyan-500'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>One tip every day</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-cyan-500'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Invest up to $1,500 each month</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                className={`
                                  inline-flex justify-center rounded-full py-3 px-5 text-sm
                                  font-semibold transition-colors bg-purple-100 text-white
                                  hover:bg-purple-500 mt-6 border border-purple-300
                                `}
                                color='gray'
                                aria-label='Get started with the Starter plan for [object Object]'
                                variant='solid'
                                href='/register'
                            >
                                Get started for free
                            </a>
                        </section>

                        <section className='flex flex-col overflow-hidden rounded-[3rem] p-10 shadow-lg shadow-gray-900/5 order-first bg-gray-900 lg:order-none'>
                            <h3 className='flex items-center text-sm font-semibold text-white'>
                                <svg
                                    viewBox='0 0 40 40'
                                    aria-hidden='true'
                                    className='h-6 w-6 flex-none fill-cyan-500'
                                >
                                    <path
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                        d='M20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20ZM4 20c0 7.264 5.163 13.321 12.02 14.704C17.642 35.03 19 33.657 19 32V8c0-1.657-1.357-3.031-2.98-2.704C9.162 6.68 4 12.736 4 20Z'
                                    />
                                </svg>
                                <span className='ml-4'>VIP</span>
                            </h3>
                            <p className='relative mt-5 flex text-3xl tracking-tight text-white'>
                                <span aria-hidden='false' className='transition duration-300'>
                                    $199
                                </span>
                                <span
                                    aria-hidden='true'
                                    className='absolute top-0 left-0 transition duration-300 pointer-events-none -translate-x-6 opacity-0 select-none'
                                >
                                    $1,990
                                </span>
                            </p>
                            <p className='mt-3 text-sm text-gray-300'>
                                You’ve got a huge amount of assets but it’s not enough. To the moon.
                            </p>
                            <div className='order-last mt-6'>
                                <ul
                                    role='list'
                                    className='-my-2 divide-y text-sm divide-gray-800 text-gray-300'
                                >
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Commission-free trading</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Multi-layered encryption</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Real-time tip notifications</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>No investment limits</span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>
                                            Advanced transaction anonymization
                                        </span>
                                    </li>
                                    <li className='flex py-2'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            aria-hidden='true'
                                            className='h-6 w-6 flex-none text-white'
                                        >
                                            <path
                                                d='M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z'
                                                fill='currentColor'
                                            />
                                            <circle
                                                cx={12}
                                                cy={12}
                                                r='8.25'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='1.5'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        <span className='ml-4'>Automated tax-loss harvesting</span>
                                    </li>
                                </ul>
                            </div>
                            <a
                                className='inline-flex justify-center rounded-lg py-2 px-3 text-sm font-semibold transition-colors relative overflow-hidden bg-cyan-500 text-white before:absolute before:inset-0 active:before:bg-transparent hover:before:bg-white/10 active:bg-cyan-600 active:text-white/80 before:transition-colors mt-6'
                                color='cyan'
                                aria-label='Get started with the VIP plan for [object Object]'
                                variant='solid'
                                href='/register'
                            >
                                Subscribe
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
}
