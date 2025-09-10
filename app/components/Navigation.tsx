'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Zap, LogIn, ArrowRight } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">
              Virtual PO
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus-visible"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus-visible"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus-visible"
            >
              Success Stories
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus-visible"
            >
              FAQ
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="btn-secondary flex items-center space-x-2">
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="py-4 space-y-2">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Success Stories
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                FAQ
              </button>
              <hr className="my-2 border-gray-200" />
              <button className="w-full btn-secondary flex items-center justify-center space-x-2 mx-4">
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
              <button className="w-full btn-primary flex items-center justify-center space-x-2 mx-4">
                <span>Get Started</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}