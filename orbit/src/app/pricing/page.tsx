import Hero from '@/components/pricing/Hero';
import Plans from '@/components/pricing/Plans';
import AnimatedClouds from '@/components/shared/AnimatedClouds';

export default function Terms() {
    return (
        <div className='relative w-full flex bg-gradient-to-b from-purple-400 to-white flex-col'>
            <AnimatedClouds
                baseSpeed={1}
                minHeight={10}
                maxHeight={450}
                spawnRate={5}
                className='left-0 right-0 absolute z-[4]'
            />
            <Hero />
            <Plans />
        </div>
    );
}
