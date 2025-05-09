import BlockSection from '@/components/index/BlockSection';
import Hero from '@/components/index/Hero';
import Master from '@/components/index/Master';
import OtherFeatures from '@/components/index/OtherFeatures';
import Section from '@/components/index/Section';

export default function Home() {
    return (
        <div>
            <Hero />
            <Section />
            <OtherFeatures />
            <Master />
            <BlockSection />
        </div>
    );
}
