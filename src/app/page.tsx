import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, MapPin, MessageCircle, Star, Phone, Recycle, LayoutDashboard, Heart, Utensils } from "lucide-react"
import { StoriesSection } from "@/components/stories/StoriesSection"
import { ScrapRatesTicker } from "@/components/dashboard/ScrapRatesTicker"
import { ImpactStats } from "@/components/dashboard/ImpactStats"
import { QuickLinksGrid } from "@/components/layout/QuickLinksGrid"
import { AppSlider } from "@/components/layout/AppSlider"
import { db } from "@/lib/db"
import { KabadiwalaCard } from "@/components/kabadiwala-card"
import { cookies } from "next/headers"
import Image from "next/image"
import { PromoSlider } from "@/components/dashboard/PromoSlider"
import { FeaturedIcons } from "@/components/dashboard/FeaturedIcons"
import { PromoCard } from "@/components/dashboard/ImagePromoCards"
import { ErrorBoundary } from "@/components/error-boundary"
import { AppVideo } from "@/components/dashboard/AppVideo"
import { ServiceGrid } from "@/components/dashboard/ServiceGrid"
import { EcoImpactVisualizer } from "@/components/profile/EcoImpactVisualizer"

// Direct call number for users who don't want to create profile
const HELPLINE_NUMBER = "8586040076"

async function getFeaturedKabadiwalas() {
  try {
    return await db.kabadiwalaProfile.findMany({
      include: { user: true },
      where: { isVerified: true },
      take: 3, // Featured limit
      orderBy: { rating: 'desc' }
    })
  } catch {
    return []
  }
}

async function getUserFavorites() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  if (!userId) return []

  try {
    const favorites = await db.favorite.findMany({
      where: { userId },
      select: { kabadiwalaId: true }
    })
    return favorites.map(f => f.kabadiwalaId)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return []
  }
}

