import Image from 'next/image';
import AnimatedRain from '../shared/AnimatedRain';

export default function Rain() {
    return (
        <div className='bg-purple-50 w-screen overflow-hidden py-20'>
            <div className='max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl px-4 w-full grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2 xl:gap-x-16 mx-auto'>
                <div className='relative'>
                    <div className='relative'>
                        <h1 className='inline text-5xl tracking-tight font-bold'>
                            For the <span className='text-purple-600'>purple rain</span>y days
                        </h1>
                        <p className='text-lg text-black mt-5'>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi nesciunt
                            a, provident quaerat similique dolore! Earum, eaque molestiae autem
                            dolor, quos eveniet doloribus magni ullam temporibus eligendi, dolores
                            dignissimos deleniti?
                        </p>
                    </div>
                </div>
                <div className='w-full xl:pl-10 grid place-items-center'>
                    <div className='h-[600px] w-full rounded-3xl relative overflow-hidden bg-gradient-to-b from-purple-100 to-purple-300'>
                        <div className='w-[200px] h-[200px] absolute top-0 right-5 opacity-45'>
                            <Image
                                src={'/graphics/cloud-2.svg'}
                                width={300}
                                height={100}
                                alt='Cloud'
                                priority
                            />
                        </div>
                        <div className='w-[200px] h-[200px] absolute top-10 left-5 opacity-35'>
                            <Image
                                src={'/graphics/cloud-1.svg'}
                                width={300}
                                height={100}
                                alt='Cloud'
                                priority
                            />
                        </div>
                        <div className='absolute w-full h-full'>
                            <AnimatedRain />
                        </div>
                        <div className='flex items-center justify-center absolute top-1/2 mx-auto w-full'>
                            <img
                                alt='Logo'
                                loading='lazy'
                                width={276}
                                height={600}
                                decoding='async'
                                data-nimg={1}
                                className='rounded-md z-[2]'
                                style={{ color: 'transparent' }}
                                src='/graphics/mockup-1.webp'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
