export default function Hero() {
    return (
        <div className='relative bg-gradient-to-b from-purple-400 to-white'>
            <section className='mx-auto grid w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl z-[3] relative grid-cols-4 gap-4 px-4 md:grid-cols-12 pb-[24px] pt-[160px] md:pb-8 md:pt-48'>
                <div className='lg:col-span-5 lg:col-start-2 md:col-span-5 md:col-start-2 col-span-4 col-start-1'>
                    <div className='pt space-y-3 md:space-y-4'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold'>
                            What&apos;s new
                        </h1>
                        <p className='text-lg text-black'>
                            We&apos;re always working to make Purple better
                        </p>
                    </div>
                </div>
                <div className='lg:col-span-6 lg:col-start-2 md:col-span-6 md:col-start-2 col-span-4 col-start-1 mt-4 md:mt-12 h-[500px] bg-purple-400 rounded-[3rem]'></div>
                <div className='lg:col-span-5 lg:col-start-8 md:col-span-5 md:col-start-8 col-span-4 col-start-1 -mt-4 space-y-4 max-md:p-6 md:mt-12 md:pl-6'>
                    <p className='as-small text-purple-600'>6th May 2025</p>
                    <h3 className='text-4xl tracking-tight font-bold'>
                        <a href='#'>Spring Release</a>
                    </h3>
                    <div className='pt space-y-3 md:space-y-4'>
                        <p className='text-lg text-black'>
                            Lorem ipsum.Lorem ipsum.Lorem ipsum.Lorem ipsum.Lorem ipsum.Lorem
                            ipsum.Lorem ipsum.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
