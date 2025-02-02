import Image from 'next/image';

export default function BlockSection() {
    return (
        <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl pt-20 mx-auto px-5'>
            <div className='flex flex-col mx-auto text-center w-full col-span-2 space-y-2 max-w-2xl'>
                <h1 className='font-bold text-5xl'>Insert header</h1>
                <p className='text-lg text-black'>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi nesciunt a,
                    provident quaerat similique dolore! Earum, eaque molestiae autem dolor, quos
                    eveniet doloribus magni ullam temporibus eligendi, dolores dignissimos deleniti?
                </p>
            </div>
            <div className='mx-auto'>
                <div className='mt-10'>
                    <div className='space-y-5 md:space-y-0 grid grid-cols-1 lg:grid-cols-3 md:gap-5'>
                        <div className='flex flex-col overflow-hidden bg-gradient-to-br from-purple-100 to-purple-400 rounded-[3rem] h-[32.5rem] md:h-[35rem] py-[3.75rem] items-center'>
                            <div className='px-5 text-black text-center flex'>
                                <div className='flex flex-col space-y-2.5 mx-auto max-w-sm w-full'>
                                    <h1 className='inline text-4xl tracking-tight font-bold'>
                                        Beautiful, and blah blah blah
                                    </h1>
                                    <p className='text-base text-black'>
                                        Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                                        Nisi nesciunt a, provident quaerat similique dolore!
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center mt-5'>
                                <div className='mx-auto max-w-sm w-full px-10 lg:px-0 flex items-center'>
                                    <div className='mx-auto relative'>
                                        <img
                                            alt='Pixel 6 Pro Mockup'
                                            loading='lazy'
                                            width={273}
                                            height={746}
                                            decoding='async'
                                            data-nimg={1}
                                            className='mx-auto'
                                            style={{ color: 'transparent' }}
                                            src='/graphics/mockup-1.webp'
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
                                            Make budgeting <br /> fun again
                                        </p>
                                        <p className='text-base text-black'>
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                            Esse, magnam rerum, necessitatibus quia, aspernatur odit
                                            qui ut quibusdam.
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
                                        <h1 className='inline text-4xl tracking-tight font-bold'>
                                            Something cool.
                                        </h1>
                                        <p className='text-base text-black'>
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                            Esse, magnam rerum, necessitatibus quia, aspernatur odit
                                            qui ut quibusdam.
                                        </p>
                                    </div>
                                </div>
                                {/* <div className='grid grid-cols-8 gap-3 max-w-md w-full mx-auto h-full relative'>
                                    <div className='col-span-4 bg-white bg-opacity-50 backdrop-blur rounded-[2.5rem] items-center justify-center flex overflow-hidden relative'>
                                        <div className='flex flex-col space-y-1 text-black text-center'>
                                            <p className='inline text-4xl xl:text-5xl tracking-tight font-semibold bg-gradient-to-r from-purple-300 to-purple-600 bg-clip-text text-transparent z-10'>
                                                10x
                                            </p>
                                            <p className='inline text-sm'>Some metric</p>
                                        </div>
                                    </div>
                                    <div className='col-span-4 bg-white bg-opacity-50 backdrop-blur rounded-[2.5rem] items-center justify-center flex overflow-hidden relative'>
                                        <div className='flex flex-col space-y-1 text-black text-center'>
                                            <p className='inline text-4xl xl:text-5xl tracking-tight font-semibold bg-gradient-to-r from-purple-300 to-purple-600 bg-clip-text text-transparent z-10'>
                                                3x
                                            </p>
                                            <p className='inline text-sm'>Another metric</p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className='grid grid-rows-6 h-[32.5rem] md:h-[35rem] gap-5'>
                            <div className='row-span-2 flex flex-col overflow-hidden bg-purple-100 rounded-full py-20 items-center justify-center'>
                                <div className='px-5 text-white text-center flex'>
                                    <div className='flex flex-col mx-auto max-w-sm w-full'>
                                        <p className='inline text-6xl tracking-tight font-bold'>
                                            <span className='animate-gradient-x-2000 bg-gradient-to-r from-purple-300 to-purple-600 bg-clip-text text-transparent'>
                                                100%
                                            </span>
                                        </p>
                                        <p className='text-base mt-2.5 text-black'>
                                            Another metric
                                        </p>
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
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='grid grid-cols-5 overflow-hidden border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-300 rounded-[3rem] col-span-full relative backdrop-blur-xl backdrop-opacity-50'>
                            <div className='col-span-full lg:col-span-2 z-10 text-black p-5 flex items-center justify-center'>
                                <div className='flex flex-col p-5 lg:px-10'>
                                    <h1 className='text-4xl tracking-tight font-bold'>
                                        Something cool.
                                    </h1>
                                    <p className='text-base'>
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                        Perspiciatis magnam dicta iste neque atque. Incidunt
                                        commodi, itaque eaque eos quia consectetur quisquam
                                        laboriosam hic ut dolore libero nobis voluptatibus earum.
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
                                        src='/graphics/mockup-1.webp'
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
                                        src='/graphics/mockup-1.webp'
                                        className='shadow-2xl translate-y-[75px]'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
