import HeroSection from "@/components/hero-section"
import WhyCtrlsSSection from "@/components/why-ctrls-s-section"
import RoadmapSection from "@/components/roadmap-section"
import CertificateShowcase from "@/components/certificate-showcase"
import HomeCtaSection from "@/components/home-cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyCtrlsSSection />
      <RoadmapSection />
      <CertificateShowcase />
      {/* test */}
      <HomeCtaSection />
    </>
  )
}
