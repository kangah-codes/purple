export default function Hero() {
    return (
        <div className='w-full flex overflow-hidden px-5 pt-[100px] z-[4]'>
            <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-2 relative'>
                <div className='mx-auto flex flex-col items-center overflow-hidden'>
                    <div className='pt-20 lg:pt-32 pb-12 space-y-5 flex flex-col text-center'>
                        <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold text-center'>
                            Did somebody say{' '}
                            <span className='text-gradient bg-gradient-to-br from-purple-500 to-purple-700 animate-gradient-x-2000'>
                                freeeee
                            </span>
                            ?
                        </h1>
                        <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                            <p className='text-lg text-black'>
                                Purple is a free and open-source Lorem ipsum dolor sit amet
                                consectetur adipisicing elit. Quasi magnam quod ducimus vitae maxime
                                enim laudantium similique dolore officiis, minus sequi deleniti quas
                                ea quia voluptas nam rem maiores quibusdam.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