export default async function LandingPage() {
  const featuredKabadiwalas = await getFeaturedKabadiwalas()
  const favoriteIds = await getUserFavorites()
  const cookieStore = await cookies()
  const isLoggedIn = !!cookieStore.get("userId")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {/* Stories Section (Moved to Top) */}
        <section className="pt-4 pb-2 px-0 md:px-4">
          <StoriesSection />
        </section>

        {/* Video Section (APP ONLY) */}
        <section className="container mx-auto px-4 mt-2">
          <ErrorBoundary>
            <AppVideo />
          </ErrorBoundary>
        </section>

        {/* Service Grid Section (APP ONLY) */}
        <section className="container mx-auto px-4 mt-4">
          <ErrorBoundary>
            <ServiceGrid />
          </ErrorBoundary>
        </section>

        {/* APP ONLY: Slider showing collection process */}
        <div className="container mx-auto px-4 mt-2">
          <AppSlider />
        </div>

        {/* Hero Section */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          {/* Animated Background Blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse duration-[5000ms]" />

          <div className="container mx-auto max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent border border-primary/10 text-primary px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform duration-300">
              <Recycle className="h-5 w-5 animate-spin-slow" />
              <span className="text-sm font-semibold tracking-wide uppercase">India&apos;s #1 Scrap Selling App</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent px-2 leading-[1.1]">
              Turn Your Waste into <span className="text-green-600 dark:text-green-500">Cash 💵</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Fastest way to sell clean scrap. Get instant quotes, free doorstep pickup, and immediate payment.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Conditional Dashboard Button */}
              {isLoggedIn ? (
                <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 border-0">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all w-full sm:w-auto bg-green-600 hover:bg-green-700">
                    <Link href="/market">
                      Find Kabadiwala <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-muted active:scale-95 transition-all w-full sm:w-auto bg-transparent backdrop-blur-sm">
                    <Link href="/register">
                      Create Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Daily Rates Ticker */}
        <section className="container mx-auto px-4 -mt-6 relative z-10 mb-8">
          <ScrapRatesTicker />
          {/* Promo Card 1: We Buy Everything */}
          <div className="mt-8">
            <ErrorBoundary>
              <PromoCard
                title="We Buy Everything"
                subtitle="From newspaper to iron, we buy all scraps at your doorstep."
                cta="Check Rates"
                href="/market"
                gradient="from-blue-600 to-indigo-900"
                image="/images/promo/buying-everything.png"
              />
            </ErrorBoundary>
          </div>
        </section>

        <section className="container mx-auto px-4 mb-4">
          <ImpactStats />
          {/* Promo Card 2: Bulk Laptops */}
          <div className="mt-4">
            <ErrorBoundary>
              <PromoCard
                title="Bulk Laptop Buyers"
                subtitle="Best prices for old/dead laptops & e-waste. Corporate pickup available."
                cta="Sell Laptops"
                href="/sell/laptops"
                gradient="from-purple-600 to-violet-900"
                image="/images/promo/bulk-laptops.png"
                delay={0.2}
              />
            </ErrorBoundary>
          </div>
        </section>

        {/* Promo Slider & Featured Icons */}
        <section className="container mx-auto px-4 -mt-4 mb-8">
          <PromoSlider />
          <FeaturedIcons />

          {/* Promo Card 3: Office Clearance */}
          <ErrorBoundary>
            <PromoCard
              title="Office Scrap Clearance"
              subtitle="Full office dismantling & furniture buying service."
              cta="Get Quote"
              href="/sell/office-scrap"
              gradient="from-orange-600 to-red-900"
              image="/images/promo/office-clearance.png"
              delay={0.3}
            />
          </ErrorBoundary>
        </section>

        <section className="container mx-auto px-4 mb-12">
          {/* Promo Card 4: Our Team */}
          <ErrorBoundary>
            <PromoCard
              title="Verified & Trusted Team"
              subtitle="Our professional team ensures safe & honest service."
              cta="Meet Us"
              href="/help"
              gradient="from-teal-600 to-cyan-900"
              image="/images/promo/our-team.png"
              delay={0.4}
            />
          </ErrorBoundary>
        </section>

        {/* COMMUNITY IMPACT SECTION (NEW) */}
        <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Making a Difference Together ❤️</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We are more than just a business. Join us in our mission to help the needy and reduce food waste.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">

              {/* Donation Card */}
              <Card className="overflow-hidden border-orange-200 shadow-xl bg-white dark:bg-card">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="bg-orange-600 p-8 flex flex-col justify-center items-center text-white md:w-2/5">
                    <Image
                      src="/donate-qr.png"
                      alt="Donation QR Code"
                      width={300}
                      height={300}
                      className="rounded-xl shadow-lg mb-4 bg-white p-3"
                    />
                    <p className="font-bold text-center text-sm opacity-90">SCAN TO DONATE</p>
                  </div>
                  <div className="p-8 md:w-3/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                      <Heart className="h-5 w-5 fill-current" />
                      <span>Support the Cause</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Share Your Profit</h3>
                    <p className="text-muted-foreground mb-6">
                      If you are a Kabadiwala and made a profit, consider sharing a small part.
                      Your donation helps us feed the poor and support our team.
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      * All donations are voluntary and used 100% for social welfare.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Food Rescue Card */}
              <Card className="overflow-hidden border-green-200 shadow-xl bg-white dark:bg-card h-full">
                <CardContent className="p-8 flex flex-col h-full justify-center text-center items-center">
                  <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Utensils className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Leftover Food? Don&apos;t Throw It!</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Have excess food from a wedding or party? Let us know.
                    We will pick it up and distribute it to the hungry.
                  </p>
                  <Button asChild size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                    <Link href="/food-rescue">
                      Start Food Rescue (Annadaan) <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>



        {/* ECO SYSTEM IMPACT CARD (APP ONLY - platform detection handled by component) */}
        <section className="container mx-auto px-4 mb-12">
          <ErrorBoundary>
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-1 rounded-3xl">
              <EcoImpactVisualizer totalWeight={42.5} />
            </div>
          </ErrorBoundary>
        </section>

        {/* Featured Kabadiwalas Section */}
        {featuredKabadiwalas.length > 0 && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="container mx-auto">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Top Rated Kabadiwalas</h3>
                  <p className="text-muted-foreground">Trusted scrap dealers near you</p>
                </div>
                <Button asChild variant="ghost">
                  <Link href="/market">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredKabadiwalas.map((profile) => (
                  <KabadiwalaCard
                    key={profile.id}
                    profile={profile as any}
                    isFavorited={favoriteIds.includes(profile.userId)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Direct Call Section - For users who don't want to register */}
        <section className="py-12 px-4 bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10">
          <div className="container mx-auto max-w-3xl">
            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-green-500/10 rounded-full">
                    <Phone className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Don&apos;t Want to Register?</h3>
                    <p className="text-muted-foreground mb-4">
                      No problem! Simply call our helpline number and sell your scrap directly.
                      Our team will arrange pickup at your doorstep.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <a
                        href={`tel:${HELPLINE_NUMBER}`}
                        className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
                      >
                        <Phone className="h-5 w-5" />
                        Call Now: {HELPLINE_NUMBER}
                      </a>
                      <div className="text-sm text-muted-foreground">
                        <p>📞 Available 9 AM - 8 PM</p>
                        <p>💬 Hindi & English</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-semibold text-lg">📦 Free Pickup</p>
                    <p className="text-sm text-muted-foreground">At your doorstep</p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">💵 Cash Payment</p>
                    <p className="text-sm text-muted-foreground">On the spot</p>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">⚖️ Fair Rates</p>
                    <p className="text-sm text-muted-foreground">Market price</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Promo Card 4: Join Movement - reusing truck-load.jpg for generic impact */}
        <section className="container mx-auto px-4 mb-12">
          <ErrorBoundary>
            <PromoCard
              title="Join the Green Movement"
              subtitle="Recycle today for a better tomorrow."
              cta="Start Selling"
              href="/register"
              gradient="from-teal-600 to-cyan-900"
              image="/images/promo/truck-load.jpg"
              delay={0.4}
            />
          </ErrorBoundary>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold text-center mb-10">Why Choose Our App?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Star className="h-10 w-10 text-yellow-500" />}
                title="Rated Dealers"
                description="Choose the best Kabadiwala based on real user reviews and ratings."
              />
              <FeatureCard
                icon={<MessageCircle className="h-10 w-10 text-blue-500" />}
                title="Direct Chat"
                description="Chat directly with the dealer to negotiate prices and confirm details."
              />
              <FeatureCard
                icon={<MapPin className="h-10 w-10 text-green-500" />}
                title="Doorstep Pickup"
                description="Schedule a pickup at your convenience. Instant cash payment."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <Step number="1" title="Find" description="Browse local Kabadiwalas" />
              <Step number="2" title="Chat" description="Discuss rates & details" />
              <Step number="3" title="Book" description="Schedule pickup time" />
              <Step number="4" title="Earn" description="Get cash on delivery" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-muted-foreground mb-20 md:mb-0 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          {/* Quick Links Icon Grid */}
          <QuickLinksGrid />

          {/* Copyright */}
          <div className="text-center pt-6 mt-6 border-t border-muted">
            <p className="text-xs">&copy; 2025 Kabadiyo.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6 text-center flex flex-col items-center">
        <div className="mb-4 p-3 bg-accent rounded-full">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
