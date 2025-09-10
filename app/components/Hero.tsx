'use client'

import { ArrowRight, CheckCircle, Star, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
      <div className="absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto container-padding pt-20 pb-16 text-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 transition-all duration-600 ${
            isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Trusted by Colruyt Group Xtra teams</span>
        </div>

        {/* Main heading */}
        <h1 
          className={`text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight transition-all duration-600 animation-delay-200 ${
            isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          Your AI-Powered
          <br />
          <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Virtual Product Owner
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-4xl mx-auto transition-all duration-600 animation-delay-400 ${
            isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          Transform your product management with AI-powered insights, role-based workflows, and intelligent automation designed specifically for SAFe practitioners at Colruyt Group Xtra.
        </p>

        {/* CTA buttons */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 transition-all duration-600 animation-delay-600 ${
            isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <button 
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 hover:shadow-xl flex items-center justify-center space-x-3 focus-visible"
          >
            <span>Explore Features</span>
            <ArrowRight size={20} />
          </button>
          
          <button className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 hover:bg-white/30 flex items-center justify-center space-x-3 focus-visible">
            <Play size={20} />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Trust indicators */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-sm text-blue-100 transition-all duration-600 animation-delay-600 ${
            isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-400" size={16} />
            <span>Enterprise-grade security</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-400" size={16} />
            <span>SAFe 6.0 compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-400" size={16} />
            <span>Seamless Jira integration</span>
          </div>
        </div>

        {/* Stats */}
        <div 
          className={`grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mt-16 transition-all duration-800 animation-delay-600 ${
            isVisible ? 'animate-fade-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-blue-200 font-medium">Faster sprint planning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-blue-200 font-medium">Teams onboarded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-blue-200 font-medium">Uptime guarantee</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}