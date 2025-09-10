import React from 'react';
import { ArrowRight, CheckCircle, Users, Target, BarChart3, Zap, MessageSquare, Calendar, FileText, Settings, Star, Quote, PlayCircle, ChevronDown, LogIn, Mail, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: `
      linear-gradient(135deg, rgba(4, 120, 87, 0.9) 0%, rgba(5, 150, 105, 0.9) 50%, rgba(16, 185, 129, 0.9) 100%),
      url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='leaf' patternUnits='userSpaceOnUse' width='60' height='60'%3E%3Cpath d='M10 20c10-5 20-5 30 0s20 5 30 0c-10 15-20 15-30 20s-20-15-30-20z' fill='%23ffffff08'/%3E%3Cpath d='M25 35c8-3 16-3 24 0s16 3 24 0c-8 12-16 12-24 16s-16-12-24-16z' fill='%23ffffff04'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23leaf)'/%3E%3C/svg%3E")
    `,
    backgroundSize: '120px 120px, cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  const navStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const navContainerStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoIconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const signInButtonStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  const getStartedButtonStyle: React.CSSProperties = {
    background: 'white',
    color: '#2563eb',
    padding: '12px 24px',
    borderRadius: '25px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    transform: 'scale(1)'
  };

  const heroStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '80px 24px 64px',
    textAlign: 'center'
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '32px',
    lineHeight: '1.1'
  };

  const gradientTextStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #fcd34d 0%, #f97316 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: '#bfdbfe',
    marginBottom: '48px',
    lineHeight: '1.6',
    maxWidth: '800px',
    margin: '0 auto 48px'
  };

  const ctaContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '48px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: 'white',
    color: '#2563eb',
    padding: '16px 32px',
    borderRadius: '25px',
    fontWeight: '600',
    fontSize: '18px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.15s ease',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    padding: '16px 32px',
    borderRadius: '25px',
    fontWeight: '600',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.15s ease'
  };

  const trustIndicatorsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '14px',
    color: '#bfdbfe',
    marginBottom: '64px'
  };

  const trustItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const statsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    marginTop: '64px'
  };

  const statItemStyle: React.CSSProperties = {
    textAlign: 'center'
  };

  const statNumberStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px'
  };

  const statLabelStyle: React.CSSProperties = {
    color: '#bfdbfe',
    fontWeight: '500'
  };

  const featureCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  };

  const featureIconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  };

  const featureGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  };

  return (
    <div style={containerStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <div style={logoStyle}>
            <div style={logoIconStyle}>
              <Zap color="white" size={24} />
            </div>
            <span style={logoTextStyle}>Virtual PO</span>
          </div>
          <div style={buttonContainerStyle}>
            <button onClick={onSignIn} style={signInButtonStyle}>
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button onClick={onGetStarted} style={getStartedButtonStyle}>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={heroStyle}>
        {/* Badge */}
        <div style={badgeStyle}>
          <Star size={16} />
          <span>Trusted by Colruyt Group Xtra teams</span>
        </div>

        {/* Main heading */}
        <h1 style={titleStyle}>
          Your AI-Powered
          <br />
          <span style={gradientTextStyle}>
            Virtual Product Owner
          </span>
        </h1>

        {/* Subtitle */}
        <p style={subtitleStyle}>
          Transform your product management with AI-powered insights, role-based workflows, and intelligent automation designed specifically for SAFe practitioners at Colruyt Group Xtra.
        </p>

        {/* CTA buttons */}
        <div style={ctaContainerStyle}>
          <button onClick={onGetStarted} style={primaryButtonStyle}>
            <span>Explore Features</span>
            <ArrowRight size={20} />
          </button>
          
          <button style={secondaryButtonStyle}>
            <PlayCircle size={20} />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Trust indicators */}
        <div style={trustIndicatorsStyle}>
          <div style={trustItemStyle}>
            <CheckCircle color="#10b981" size={16} />
            <span>Enterprise-grade security</span>
          </div>
          <div style={trustItemStyle}>
            <CheckCircle color="#10b981" size={16} />
            <span>SAFe 6.0 compliant</span>
          </div>
          <div style={trustItemStyle}>
            <CheckCircle color="#10b981" size={16} />
            <span>Seamless Jira integration</span>
          </div>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>85%</div>
            <div style={statLabelStyle}>Faster sprint planning</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>50+</div>
            <div style={statLabelStyle}>Teams onboarded</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>99.9%</div>
            <div style={statLabelStyle}>Uptime guarantee</div>
          </div>
        </div>
      </section>

      {/* Quick features showcase */}
      <section style={{...heroStyle, paddingTop: '0'}}>
        <div style={featureGridStyle}>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <Target color="white" size={24} />
            </div>
            <h3 style={{color: 'white', fontWeight: '600', marginBottom: '8px'}}>Role-Based Intelligence</h3>
            <p style={{color: '#bfdbfe', fontSize: '14px'}}>Adapts to your SAFe role with personalized workflows</p>
          </div>
          
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <MessageSquare color="white" size={24} />
            </div>
            <h3 style={{color: 'white', fontWeight: '600', marginBottom: '8px'}}>AI Assistant</h3>
            <p style={{color: '#bfdbfe', fontSize: '14px'}}>24/7 contextual help for SAFe practices</p>
          </div>
          
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <BarChart3 color="white" size={24} />
            </div>
            <h3 style={{color: 'white', fontWeight: '600', marginBottom: '8px'}}>Predictive Analytics</h3>
            <p style={{color: '#bfdbfe', fontSize: '14px'}}>Forecast outcomes and identify risks early</p>
          </div>
          
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <Users color="white" size={24} />
            </div>
            <h3 style={{color: 'white', fontWeight: '600', marginBottom: '8px'}}>Stakeholder Intelligence</h3>
            <p style={{color: '#bfdbfe', fontSize: '14px'}}>Smart communication tracking and mapping</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;