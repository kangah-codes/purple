import BlockSection from '@/components/index/BlockSection';
import Hero from '@/components/index/Hero';
import Rain from '@/components/index/Rain';
import Section from '@/components/index/Section';

export default function Home() {
    return (
        <div>
            <Hero />
            <Section />
            <Rain />
            <BlockSection />
        </div>
    );
}
