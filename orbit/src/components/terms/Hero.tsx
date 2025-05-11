import AnimatedClouds from '../shared/AnimatedClouds';

export default function Hero({ title, description }: { title: string; description: string }) {
    return (
        <div className='w-full flex overflow-auto px-5 relative bg-gradient-to-b from-purple-400 to-white pt-[59px]'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={300}
                spawnRate={5}
                minScale={0.1}
                maxScale={0.4}
                className='left-0 right-0 absolute'
            />
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-2 relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col text-center'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold text-center'>
                            {title}
                        </h1>
                        <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                            <p className='text-lg text-black'>{description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
