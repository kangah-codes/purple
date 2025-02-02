import Link from 'next/link';
import Image from 'next/image';

export default function Nav() {
    return (
        <div className='p-5 w-full max-w-3xl xl:max-w-4xl mx-auto'>
            <div className='relative inline-flex group w-full'>
                {/* <div className='absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt'></div> */}
                <div className='bg-purple-200/40 flex flex-col px-3 py-2 backdrop-blur-lg border border-purple-500/50 rounded-full w-full'>
                    <div className='flex justify-between items-center w-full max-w-screen-2xl mx-auto'>
                        <div className='flex flex-row items-center justify-center space-x-2'>
                            <Image
                                alt='Logo'
                                src='/logo.png'
                                width={35}
                                height={35}
                                className='rounded-md'
                            />
                            <h1 className='text-xl font-black text-purple-700'>Purple</h1>
                        </div>
                        <div className='flex flex-row items-center'>
                            <ul className='hidden md:flex space-x-5 font-medium text-black'>
                                <li
                                // onMouseEnter={() => setMenu1(true)}
                                // onMouseLeave={() => setMenu1(false)}
                                >
                                    <button
                                        type='button'
                                        // onClick={() => setMenu1(!menu1)}
                                        className='group flex items-center focus:outline-none'
                                        aria-expanded='false'
                                    >
                                        <h3 className='text-sm font-bold flex justify-center transition duration-200 cursor-pointer z-2 hover:opacity-[0.7]'>
                                            Features
                                        </h3>
                                        {/* <ChevronDownIcon className='text-gray-900 ml-1 w-4 h-4' /> */}
                                    </button>
                                </li>
                                <li className='items-center flex'>
                                    <Link href='#'>
                                        <h3 className='text-sm font-bold flex justify-center transition duration-200 cursor-pointer z-2 hover:opacity-[0.7]'>
                                            About
                                        </h3>
                                    </Link>
                                </li>
                                <li className='items-center flex'>
                                    <Link href='#'>
                                        <h3 className='text-sm font-bold flex justify-center transition duration-200 cursor-pointer z-2 hover:opacity-[0.7]'>
                                            Legal
                                        </h3>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <a
                                href='https://github.com/kangah-codes/purple'
                                className='bg-gradient-to-br from-purple-400 to-purple-700 rounded-full flex items-center justify-center px-4 py-2 text-white transition duration-500'
                            >
                                <p className='text-sm'>Download</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
