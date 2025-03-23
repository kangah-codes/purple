import { StarSVG } from '../shared/SVG';

const freeFeatures = ['Up to 5 accounts', 'Up to 10 plans', '1 recurring transaction'];
const supporterFeatures = [
    'Up to 10 accounts',
    'Unlimited plans',
    'Unlimited recurring transactions',
    'Up to 10 accounts',
    'Unlimited plans',
    'Unlimited recurring transactions',
];

export default function Plans() {
    return (
        <section id='pricing' aria-labelledby='pricing-title' className='pb-20 sm:pb-32'>
            <div className='mx-auto max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl px-4 w-full flex items-center justify-center'>
                <div className='w-full max-w-3xl'>
                    <div className='mx-auto mt-16 grid max-w-sm w-full grid-cols-1 items-start gap-x-8 gap-y-10 sm:mt-20 lg:max-w-none lg:grid-cols-2'>
                        <section className='flex flex-col overflow-hidden rounded-[3rem] p-10 shadow-lg shadow-gray-900/5 bg-purple-50'>
                            <h3 className='flex items-center text-sm font-semibold text-gray-900'>
                                <span className=''>Noob</span>
                            </h3>
                            <h2 className='relative mt-5 flex text-7xl tracking-tight text-gray-900 font-semibold items-end'>
                                $0
                                <span className='text-sm tracking-normal'>/per month</span>
                            </h2>
                            <p className='mt-3 text-sm text-gray-700'>
                                You want a beautiful and functional tool to track your money.
                            </p>
                            <div className='order-last mt-6'>
                                <ul
                                    role='list'
                                    className='-my-2 divide-y text-sm divide-purple-200 text-gray-700'
                                >
                                    {freeFeatures.map((feature, i) => (
                                        <li className='flex py-2 items-center' key={i}>
                                            <StarSVG width={24} height={24} fill='#7015d6' />
                                            <span className='ml-4'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                className={`
                                  inline-flex justify-center rounded-full py-3 px-5 text-sm
                                  font-semibold transition-colors bg-purple-100 text-purple-500
                                  hover:bg-purple-500 mt-6 border border-purple-300 hover:text-white
                                `}
                                color='gray'
                                aria-label='Get started with the Starter plan for [object Object]'
                                href='/register'
                            >
                                Get started for free
                            </a>
                        </section>

                        <section
                            className={`
                              flex flex-col overflow-hidden rounded-[3rem] p-10 shadow-lg shadow-gray-900/5
                              order-first bg-purple-500 lg:order-none
                              animate-gradient-xy
                            `}
                        >
                            <h3 className='flex items-center text-sm font-semibold text-white'>
                                <span className=''>Supporter</span>
                            </h3>
                            <h2 className='relative mt-5 flex text-7xl tracking-tight text-white font-semibold items-end'>
                                $?? <span className='text-sm tracking-normal'>/per month</span>
                            </h2>
                            <p className='mt-3 text-sm text-white'>
                                You want a beautiful and functional tool to track your money and
                                want to support the team.
                            </p>
                            <div className='order-last mt-6'>
                                <ul
                                    role='list'
                                    className='-my-2 divide-y text-sm divide-purple-400 text-white'
                                >
                                    {supporterFeatures.map((feature, i) => (
                                        <li className='flex py-2 items-center' key={i}>
                                            <StarSVG width={24} height={24} fill='#fff' />
                                            <span className='ml-4'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <a
                                className={`
                                  inline-flex justify-center rounded-full py-3 px-5 text-sm
                                  font-semibold transition-colors bg-purple-100 text-purple-500
                                  hover:bg-purple-500 mt-6 border border-purple-300 hover:text-white
                                `}
                                color='gray'
                                aria-label='Get started with the Supporter plan'
                                href='/register'
                            >
                                Get Started
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
}
