import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import ValuePropositionSection from '@/components/sections/ValuePropositionSection';
import ExclusivitySection from '@/components/sections/ExclusivitySection';
import QuoteSection from '@/components/sections/QuoteSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <main className="pt-20">
      <HeroSection />
      <FeaturesSection />
      <ValuePropositionSection />
      <ExclusivitySection />
      <QuoteSection />
      <StatsSection />
      <CTASection />
      </main>
  );
}
