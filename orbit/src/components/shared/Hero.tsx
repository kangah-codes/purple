export default function Hero({ title, description }: { title: string; description: string }) {
    return (
        <>
            <div className='w-full flex pt-[59px] z-1 relative'>
                <div className='bg-gradient-to-b from-purple-400 to-white absolute top-0 w-full h-[500px]' />
                <div className='w-full max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto z-2 relative px-5'>
                    <div className='mx-auto flex flex-col items-center overflow-hidden z-10'>
                        <div className='pt-20 pb-12 space-y-5 flex flex-col text-center'>
                            <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold text-center'>
                                {title}
                            </h1>
                            <div className='space-y-5 flex flex-col items-center justify-center max-w-2xl mx-auto'>
                                <p className='text-base text-black'>{description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
