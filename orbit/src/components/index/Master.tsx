import Image from 'next/image';

export default function Master() {
    return (
        <div className='bg-purple-50 w-full overflow-hidden py-20'>
            <div className='max-w-3xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl px-4 w-full grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2 xl:gap-x-16 mx-auto'>
                <div className='relative text-center lg:text-left'>
                    <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                        Master your <span className='text-purple-600'>money</span>
                    </h1>
                    <p className='text-lg text-black mt-5'>
                        Feel good about every penny you spend. Whether it’s keeping track of bills
                        or saving up for something big, you&apos;re in control. No stress, just
                        simple tools to help you stay on top of your money and build the future you
                        want.
                    </p>
                </div>
                <div className='w-full xl:pl-10 grid place-items-center'>
                    <div className='flex items-center justify-center flex-row space-x-10 mx-auto w-full relative h-[600]'>
                        <Image
                            alt='Logo'
                            width={276}
                            height={600}
                            decoding='async'
                            data-nimg={1}
                            className='rounded-md z-[2]'
                            style={{ color: 'transparent' }}
                            src='/graphics/stats_screen.png'
                        />
                        <Image
                            alt='Logo'
                            width={276}
                            height={600}
                            decoding='async'
                            data-nimg={1}
                            className='rounded-md z-[2]'
                            style={{ color: 'transparent' }}
                            src='/graphics/new_transaction_screen.png'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
