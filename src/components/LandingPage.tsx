import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { HowItWorksSection } from './HowItWorksSection'
import { CTASection } from './CTASection'
import { Footer } from './Footer'

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <HeroSection onStart={onStart} />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection onStart={onStart} />
      <Footer />
    </div>
  )
}
