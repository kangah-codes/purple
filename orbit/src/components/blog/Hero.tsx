import AnimatedClouds from '../shared/AnimatedClouds';

export default function Hero() {
    return (
        <div className='w-full flex px-5 relative bg-gradient-to-b from-purple-400 to-white py-20 overflow-visible'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={500}
                spawnRate={5}
                className='left-0 right-0 absolute z-[2]'
            />
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-[3] relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col text-center'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold'>
                            From the{' '}
                            <span className='text-gradient bg-gradient-to-br from-purple-500 to-purple-700 animate-gradient-x-2000'>
                                Purple
                            </span>{' '}
                            blog
                        </h1>
                        <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                            <p className='text-lg text-black'>Lorem ipsum</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
