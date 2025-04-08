import Image from 'next/image';

export default function Section() {
    return (
        <div className='py-20 bg-white w-full'>
            <div className='max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto px-5'>
                <div className='flex flex-col mx-auto text-center w-full col-span-2 space-y-2 max-w-2xl'>
                    <h1 className='font-semibold text-4xl lg:text-5xl'>
                        Spend, <span className='text-purple-600'>Responsively</span>
                    </h1>
                    <p className='text-lg text-black'>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi nesciunt a,
                        provident quaerat similique dolore! Earum, eaque molestiae autem dolor, quos
                        eveniet doloribus magni ullam temporibus eligendi, dolores dignissimos
                        deleniti?
                    </p>
                </div>
                <div className='px-5 sm:pt-0 mx-auto max-w-5xl'>
                    <div className='mt-10'>
                        <dl className='space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 text-black'>
                            <div className='flex items-center justify-center flex-col text-center max-w-sm mx-auto'>
                                <div className='w-[100px] h-[100px] relative'>
                                    <Image
                                        src={'/graphics/watchtower.png'}
                                        alt='Watchtower'
                                        priority
                                        fill
                                        className='w-full h-full top-0 left-0 object-cover'
                                    />
                                </div>
                                <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                    Watch your spend
                                </dt>
                                <dd className='text-base'>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi
                                    nesciunt a, provident quaerat similique dolore!
                                </dd>
                            </div>
                            <div className='flex items-center justify-center flex-col text-center max-w-sm mx-auto'>
                                <div className='w-[100px] h-[100px] relative'>
                                    <Image
                                        src={'/graphics/pos.png'}
                                        alt='Watchtower'
                                        priority
                                        fill
                                        className='w-full h-full top-0 left-0 object-cover'
                                    />
                                </div>
                                <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                    Integrations
                                </dt>
                                <dd className='text-base'>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi
                                    nesciunt a, provident quaerat similique dolore!
                                </dd>
                            </div>
                            <div className='flex items-center justify-center flex-col text-center max-w-sm mx-auto'>
                                <div className='w-[100px] h-[100px] relative'>
                                    <Image
                                        src={'/graphics/computer-crash.png'}
                                        alt='Watchtower'
                                        priority
                                        fill
                                        className='w-full h-full top-0 left-0 object-cover'
                                    />
                                </div>
                                <dt className='text-2xl pt-2 leading-6 text-gray-800 font-semibold mb-2'>
                                    Budget smarter
                                </dt>
                                <dd className='text-base'>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi
                                    nesciunt a, provident quaerat similique dolore!
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
