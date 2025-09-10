'use client'

import { Brain, Target, Users, BarChart3, Calendar, MessageSquare, Shield, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Decision Support",
    description: "Get intelligent recommendations for backlog prioritization, risk assessment, and strategic planning based on your team's velocity and business objectives.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Target,
    title: "Role-Based Personalization",
    description: "Tailored dashboards and workflows that adapt to your specific role—Product Owner, Scrum Master, or Release Train Engineer—with SAFe-specific terminology and processes.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: Users,
    title: "Stakeholder Intelligence",
    description: "Advanced stakeholder mapping and communication tracking. Know who needs what information and when, with automated updates and personalized dashboards.",
    color: "from-green-500 to-teal-600"
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Forecast sprint outcomes, identify bottlenecks before they happen, and make data-driven decisions with comprehensive team performance insights.",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Calendar,
    title: "Intelligent Sprint Planning",
    description: "AI-assisted story estimation, capacity planning, and dependency tracking. Optimize your sprint goals with machine learning insights from successful patterns.",
    color: "from-cyan-500 to-blue-600"
  },
  {
    icon: MessageSquare,
    title: "Contextual AI Assistant",
    description: "24/7 AI coach that understands SAFe practices, can draft user stories, suggest acceptance criteria, and provide role-specific guidance during ceremonies.",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SOC 2 compliance, and role-based access controls. Your sensitive product data stays secure with enterprise-level privacy protection.",
    color: "from-emerald-500 to-green-600"
  },
  {
    icon: Zap,
    title: "Seamless Integrations",
    description: "Deep integration with Jira, Confluence, Microsoft Teams, and other Colruyt Group tools. Sync data automatically without changing existing workflows.",
    color: "from-yellow-500 to-orange-600"
  }
]

export default function Features() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [selectedFeature, setSelectedFeature] = useState(0)
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
    const cards = document.querySelectorAll('[data-index]')
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

  return (
    <section id="features" className="section-padding bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powered by 
            <span className="text-gradient"> Advanced AI</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built specifically for SAFe practitioners, our platform combines cutting-edge AI with deep domain expertise to revolutionize how product teams operate at Colruyt Group.
          </p>
        </div>

        {/* Feature showcase */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Interactive feature list */}
          <div className="space-y-4">
            {features.slice(0, 4).map((feature, index) => {
              const Icon = feature.icon
              const isActive = selectedFeature === index
              const isVisible = visibleItems.includes(index)
              
              return (
                <div
                  key={index}
                  data-index={index}
                  className={`card p-6 cursor-pointer transition-all duration-300 transform ${
                    isActive 
                      ? 'border-blue-500 bg-white shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  } ${isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8'}`}
                  onClick={() => setSelectedFeature(index)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${isActive ? feature.color : 'from-gray-100 to-gray-200'} transition-all duration-300`}>
                      <Icon className={isActive ? 'text-white' : 'text-gray-600'} size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Feature visualization */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-3xl border border-gray-200 shadow-xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${features[selectedFeature].color} flex items-center justify-center mx-auto mb-6 transition-all duration-300`}>
                  {React.createElement(features[selectedFeature].icon, { 
                    size: 40, 
                    className: 'text-white' 
                  })}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {features[selectedFeature].title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {features[selectedFeature].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.slice(4).map((feature, index) => {
            const Icon = feature.icon
            const actualIndex = index + 4
            const isVisible = visibleItems.includes(actualIndex)
            
            return (
              <div
                key={actualIndex}
                data-index={actualIndex}
                className={`card p-6 text-center transition-all duration-500 transform hover:scale-105 ${
                  isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="btn-primary text-lg px-8 py-4">
            Explore All Features
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}