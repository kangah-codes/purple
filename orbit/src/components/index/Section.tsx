import Image from 'next/image';

export default function Section() {
    return (
        <div className='py-20 bg-white w-full'>
            <div className='max-w-4xl lg:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto px-5'>
                <div className='flex flex-col mx-auto text-center w-full col-span-2 space-y-2 max-w-2xl'>
                    <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                        Spend, <span className='text-purple-600'>Responsively</span>
                    </h1>
                    <p className='text-lg text-black'>
                        Take control of your money with a budgeting app that helps you track
                        spending, plan better, and build financial habits that stick.
                    </p>
                </div>
                <div className='px-5 sm:pt-0 mx-auto w-full'>
                    <div className='mt-10'>
                        <dl className='space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 text-black'>
                            <div className='flex flex-col text-center max-w-sm w-full mx-auto h-full border border-transparent'>
                                <div className='flex flex-col items-center h-full justify-between'>
                                    <div className='w-[100px] h-[100px] relative mx-auto'>
                                        <Image
                                            src={'/graphics/watchtower.png'}
                                            alt='Watchtower'
                                            priority
                                            fill
                                            className='w-full h-full top-0 left-0 object-cover'
                                        />
                                    </div>
                                    <div className='flex flex-col justify-start flex-1 mt-4'>
                                        <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                            Watch your spend
                                        </dt>
                                        <dd className='text-base'>
                                            Stay on top of every transaction with real-time insights
                                            and easy to understand spending summaries.
                                        </dd>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col text-center max-w-sm w-full mx-auto h-full border border-transparent'>
                                <div className='flex flex-col items-center h-full justify-between'>
                                    <div className='w-[100px] h-[100px] relative mx-auto'>
                                        <Image
                                            src={'/graphics/envelope.png'}
                                            alt='Envelope'
                                            priority
                                            fill
                                            className='w-full h-full top-0 left-0 object-cover'
                                        />
                                    </div>
                                    <div className='flex flex-col justify-start flex-1 mt-4'>
                                        <div className='flex flex-row space-x-2.5 items-center justify-center'>
                                            <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                                Smart integrations
                                            </dt>
                                            <div className='bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex px-2 py-1 text-white text-xs'>
                                                <p className='my-auto font-bold'>Coming Soon</p>
                                            </div>
                                        </div>
                                        <dd className='text-base'>
                                            Let Purple do the heavy lifting. Your transactions
                                            magically show up, categorised and ready to go.
                                        </dd>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col text-center max-w-sm w-full mx-auto h-full border border-transparent'>
                                <div className='flex flex-col items-center h-full justify-between'>
                                    <div className='w-[100px] h-[100px] relative mx-auto'>
                                        <Image
                                            src={'/graphics/computer-crash.png'}
                                            alt='Computer Crash'
                                            priority
                                            fill
                                            className='w-full h-full top-0 left-0 object-cover'
                                        />
                                    </div>
                                    <div className='flex flex-col justify-start flex-1 mt-4'>
                                        <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                            Budget smarter
                                        </dt>
                                        <dd className='text-base'>
                                            Set monthly limits and track recurring expenses before
                                            you overspend - because smart choices start with better
                                            planning.
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
