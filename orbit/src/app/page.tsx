import BlockSection from '@/components/index/BlockSection';
import Features from '@/components/index/Features';
import Hero from '@/components/index/Hero';
import Section from '@/components/index/Section';

export default function Home() {
    return (
        <div>
            <Hero />
            {/* <Section /> */}
            <BlockSection />
            <Features />
        </div>
    );
}
