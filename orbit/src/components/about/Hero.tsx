export default function Hero() {
    return (
        <div className='w-full flex overflow-hidden px-5 py-[100px] z-[4]'>
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-2 relative'>
                <div className='mx-auto flex flex-col items-left overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold'>
                            <span>Making every penny count,</span>
                            <br />
                            <span className='text-gradient bg-gradient-to-br from-purple-500 to-purple-700 animate-gradient-x-2000'>
                                one commit at a time.
                            </span>
                        </h1>
                        <div className='space-y-5 flex-col flex max-w-2xl'>
                            <p className='text-lg text-black'>
                                We&apos;re on a mission to lorem ipsum lorem ipsum. We&apos;re on a
                                mission to lorem ipsum lorem ipsum.We&apos;re on a mission to lorem
                                ipsum lorem ipsum.
                            </p>
                        </div>
                    </div>
                </div>

                {/* <div className='absolute bottom-0 w-full overflow-hidden'> */}
                {/* <div className='flex justify-center h-full space-x-5'>
                    <div className='relative w-full h-[300px] lg:w-[400px] lg:h-[400px] '>
                        <Image
                            src='/graphics/mockup-1.webp'
                            alt='Screenshot 1'
                            width={400}
                            height={400}
                            style={{ objectFit: 'cover', objectPosition: 'top' }}
                            className='mx-auto'
                        />
                    </div>
                </div> */}
                {/* </div> */}
            </div>
        </div>
    );
}
