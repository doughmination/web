import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="gradient-text">Meet The Team</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in leading-relaxed">
              The passionate minds behind Doughmination System
            </p>
          </div>
        </div>
      </section>

      {/* Team Member Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Team Member Card */}
            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/50 backdrop-blur-sm mb-12 hover:border-primary/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center max-w-xl mx-auto">
                
                {/* Profile Image */}
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <img 
                    src="/team/clove.png" 
                    alt="Clove Twilight"
                    className="relative w-48 h-48 rounded-full object-cover border-4 border-primary/20 shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Name & Title */}
                <h2 className="text-4xl font-bold mb-3 gradient-text">
                  Clove Twilight
                </h2>
                
                {/* Role Badges */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    CEO & Founder
                  </span>
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 font-semibold text-sm">
                    Director
                  </span>
                </div>

                {/* Bio */}
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Founder and CEO of Doughmination System, dedicated to creating inclusive gaming experiences 
                  for plural systems and their headmates. With a passion for accessibility and community-driven 
                  development, Clove is building tools that ensure everyone can enjoy gaming together.
                </p>

                {/* Expertise Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Plural Accessibility
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Game Modding
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Community Building
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Inclusive Design
                    </span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-3 w-full">
                  <a 
                    href="https://doughmination.co.uk" 
                    className="w-full px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    View Portfolio
                  </a>
                  
                  <div className="flex gap-3 justify-center">
                    <a 
                      href="https://www.linkedin.com/in/estrogen/" 
                      className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://x.com/DoughminCEO" 
                      className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://github.com/Doughmination" 
                      className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Project Section */}
            <div className="mb-12">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                  Current Project
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Building inclusive gaming experiences for plural systems
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                {/* Main Project Card */}
                <div className="group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-24 h-24 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-2 rounded-full bg-orange-500/90 text-white text-sm font-semibold backdrop-blur-sm">
                        In Development
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      Plural Inclusive Gaming Mod
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                      A groundbreaking mod designed to enable plural systems and their headmates to seamlessly 
                      share and enjoy gaming experiences together. This project aims to bridge the accessibility 
                      gap that currently exists in gaming for plural individuals, allowing different headmates to 
                      participate in games with their own identities and preferences.
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Identity Management</h4>
                          <p className="text-sm text-muted-foreground">
                            Individual profiles for each headmate with customizable settings and preferences
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Quick Switching</h4>
                          <p className="text-sm text-muted-foreground">
                            Seamless transitions between headmates without disrupting gameplay
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Community-Driven Development</h4>
                          <p className="text-sm text-muted-foreground">
                            Built with feedback and input from the plural community
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        Plural Accessibility
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        Game Modding
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        Identity Support
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        Early Stage
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Project Status</h4>
                          <p className="text-sm text-muted-foreground">
                            Currently in early development and seeking community feedback. We're in the kickstart 
                            phase and actively building the foundation for this important accessibility tool.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision Section */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8 md:p-12 border border-primary/20">
              <div className="max-w-3xl mx-auto text-center">
                <svg className="w-16 h-16 mx-auto mb-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-3xl font-bold mb-4">Vision & Mission</h3>
                <p className="text-lg text-muted-foreground leading-relaxed italic mb-4">
                  "Plural systems deserve to experience gaming in ways that honor every headmate's identity and preferences. 
                  We're building tools that recognize and celebrate plurality in gaming, ensuring that switching between 
                  headmates doesn't mean leaving behind your progress, your settings, or your sense of self."
                </p>
                <p className="text-primary font-semibold">— Clove Twilight</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;