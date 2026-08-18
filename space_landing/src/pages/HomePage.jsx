import Hero from "../components/Hero";
import LogoStrip from "../components/LogoStrip";
import Services from "../components/Services";
import CtaBanner from "../components/CtaBanner";
import CaseStudies from "../components/CaseStudies";
import Process from "../components/Process";
import Testimonials from "../components/Testimonials";
import Team from "../components/Team";
import Contact from "../components/Contact";

/**
 * HomePage — trang đích (landing) kiểu Positivus:
 * ghép các section giới thiệu thư viện vũ trụ.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <Services />
      <CtaBanner />
      <CaseStudies />
      <Process />
      <Testimonials />
      <Team />
      <Contact />
    </>
  );
}
