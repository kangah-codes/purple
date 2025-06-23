import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-purple-400 to-white'>
            <Image
                src='/graphics/computer-crash.png'
                width={200}
                height={200}
                alt='Computer crash'
            />
            <h1 className='text-5xl text-black lg:text-7xl tracking-tight font-semibold'>Uh-oh!</h1>
            <p className='text-lg mb-6'>Sorry, we couldn’t find the page you’re looking for.</p>
            <Link
                href='/'
                className='bg-purple-500 p-[2px] text-white transition duration-500 overflow-hidden rounded-full flex px-5 py-2 2xl:text-sm'
            >
                <p className='my-auto tracking-tight font-semibold'>Take me home</p>
            </Link>
        </div>
    );
}
