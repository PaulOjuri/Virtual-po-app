'use client'

import { Star, Quote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    name: "Sarah Van Der Berg",
    role: "Senior Product Owner, Colruyt Group Digital",
    avatar: "SV",
    content: "The AI-powered backlog prioritization has been a game-changer. What used to take hours of analysis now happens in minutes, and the recommendations are incredibly accurate.",
    rating: 5,
    highlight: "85% faster sprint planning"
  },
  {
    name: "Thomas Janssen", 
    role: "Release Train Engineer, Xtra Platform",
    avatar: "TJ",
    content: "Finally, a tool that truly understands SAFe at scale. The dependency tracking across our 12 teams has never been clearer, and PI planning is actually enjoyable now.",
    rating: 5,
    highlight: "12 teams coordinated seamlessly"
  },
  {
    name: "Marie Dubois",
    role: "Scrum Master, Colruyt Group IT",
    avatar: "MD", 
    content: "The stakeholder intelligence feature is phenomenal. I always know who needs to be informed about what, and when. It's like having a personal assistant for communication.",
    rating: 5,
    highlight: "100% stakeholder satisfaction"
  },
  {
    name: "Pieter Vermeulen",
    role: "Product Manager, Customer Experience",
    avatar: "PV",
    content: "The predictive analytics helped us identify a major bottleneck three sprints before it would have impacted delivery. We course-corrected early and delivered on time.",
    rating: 5,
    highlight: "Prevented 3 weeks delay"
  },
  {
    name: "Lisa Chen",
    role: "Agile Coach, Transformation Office", 
    avatar: "LC",
    content: "Rolling this out across 50+ teams was surprisingly smooth. The role-based personalization means everyone gets exactly what they need without overwhelming complexity.",
    rating: 5,
    highlight: "50+ teams onboarded"
  },
  {
    name: "Marc Peeters",
    role: "Technical Product Owner, Data Platform",
    avatar: "MP",
    content: "The Jira integration is flawless. All our existing workflows stayed intact, but now we have AI insights on top. It's like upgrading to a Tesla without changing how you drive.",
    rating: 5,
    highlight: "Zero workflow disruption"
  }
]

export default function Testimonials() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.1 }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll('[data-testimonial-index]')
    cards.forEach((card) => {
      if (observerRef.current) {
        observerRef.current.observe(card)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Auto-rotate featured testimonial
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by 
            <span className="text-gradient"> Product Leaders</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how product teams at Colruyt Group are transforming their SAFe practices and delivering better outcomes with AI-powered insights.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="mb-20">
          <div className="card max-w-4xl mx-auto p-8 lg:p-12 text-center">
            <div className="flex justify-center mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-current" size={24} />
              ))}
            </div>
            <blockquote className="text-2xl lg:text-3xl text-gray-700 leading-relaxed mb-8 font-medium">
              "{testimonials[currentIndex].content}"
            </blockquote>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {testimonials[currentIndex].avatar}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-lg">{testimonials[currentIndex].name}</div>
                <div className="text-gray-600">{testimonials[currentIndex].role}</div>
              </div>
            </div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>{testimonials[currentIndex].highlight}</span>
            </div>
          </div>

          {/* Testimonial navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const isVisible = visibleItems.includes(index)
            
            return (
              <div
                key={index}
                data-testimonial-index={index}
                className={`card p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-lg ${
                  isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <Quote className="text-blue-200 mb-4" size={24} />
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <div className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  <span>✨ {testimonial.highlight}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 pt-20 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600 font-medium">Teams using daily</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600 font-medium">User satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">85%</div>
            <div className="text-gray-600 font-medium">Faster planning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">40%</div>
            <div className="text-gray-600 font-medium">Better velocity</div>
          </div>
        </div>
      </div>
    </section>
  )
}