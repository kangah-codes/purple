import AnimatedClouds from './AnimatedClouds';

export default function Hero() {
    return (
        <div className='w-full flex overflow-hidden px-4 relative bg-gradient-to-b from-purple-400 to-white min-h-screen'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={650}
                className='left-0 right-0'
            />
            <div className='w-full max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-2 relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='py-48 space-y-5 flex flex-col text-center'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold text-center'>
                            <span>The budgeting platform</span>
                            <br />
                            <span className='text-gradient bg-gradient-to-br from-purple-500 to-purple-700 animate-gradient-x'>
                                you&apos;ve been waiting for
                            </span>
                        </h1>
                        <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                            <p className='text-lg text-insurerity-text-gray'>
                                Revolutionizing the way you budget your money. Get started today and
                                take control of your finances.
                            </p>
                            <div className='flex items-center justify-end flex-row space-x-2 cursor-pointer'>
                                <div className='bg-gradient-to-br from-purple-800 to-purple-400 animate-gradient-xy rounded-full flex p-[2px] text-white transition duration-500 overflow-hidden'>
                                    <div className='bg-black rounded-full flex px-4 py-2 text-white transition duration-500 text-[12px] 2xl:text-sm'>
                                        <p className='my-auto tracking-tight'>Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
