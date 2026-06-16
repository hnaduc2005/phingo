import { HeroSection } from "@/components/sections/HeroSection"
import { ProductShowcase } from "@/components/sections/ProductShowcase"
import { WhyChooseSection } from "@/components/sections/WhyChooseSection"
import { GuideSection } from "@/components/sections/GuideSection"
import { CustomerPainSection } from "@/components/sections/CustomerPainSection"
import { PurchaseCtaSection } from "@/components/sections/PurchaseCtaSection"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductShowcase />
      <WhyChooseSection />
      <GuideSection />
      <CustomerPainSection />
      <PurchaseCtaSection />
    </>
  )
}
