import AnimatedClouds from '../shared/AnimatedClouds';
import Image from 'next/image';

export default function Hero() {
    return (
        <div className='w-full flex overflow-hidden px-5 relative bg-gradient-to-b from-purple-400 to-white min-h-screen pt-[59px]'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={650}
                spawnRate={5}
                className='left-0 right-0 absolute z-[2]'
            />
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-[3] relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col text-center'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold text-center'>
                            <span>Oh hey, it&apos;s</span>
                            <br />
                            <span className='text-gradient bg-gradient-to-br from-purple-500 to-purple-700 animate-gradient-x-2000'>
                                Purple
                            </span>
                        </h1>
                        <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                            <p className='text-lg text-black'>
                                Take control of your money without the stress. Purple makes
                                budgeting simple, fun, and easy to stick with.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex justify-center h-full space-x-5 relative'>
                    <div className='relative w-full h-[300px] lg:w-[400px] lg:h-[400px]'>
                        <Image
                            src='/graphics/home_screen_1.png'
                            alt='Purple Home Screen'
                            width={400}
                            height={400}
                            style={{ objectFit: 'cover', objectPosition: 'top' }}
                            className='mx-auto'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
