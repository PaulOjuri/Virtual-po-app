import { Zap, Mail, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto container-padding py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Stay ahead of the curve
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Get the latest insights on AI-powered product management, SAFe best practices, and exclusive updates from our product team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
                />
              </div>
              <button className="btn-primary whitespace-nowrap">
                Subscribe
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto container-padding py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white">Virtual PO</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              AI-powered product management platform designed specifically for SAFe practitioners at Colruyt Group. Transform your team's productivity with intelligent insights and automation.
            </p>
            <div className="text-sm text-gray-500">
              <p>Built with ❤️ by the Colruyt Group Digital Team</p>
              <p className="mt-1">Empowering product teams since 2024</p>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-semibold text-white mb-6">Support & Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Video Tutorials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Forum</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* SAFe integration callout */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">SAFe 6.0 Certified Platform</h4>
                <p className="text-blue-200 text-sm">
                  Officially recognized and aligned with the latest Scaled Agile Framework practices
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-white font-medium">SAFe 6.0</span>
                  <span className="text-blue-200">✓ Certified Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto container-padding py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span>&copy; 2024 Colruyt Group. All rights reserved.</span>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Security</a>
            </div>
            <div className="flex items-center space-x-4">
              <span>Made for the future of product management</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}