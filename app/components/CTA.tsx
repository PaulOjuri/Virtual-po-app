'use client'

import { ArrowRight, Calendar, Zap } from 'lucide-react'

export default function CTA() {
  return (
    <section className="section-padding hero-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="cta-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto container-padding text-center">
        {/* Main CTA */}
        <div className="mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Transform
            <br />
            <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Your Product Practice?
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join 50+ teams at Colruyt Group who are already using AI to deliver better products faster. Start your transformation today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 hover:shadow-xl flex items-center justify-center space-x-3 focus-visible">
              <Zap size={20} />
              <span>Start Free Trial</span>
            </button>
            
            <button className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 hover:bg-white/30 flex items-center justify-center space-x-3 focus-visible">
              <Calendar size={20} />
              <span>Book a Demo</span>
            </button>
          </div>
        </div>

        {/* Value props */}
        <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready in Minutes</h3>
            <p className="text-blue-200 text-sm">Quick setup with existing Jira integration</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Immediate Value</h3>
            <p className="text-blue-200 text-sm">See AI insights from day one</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Risk-Free Trial</h3>
            <p className="text-blue-200 text-sm">30 days with full support included</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-sm text-blue-200">
          <span>✓ Enterprise-grade security</span>
          <span>✓ GDPR compliant</span>
          <span>✓ 24/7 support included</span>
          <span>✓ No credit card required</span>
        </div>
      </div>
    </section>
  )
}