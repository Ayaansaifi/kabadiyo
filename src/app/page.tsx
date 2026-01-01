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
import { MobileOnly } from "@/components/common/MobileOnly"

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
        <MobileOnly>
          <section className="container mx-auto px-4 mt-2">
            <ErrorBoundary>
              <AppVideo />
            </ErrorBoundary>
          </section>
        </MobileOnly>

        {/* Service Grid Section (APP ONLY) */}
        <MobileOnly>
          <section className="container mx-auto px-4 mt-4">
            <ErrorBoundary>
              <ServiceGrid />
            </ErrorBoundary>
          </section>
        </MobileOnly>

        {/* APP ONLY: Slider showing collection process */}
        <MobileOnly>
          <div className="container mx-auto px-4 mt-2">
            <AppSlider />
          </div>
        </MobileOnly>

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

        {/* ECO SYSTEM IMPACT CARD (APP ONLY) */}
        <MobileOnly>
          <section className="container mx-auto px-4 mb-12">
            <ErrorBoundary>
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-1 rounded-3xl">
                <EcoImpactVisualizer totalWeight={42.5} />
              </div>
            </ErrorBoundary>
          </section>
        </MobileOnly>

        {/* Featured Kabadiwalas Section */}
        {featuredKabadiwalas.length > 0 && (
          <section className="py-16 px-4 bg-muted/50">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Verified Kabadiwalas</h2>
                  <p className="text-muted-foreground">Top rated scrap dealers near you</p>
                </div>
                <Button variant="ghost" className="mt-4 md:mt-0" asChild>
                  <Link href="/market">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredKabadiwalas.map((kabadiwala) => (
                  <ErrorBoundary key={kabadiwala.id}>
                    <KabadiwalaCard
                      profile={kabadiwala}
                      isFavorited={favoriteIds.includes(kabadiwala.id)}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Kabadiwala?</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg bg-green-50 dark:bg-green-900/10">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Local & Verified</h3>
                  <p className="text-muted-foreground">Connect with verified scrap dealers in your specific neighborhood.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-blue-50 dark:bg-blue-900/10">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Food Sharing</h3>
                  <p className="text-muted-foreground">Donate excess food to the needy through our Annadaan initiative.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-purple-50 dark:bg-purple-900/10">
                <CardContent className="pt-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Eco Impact</h3>
                  <p className="text-muted-foreground">Track your environmental contribution with every sale.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to clear the clutter?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of users making the planet greener, one pickup at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-primary font-bold">
                <Link href="/register">Get Started Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href={`tel:${HELPLINE_NUMBER}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call {HELPLINE_NUMBER}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
