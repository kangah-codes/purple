import Image from 'next/image';
import Section from '../shared/Section';

// text-lg text-black mt-5

export default function OtherFeatures() {
    return (
        <div className='pt-20'>
            <Section
                title={
                    <div className='flex flex-col'>
                        <h5 className='inline text-sm font-medium text-purple-600'>ACCOUNTS</h5>
                        <h1 className='inline text-4xl lg:text-5xl tracking-tight font-bold'>
                            Master your <span className='text-purple-600'>money</span>
                        </h1>
                    </div>
                }
                description={
                    <div className='flex flex-col'>
                        <div className='flex flex-row space-x-5 items-start mt-5'>
                            <img
                                src='https://cdn.sanity.io/images/mdewiujj/production/231be0f456fe3acf6a0815a0da6ed6f73b77be2b-24x25.svg'
                                width='24'
                                height='25'
                                alt=''
                                loading='lazy'
                                className='h-[24px] w-[24px] object-fill'
                            />
                            <p className='text-lg text-black text-left'>
                                Feel good about every penny you spend. Whether it’s keeping track of
                                bills or saving up for something big, you&apos;re in control.
                            </p>
                        </div>
                        <div className='flex flex-row space-x-5 items-start mt-5'>
                            <img
                                src='https://cdn.sanity.io/images/mdewiujj/production/231be0f456fe3acf6a0815a0da6ed6f73b77be2b-24x25.svg'
                                width='24'
                                height='25'
                                alt=''
                                loading='lazy'
                                className='h-[24px] w-[24px] object-fill'
                            />
                            <p className='text-lg text-black text-left'>
                                Feel good about every penny you spend. Whether it’s keeping track of
                                bills or saving up for something big, you&apos;re in control.
                            </p>
                        </div>
                        <div className='flex flex-row space-x-5 items-start mt-5'>
                            <img
                                src='https://cdn.sanity.io/images/mdewiujj/production/231be0f456fe3acf6a0815a0da6ed6f73b77be2b-24x25.svg'
                                width='24'
                                height='25'
                                alt=''
                                loading='lazy'
                                className='h-[24px] w-[24px] object-fill'
                            />
                            <p className='text-lg text-black text-left'>
                                Feel good about every penny you spend. Whether it’s keeping track of
                                bills or saving up for something big, you&apos;re in control.
                            </p>
                        </div>
                    </div>
                }
            >
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
                            src='/graphics/account_screen.png'
                        />
                    </div>
                </div>
            </Section>
        </div>
    );
}
