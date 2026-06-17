"use client"

import { useEffect, useState } from "react"

import { HeroSection } from "@/components/sections/HeroSection"
import { ProductShowcase } from "@/components/sections/ProductShowcase"
import { WhyChooseSection } from "@/components/sections/WhyChooseSection"
import { GuideSection } from "@/components/sections/GuideSection"
import { CustomerPainSection } from "@/components/sections/CustomerPainSection"
import { PurchaseCtaSection } from "@/components/sections/PurchaseCtaSection"
import {
  defaultPublicSiteSettings,
  fetchPublicSiteSettings,
  type PublicSiteSettings
} from "@/lib/site-settings"

export default function HomePage() {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSiteSettings)

  useEffect(() => {
    let cancelled = false

    fetchPublicSiteSettings()
      .then((payload) => {
        if (!cancelled) {
          setSettings(payload)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <HeroSection settings={settings} />
      <ProductShowcase />
      <WhyChooseSection />
      <GuideSection settings={settings} />
      <CustomerPainSection />
      <PurchaseCtaSection settings={settings} />
    </>
  )
}
