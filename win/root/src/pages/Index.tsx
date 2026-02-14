import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Link } from "react-router-dom";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <NavBar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-float-slow" />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/20 rounded-full animate-float-medium" 
                         style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-float-fast" 
                         style={{ animationDelay: '2s' }} />
                    <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-purple-400/20 rounded-full animate-float-slow" 
                         style={{ animationDelay: '0.5s' }} />
                </div>

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                            <span className="gradient-text">Doughmination System</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in leading-relaxed">
                            A UK-based company providing accessible solutions for gamers with various impediments and disabilities
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Statement Section */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border/50 backdrop-blur-sm">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                    <svg 
                                        className="w-8 h-8 text-primary" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
                                    Our Mission
                                </h2>
                            </div>
                            
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
                                Enabling accessibility in games where main developers may fail to help their users. 
                                We believe every gamer deserves the tools and support to fully experience their favorite games.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">What We Do</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We create innovative solutions that bridge the accessibility gap in gaming
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Accessibility Tools */}
                        <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
                            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <svg 
                                    className="w-8 h-8 text-primary" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Accessibility Tools</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Custom solutions designed to make gaming accessible for everyone, regardless of physical limitations
                            </p>
                        </div>

                        {/* Community Support */}
                        <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
                            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <svg 
                                    className="w-8 h-8 text-primary" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Community Support</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A welcoming community where gamers can connect, share experiences, and support each other
                            </p>
                        </div>

                        {/* Innovation */}
                        <div className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
                            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <svg 
                                    className="w-8 h-8 text-primary" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Innovation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Pushing boundaries with creative solutions where traditional developers haven't addressed accessibility needs
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                <span className="gradient-text">Our Values</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <svg 
                                        className="w-6 h-6 text-primary" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Inclusive</h3>
                                <p className="text-muted-foreground">
                                    Creating solutions that work for everyone, regardless of ability
                                </p>
                            </div>

                            <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <svg 
                                        className="w-6 h-6 text-primary" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Innovative</h3>
                                <p className="text-muted-foreground">
                                    Developing creative solutions where others haven't
                                </p>
                            </div>

                            <div className="bg-card/50 rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <svg 
                                        className="w-6 h-6 text-primary" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Passionate</h3>
                                <p className="text-muted-foreground">
                                    Driven by love for gaming and helping our community
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8 md:p-12 border border-primary/20 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                <span className="gradient-text">Ready to Join Us?</span>
                            </h2>
                            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Be part of our mission to make gaming accessible for everyone. Connect with our community and discover how we can help you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link 
                                    to="/team" 
                                    className="group px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                                >
                                    Meet the Team
                                    <svg 
                                        className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M14 5l7 7m0 0l-7 7m7-7H3" 
                                        />
                                    </svg>
                                </Link>
                                <Link 
                                    to="/contact" 
                                    className="px-8 py-3 bg-card hover:bg-card/80 border border-border rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* CSS for custom animations */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    33% {
                        transform: translateY(-20px) translateX(10px);
                    }
                    66% {
                        transform: translateY(-10px) translateX(-10px);
                    }
                }

                @keyframes float-medium {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    33% {
                        transform: translateY(-30px) translateX(-15px);
                    }
                    66% {
                        transform: translateY(-15px) translateX(15px);
                    }
                }

                @keyframes float-fast {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    33% {
                        transform: translateY(-40px) translateX(20px);
                    }
                    66% {
                        transform: translateY(-20px) translateX(-20px);
                    }
                }

                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }

                .animate-float-medium {
                    animation: float-medium 6s ease-in-out infinite;
                }

                .animate-float-fast {
                    animation: float-fast 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Index;