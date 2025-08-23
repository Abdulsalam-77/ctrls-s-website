import HeroSection from "@/components/hero-section";
import WhyCtrlsSSection from "@/components/why-ctrls-s-section";
import RoadmapSection from "@/components/roadmap-section";
import CertificateShowcase from "@/components/certificate-showcase";
import HomeCtaSection from "@/components/home-cta-section";

export default function HomePage() {
  return (
    <>
      {/* Wrapper for Hero Section and Why Choose CTRL-S? */}
      <div className="bg-wave5-section">
        <HeroSection />
        <WhyCtrlsSSection />
      </div>

      {/* Wrapper for Your Learning Path: ICT Level and Proof of Their Brilliance */}
      {/* Added min-h-screen to ensure this section is at least viewport height */}
      <div className="bg-wave5Rotate-section min-h-screen">
        <RoadmapSection />
        <CertificateShowcase />
      </div>

      {/* HomeCtaSection remains outside the background wrappers */}
      <HomeCtaSection />
    </>
  );
}
