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
            {/* <div className='absolute top-[30%] left-1/2 h-[1026px] w-[1026px] -translate-x-1/2 stroke-purple-500/70 [mask-image:linear-gradient(to_bottom,white_5%,transparent_60%)] sm:top-[35%] lg:top-[40%] xl:top-[38%]'>
                <svg
                    viewBox='0 0 1026 1026'
                    fill='none'
                    aria-hidden='true'
                    className='absolute inset-0 h-full w-full animate-spin-slow'
                >
                    <path
                        d='M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z'
                        stroke='#E9D5FF'
                        strokeOpacity='0.7'
                    />
                    <path
                        d='M513 1025C230.23 1025 1 795.77 1 513'
                        stroke='url(#:S1:-gradient-1)'
                        strokeLinecap='round'
                    />
                    <defs>
                        <linearGradient
                            id=':S1:-gradient-1'
                            x1={1}
                            y1={513}
                            x2={1}
                            y2={1025}
                            gradientUnits='userSpaceOnUse'
                        >
                            <stop stopColor='#A855F7' />
                            <stop offset={1} stopColor='#A855F7' stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>
                <svg
                    viewBox='0 0 1026 1026'
                    fill='none'
                    aria-hidden='true'
                    className='absolute inset-0 h-full w-full animate-spin-reverse-slower'
                >
                    <path
                        d='M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z'
                        stroke='#E9D5FF'
                        strokeOpacity='0.7'
                    />
                    <path
                        d='M913 513c0 220.914-179.086 400-400 400'
                        stroke='url(#:S1:-gradient-2)'
                        strokeLinecap='round'
                    />
                    <defs>
                        <linearGradient
                            id=':S1:-gradient-2'
                            x1={913}
                            y1={513}
                            x2={913}
                            y2={913}
                            gradientUnits='userSpaceOnUse'
                        >
                            <stop stopColor='#A855F7' />
                            <stop offset={1} stopColor='#A855F7' stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>
            </div> */}

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
                            src='/graphics/pixel-mockup.png'
                            alt='Screenshot 1'
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
