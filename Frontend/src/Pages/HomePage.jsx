import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/HeroSection'
import LivePriceTicker from '../components/LivePriceTicker'
import HomeTop10 from '../components/HomeTopCoins'
import MarketOverviewStats from '../components/MarketOverviewStats'
import TopLosers from '../components/TopLosers'
import WhyStockBazar from '../components/WhyStockBazar'
import FeaturedTools from '../components/FeaturedTools'
import CryptoNews from '../components/CryptoNews'
import CTABanner from '../components/CTABanner'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Scrolling live price ticker */}
      <LivePriceTicker />


      {/* Market Overview Stats */}
      <MarketOverviewStats />

      {/* Top 10 Gainers slider */}
      <HomeTop10 />


      {/* Top Losers */}
      {/* <TopLosers /> */}

      {/* Why StockBazar + Featured Tools */}
      <section className="py-12 px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WhyStockBazar />
          <FeaturedTools />
        </div>
      </section>

      {/* Market News */}
      {/* <CryptoNews /> */}

      {/* CTA Banner */}
      <CTABanner />

      <Footer />
    </div>
  )
}

export default HomePage