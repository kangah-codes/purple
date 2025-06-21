import Image from 'next/image';

export default function BlockSection() {
    return (
        <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl pt-20 pb-[60px] mx-auto px-5'>
            <div className='mx-auto'>
                <div className='space-y-5 md:space-y-0 grid grid-cols-1 lg:grid-cols-3 md:gap-5'>
                    <div className='flex flex-col overflow-hidden bg-gradient-to-br from-purple-100 to-purple-400 rounded-[3rem] h-[32.5rem] md:h-[35rem] py-[3.75rem] items-center'>
                        <div className='px-5 text-black text-center flex'>
                            <div className='flex flex-col space-y-2.5 mx-auto max-w-sm w-full'>
                                <h1 className='inline text-4xl tracking-tight font-bold'>
                                    Slick design, serious power
                                </h1>
                                <p className='text-base text-black'>
                                    Manage your finances without compromising on style.
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center mt-5'>
                            <div className='mx-auto max-w-sm w-full px-10 lg:px-0 flex items-center'>
                                <div className='mx-auto relative'>
                                    <Image
                                        alt='Pixel 9 Pro Mockup'
                                        width={273}
                                        height={746}
                                        decoding='async'
                                        data-nimg={1}
                                        className='mx-auto'
                                        src='/graphics/stats_screen_3.png'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-rows-6 h-[32.5rem] md:h-[35rem] gap-5'>
                        <div className='row-span-3 flex flex-col overflow-hidden bg-purple-100 border border-purple-100 rounded-[3rem] py-20 items-center justify-center'>
                            <div className='px-5 text-black text-center flex'>
                                <div className='flex flex-col mx-auto max-w-sm w-full space-y-2.5'>
                                    <p className='inline text-4xl tracking-tight font-bold'>
                                        Budgeting you&apos;ll <br /> actually enjoy
                                    </p>
                                    <p className='text-base text-black'>
                                        Track, plan, and enjoy your money without the spreadsheets.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='relative row-span-3 flex flex-col space-y-5 overflow-hidden border border-purple-100 bg-gradient-to-b from-purple-300 to-purple-50 rounded-[3rem] p-5 items-center justify-center'>
                            {/* clouds */}
                            <div className='z-0'>
                                <div className='w-[50px] h-[25px] absolute top-5 left-5'>
                                    <Image
                                        src={'/graphics/cloud-1.svg'}
                                        width={300}
                                        height={100}
                                        alt='Cloud'
                                        priority
                                    />
                                </div>
                                <div className='w-[50px] h-[25px] absolute top-7.5 right-5'>
                                    <Image
                                        src={'/graphics/cloud-2.svg'}
                                        width={300}
                                        height={100}
                                        alt='Cloud'
                                        priority
                                    />
                                </div>
                                <div className='w-[50px] h-[25px] absolute top-2.5 right-1/3 opacity-60'>
                                    <Image
                                        src={'/graphics/cloud-3.svg'}
                                        width={300}
                                        height={100}
                                        alt='Cloud'
                                        priority
                                    />
                                </div>
                                <div className='w-[50px] h-[25px] absolute top-4.5 right-[60%] opacity-80'>
                                    <Image
                                        src={'/graphics/cloud-4.svg'}
                                        width={300}
                                        height={100}
                                        alt='Cloud'
                                        priority
                                    />
                                </div>
                            </div>

                            <div className='text-black text-center flex z-[1]'>
                                <div className='flex flex-col mx-auto max-w-sm w-full space-y-2.5'>
                                    <h1 className='inline text-3xl lg:text-4xl tracking-tight font-bold'>
                                        Your financial cloud nine
                                    </h1>
                                    <p className='text-base text-black'>
                                        Your transactions are tracked, sorted, and served with a
                                        side of clarity. It’s budgeting, but without the stress,
                                        spreadsheets, or second-guessing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-rows-6 h-[32.5rem] md:h-[35rem] gap-5'>
                        <div className='row-span-2 flex flex-col overflow-hidden bg-purple-100 rounded-full py-20 items-center justify-center'>
                            <div className='px-5 text-white text-center flex'>
                                <div className='flex flex-col mx-auto max-w-sm w-full'>
                                    <h1 className='inline text-6xl tracking-tight font-bold'>
                                        <span className='animate-gradient-x-2000 bg-gradient-to-r from-purple-300 to-purple-600 bg-clip-text text-transparent'>
                                            100%
                                        </span>
                                    </h1>
                                    <p className='text-base mt-2.5 text-black'>Open Source</p>
                                </div>
                            </div>
                        </div>
                        <div className='relative row-span-4 overflow-hidden rounded-[3rem] items-center border border-purple-100 bg-gradient-to-b from-purple-300 to-white'>
                            <div className='z-[2] h-full w-full flex items-center justify-center'>
                                <Image
                                    alt='Logo'
                                    objectFit='cover'
                                    fill
                                    src='/graphics/masonry.png'
                                    quality={100}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-5 overflow-hidden border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-300 rounded-[3rem] col-span-full relative backdrop-blur-xl backdrop-opacity-50'>
                        <div className='col-span-full lg:col-span-2 z-10 text-black p-5 flex items-center justify-center'>
                            <div className='flex flex-col p-5 lg:px-10 space-y-2.5'>
                                <h1 className='text-3xl lg:text-4xl tracking-tight font-bold'>
                                    Everything where it belongs
                                </h1>
                                <p className='text-base'>
                                    Life’s messy. Your money doesn’t have to be. Purple tidies up
                                    your transactions so you can actually enjoy checking in on your
                                    money.
                                </p>
                            </div>
                        </div>

                        <div className='hidden lg:grid grid-cols-2 gap-x-2.5 transform rotate-[30deg] col-span-3'>
                            <div className='col-span-1 transform rotate-180'>
                                <Image
                                    alt='Logo'
                                    loading='lazy'
                                    width={276}
                                    height={600}
                                    decoding='async'
                                    data-nimg={1}
                                    style={{ color: 'transparent' }}
                                    src='/graphics/transaction_modal.png'
                                    className='translate-y-[125px] shadow-2xl'
                                />
                            </div>

                            <div className='col-span-1'>
                                <Image
                                    alt='Logo'
                                    loading='lazy'
                                    width={276}
                                    height={600}
                                    decoding='async'
                                    src='/graphics/accounts_screen.png'
                                    className='shadow-2xl translate-y-[75px]'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
