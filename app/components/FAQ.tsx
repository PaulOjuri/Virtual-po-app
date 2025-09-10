'use client'

import { ChevronDown, HelpCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const faqs = [
  {
    question: "How does the AI understand SAFe practices specific to Colruyt Group?",
    answer: "Our AI is trained on SAFe 6.0 principles and customized with Colruyt Group's specific terminology, processes, and organizational structure. It understands your ART setup, team compositions, and business objectives to provide contextually relevant recommendations."
  },
  {
    question: "Can I integrate with our existing Jira and Confluence setup?",
    answer: "Absolutely! We have deep, native integrations with Atlassian tools. Your existing workflows, custom fields, and board configurations remain untouched. The AI layer sits on top, providing insights without disrupting your current processes."
  },
  {
    question: "How secure is our product and team data?",
    answer: "Security is paramount. All data is encrypted at rest and in transit using AES-256 encryption. We're SOC 2 Type II certified, GDPR compliant, and follow Colruyt Group's strict data governance policies. Role-based access ensures team members only see relevant information."
  },
  {
    question: "What happens if team members have different SAFe roles?",
    answer: "The platform automatically adapts to each user's role. Product Owners see backlog insights and stakeholder views, Scrum Masters get team health metrics and impediment tracking, and RTEs have program-level coordination tools. Everyone gets a personalized experience."
  },
  {
    question: "How quickly can our teams start seeing value?",
    answer: "Most teams see immediate value within the first week. The AI starts learning from your historical data during setup, and basic insights are available within 24 hours. Advanced predictive features improve over time as the system learns your team's patterns."
  },
  {
    question: "Does this replace our Scrum Masters or Product Owners?",
    answer: "Not at all! This platform augments human expertise, not replace it. It handles repetitive analysis and provides data-driven insights, freeing your team leads to focus on strategic decision-making, stakeholder communication, and team development."
  },
  {
    question: "Can we customize the AI recommendations for our specific context?",
    answer: "Yes, extensively. You can set business priorities, adjust risk tolerance, configure capacity planning parameters, and train the AI on your specific quality standards. The system learns and adapts to your team's unique working style over time."
  },
  {
    question: "What kind of training and support do you provide?",
    answer: "We provide comprehensive onboarding with role-specific training sessions, documentation, and ongoing support. Our customer success team works directly with your Agile Coaches to ensure smooth adoption across all teams."
  },
  {
    question: "How does billing work for multiple teams and roles?",
    answer: "Pricing is per active user per month, with volume discounts for larger deployments. Each user gets full access to role-appropriate features. We offer flexible contracts aligned with Colruyt Group's procurement processes."
  },
  {
    question: "Can we try it with a pilot team before full rollout?",
    answer: "Absolutely! We recommend starting with 1-2 teams for a 4-week pilot. This allows you to see the value, gather feedback, and build internal champions before scaling across your entire ART or organization."
  }
]

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-faq-index') || '0')
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
    const items = document.querySelectorAll('[data-faq-index]')
    items.forEach((item) => {
      if (observerRef.current) {
        observerRef.current.observe(item)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <section id="faq" className="section-padding bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto container-padding">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Got questions? We have answers</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="text-gradient"> Questions</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to know about implementing AI-powered product management at Colruyt Group.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index)
            const isVisible = visibleItems.includes(index)
            
            return (
              <div
                key={index}
                data-faq-index={index}
                className={`card overflow-hidden transition-all duration-500 transform ${
                  isVisible ? 'animate-fade-up' : 'opacity-0 translate-y-8'
                } ${isOpen ? 'shadow-lg' : 'hover:shadow-md'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus-visible"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4 leading-tight">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`} 
                    size={20} 
                  />
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our product experts are here to help you understand how Virtual PO can transform your team's productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Schedule a Demo
              </button>
              <button className="btn-secondary">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}