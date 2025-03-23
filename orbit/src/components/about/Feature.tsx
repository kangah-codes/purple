import Image from 'next/image';
import { StarSVG } from '../shared/SVG';

export default function Feature() {
    return (
        <div className='w-full overflow-hidden py-20 px-5'>
            <div className='max-w-xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-screen-xl 3xl:max-w-screen-2xl w-full grid grid-cols-1 items-center gap-y-16 gap-x-8 lg:grid-cols-2 xl:gap-x-16 mx-auto'>
                <div className='relative'>
                    <h1 className='inline text-4xl lg:text-5xl tracking-tight font-semibold'>
                        Praise <span className='text-purple-600'>Kier</span>
                    </h1>
                    <p className='text-lg text-black mt-5'>
                        In the grand corridors of fiscal responsibility, we recognize the vital role
                        of structure and discipline in elevating the human spirit. Purple stands as
                        a testament to this principle—a tool designed to bring order to financial
                        chaos, ensuring that every number finds its rightful place. Much like the
                        sacred work conducted within the halls of Lumon, it transforms the burdens
                        of the outside world into something measured, managed, and mercifully
                        refined. In this pursuit of balance, may all accounts remain ever
                        harmonious.
                        <br />
                        <br />
                        In Perpetuity,
                        <br /> Kier.
                    </p>
                </div>
                <div className='w-full xl:pl-10 grid place-items-center'>
                    <div className='w-full rounded-[3rem] relative overflow-hidden bg-purple-50/80 border border-purple-200 aspect-square'>
                        <div className='flex items-center justify-center relative h-full mx-auto w-full'>
                            <div className='absolute bottom-7 right-7 z-10'>
                                <div className='bg-purple-100/70 px-2 pr-3 py-1 flex items-center justify-center rounded-full flex-row group'>
                                    <div className='transition duration-500 group-hover:rotate-90'>
                                        <StarSVG width={24} height={24} fill='#9333EA' />
                                    </div>
                                    <p className='text-xs text-black'>This image is AI generated</p>
                                </div>
                            </div>
                            <Image
                                alt='kier'
                                objectFit='cover'
                                fill
                                style={{ color: 'transparent' }}
                                src='/graphics/kier.png'
                                quality={100}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
