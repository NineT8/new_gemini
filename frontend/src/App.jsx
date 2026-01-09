import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Zap, Shield, Globe, ChevronRight, Search, Users, BarChart3, Clock, Star, ExternalLink, Mail, Lock, BookOpen, Sun, Moon } from 'lucide-react';
import MissionControl from './components/MissionControl';
import Modal from './components/Modal';

// Custom hook for scroll reveal animations
function useScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('.reveal, .reveal-scale, .stagger-children').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);
}

function App() {
    const [jobId, setJobId] = useState(null);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showDocs, setShowDocs] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const searchRef = useRef(null);

    useScrollReveal();

    // Toggle dark mode on body and html
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);

    const startResearch = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/v1/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            const data = await res.json();
            setJobId(data.job_id);
        } catch (err) {
            console.error(err);
            alert('Failed to start research');
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToSearch = () => {
        searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            searchRef.current?.querySelector('input')?.focus();
        }, 500);
    };

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToPricing = () => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (jobId) {
        return <MissionControl jobId={jobId} onReset={() => setJobId(null)} />;
    }

    const suggestions = [
        { label: "AI Trends 2026", query: "Latest AI trends and breakthroughs in 2026" },
        { label: "Startup Funding", query: "How to raise seed funding for a tech startup" },
        { label: "Climate Tech", query: "Emerging climate technology solutions" },
    ];

    const stats = [
        { number: "50K+", label: "Research Queries" },
        { number: "99.2%", label: "Accuracy Rate" },
        { number: "< 30s", label: "Avg. Response" },
        { number: "24/7", label: "Availability" },
    ];

    const testimonials = [
        {
            quote: "Nexus has completely transformed how our team conducts market research. What used to take days now takes minutes.",
            author: "Sarah Chen",
            role: "Head of Strategy, TechCorp",
            avatar: "SC"
        },
        {
            quote: "The accuracy and depth of insights we get is remarkable. It's like having a team of expert researchers at your fingertips.",
            author: "Marcus Rodriguez",
            role: "Founder, DataDriven",
            avatar: "MR"
        },
        {
            quote: "Finally, an AI tool that actually delivers on its promises. The verification step gives us confidence in every result.",
            author: "Emma Thompson",
            role: "Research Director, InnovateLab",
            avatar: "ET"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="logo-icon-glow w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold nexus-logo">Nexus</span>
                    </div>

                    {/* Centered Nav Links */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/80 backdrop-blur-sm">
                            <button onClick={scrollToFeatures} className="nav-pill">Features</button>
                            <button onClick={() => setShowDocs(true)} className="nav-pill">Docs</button>
                            <button onClick={scrollToPricing} className="nav-pill">Pricing</button>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Premium Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`theme-toggle ${isDarkMode ? 'dark' : ''}`}
                            aria-label="Toggle theme"
                            type="button"
                        >
                            <div className="toggle-stars">
                                <span className="toggle-star"></span>
                                <span className="toggle-star"></span>
                                <span className="toggle-star"></span>
                            </div>
                            <div className="toggle-knob">
                                <Sun size={14} className="sun-icon" strokeWidth={2.5} />
                                <Moon size={12} className="moon-icon" strokeWidth={2.5} />
                            </div>
                        </button>

                        <button
                            onClick={() => setShowSignIn(true)}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block px-3 py-1.5"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={scrollToSearch}
                            className="btn-primary btn-magnetic text-sm !py-2 !px-4"
                        >
                            <span>Get Started</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6 relative">
                <div className="max-w-4xl w-full text-center space-y-8">
                    {/* Badge */}
                    <div className="hero-text-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-indigo-700 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={scrollToFeatures}>
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Powered by Advanced AI</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center hero-text-reveal-delay-1">
                        <div className="logo-container animate-float">
                            <div className="logo-glow animate-pulse-glow"></div>
                            <div className="logo-inner">
                                <Sparkles className="w-10 h-10 text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    {/* Headline - More human, varied typography */}
                    <div className="space-y-6 hero-text-reveal-delay-1">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                            <span className="word-light text-slate-800">Research,</span>
                            <br />
                            <span className="word-emphasis gradient-text">Unchained.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed hero-text-reveal-delay-2">
                            Autonomous AI that <span className="text-slate-900 font-medium">plans</span>, <span className="text-slate-900 font-medium">executes</span>, and <span className="text-slate-900 font-medium">verifies</span> research in real-time.
                            What took hours now takes seconds.
                        </p>
                    </div>

                    {/* Search Form */}
                    <form ref={searchRef} onSubmit={startResearch} className="relative max-w-2xl mx-auto hero-text-reveal-delay-2">
                        <div className="glass-card-hover p-2">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-500 ml-4" />
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="What would you like to research?"
                                    className="flex-1 bg-transparent px-2 py-4 text-lg text-slate-900 placeholder-slate-400 outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary btn-magnetic flex items-center gap-2 disabled:opacity-50"
                                >
                                    <span>{isLoading ? 'Starting...' : 'Research'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Suggestions */}
                    <div className="flex flex-wrap justify-center gap-3 hero-text-reveal-delay-2">
                        <span className="text-sm text-slate-500">Try:</span>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setTopic(s.query)}
                                className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-600 
                                           hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-300"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Stats Section */}
            <section className="py-16 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto reveal">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-0">
                        {stats.map((stat, i) => (
                            <React.Fragment key={i}>
                                <div className="text-center px-8 py-4">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label mt-2">{stat.label}</div>
                                </div>
                                {i < stats.length - 1 && <div className="hidden md:block stats-divider" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 reveal">
                        <p className="text-indigo-400 text-sm font-medium uppercase tracking-wider mb-4">How It Works</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            <span className="word-light">Three steps.</span>{' '}
                            <span className="word-emphasis gradient-text">Zero effort.</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Our AI agent autonomously handles the entire research process—from planning to verification.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 stagger-children">
                        {[
                            {
                                icon: <Sparkles className="w-6 h-6" />,
                                step: "01",
                                title: "Planning",
                                description: "AI analyzes your query and creates a strategic research plan with multiple verification checkpoints."
                            },
                            {
                                icon: <Globe className="w-6 h-6" />,
                                step: "02",
                                title: "Execution",
                                description: "Searches across the web, extracts key data, and synthesizes information from dozens of sources."
                            },
                            {
                                icon: <Shield className="w-6 h-6" />,
                                step: "03",
                                title: "Verification",
                                description: "Cross-references findings, checks for accuracy, and delivers only verified, reliable results."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="glass-card-hover card-lift p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="feature-icon text-indigo-400">
                                        {feature.icon}
                                    </div>
                                    <span className="text-4xl font-bold text-slate-200">{feature.step}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-6 border-t border-slate-100 bg-gradient-to-b from-transparent to-indigo-500/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 reveal">
                        <p className="text-indigo-400 text-sm font-medium uppercase tracking-wider mb-4">Trusted by Teams</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                            Loved by <span className="gradient-text">researchers</span> everywhere
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 stagger-children">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card card-lift">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 relative z-10">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-slate-900 font-medium">{t.author}</div>
                                        <div className="text-slate-500 text-sm">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 reveal">
                        <p className="text-indigo-400 text-sm font-medium uppercase tracking-wider mb-4">Pricing</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Start <span className="gradient-text">free</span>, scale as you grow
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            No credit card required. Get started with 10 free research queries.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 reveal">
                        {/* Free Plan */}
                        <div className="glass-card-hover p-8 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">$0</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-3 flex-1">
                                {["10 research queries/month", "Basic verification", "Email support"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-600">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={scrollToSearch} className="w-full btn-secondary mt-6">
                                Get Started Free
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="glass-card-hover p-8 flex flex-col relative border-indigo-500/30">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-medium text-white">
                                Most Popular
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold gradient-text">$29</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-3 flex-1">
                                {["Unlimited research queries", "Advanced verification", "Priority support", "API access", "Team collaboration"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-600">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={scrollToSearch} className="w-full btn-primary btn-magnetic mt-6">
                                <span>Start Pro Trial</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto reveal">
                    <div className="cta-gradient rounded-3xl p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Ready to transform your research?
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto mb-8">
                            Join thousands of researchers who are saving hours every week with Nexus AI.
                        </p>
                        <button onClick={scrollToSearch} className="btn-primary btn-magnetic text-lg !px-8 !py-4">
                            <span>Start Researching Now</span>
                            <ArrowRight className="w-5 h-5 inline-block ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-lg font-bold gradient-text">Nexus</span>
                            </div>
                            <p className="text-slate-500 text-sm">
                                AI-powered research that delivers verified insights in seconds.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-medium mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><button onClick={scrollToFeatures} className="hover:text-slate-900 transition-colors">Features</button></li>
                                <li><button onClick={scrollToPricing} className="hover:text-slate-900 transition-colors">Pricing</button></li>
                                <li><button onClick={() => setShowDocs(true)} className="hover:text-slate-900 transition-colors">Documentation</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-medium mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><button onClick={() => alert('About page coming soon!')} className="hover:text-slate-900 transition-colors">About</button></li>
                                <li><button onClick={() => alert('Blog coming soon!')} className="hover:text-slate-900 transition-colors">Blog</button></li>
                                <li><button onClick={() => alert('Careers page coming soon!')} className="hover:text-slate-900 transition-colors">Careers</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 font-medium mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><button onClick={() => alert('Privacy policy coming soon!')} className="hover:text-slate-900 transition-colors">Privacy</button></li>
                                <li><button onClick={() => alert('Terms of service coming soon!')} className="hover:text-slate-900 transition-colors">Terms</button></li>
                                <li><button onClick={() => window.location.href = 'mailto:contact@nexus.ai'} className="hover:text-slate-900 transition-colors">Contact</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
                        <span className="text-sm text-slate-500">© 2026 Nexus AI. All rights reserved.</span>
                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Sign In Modal */}
            <Modal isOpen={showSignIn} onClose={() => setShowSignIn(false)} title="Welcome back">
                <form onSubmit={(e) => { e.preventDefault(); alert('Sign in coming soon!'); setShowSignIn(false); }} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="modal-input pl-11"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="modal-input pl-11"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full btn-primary btn-magnetic mt-6">
                        <span>Sign In</span>
                    </button>
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button type="button" className="text-indigo-400 hover:text-indigo-300">Sign up</button>
                    </p>
                </form>
            </Modal>

            {/* Docs Modal */}
            <Modal isOpen={showDocs} onClose={() => setShowDocs(false)} title="Documentation">
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Get started with Nexus AI in minutes. Our documentation covers everything you need.
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: "Quick Start Guide", desc: "Get up and running in 5 minutes" },
                            { title: "API Reference", desc: "Full API documentation" },
                            { title: "Examples", desc: "Sample queries and use cases" },
                        ].map((doc, i) => (
                            <button
                                key={i}
                                onClick={() => alert(`${doc.title} coming soon!`)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                    <div className="text-left">
                                        <div className="text-slate-900 font-medium">{doc.title}</div>
                                        <div className="text-slate-500 text-sm">{doc.desc}</div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default App;
