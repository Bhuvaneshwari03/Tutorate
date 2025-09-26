import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Globe, FileText, Presentation, Video, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- New Imports ---
import CardNav from "@/components/CardNav"; // Import the navigation component
import myLogo from "/logo.svg"; // Make sure you have a logo.svg in your /public folder

const Index = () => {
  const navigate = useNavigate();

  // --- Data for CardNav ---
  const navItems = [
    {
      label: "Features",
      bgColor: "#f0f4ff", // Light blue
      textColor: "#335d9d",
      links: [
        { label: "AI Generation", href: "#features", ariaLabel: "View AI Generation Features" },
        { label: "Multi-Language", href: "#features", ariaLabel: "View Multi-Language Features" },
        { label: "Export Formats", href: "#formats", ariaLabel: "View Export Formats" },
      ],
    },
    {
      label: "How It Works",
      bgColor: "#f0fff4", // Light green
      textColor: "#339d5d",
      links: [
        { label: "Simple Steps", href: "#how-it-works", ariaLabel: "See How It Works" },
        { label: "Watch Demo", href: "#", ariaLabel: "Watch a Demo Video" },
      ],
    },
    {
      label: "Get Started",
      bgColor: "#fff4f0", // Light orange
      textColor: "#9d5d33",
      links: [
        { label: "Sign Up Free", href: "/login", ariaLabel: "Sign Up for Free" },
        { label: "View Pricing", href: "#", ariaLabel: "View Pricing Plans" },
      ],
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI creates comprehensive courses from just a topic"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Generate courses in 8+ languages with automatic translation"
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description: "PDF, PowerPoint, Micro-lessons, and Video Scripts"
    },
    {
      icon: Zap,
      title: "Instant Creation",
      description: "Complete course materials generated in minutes"
    }
  ];

  const steps = [
    { step: "01", title: "Login", description: "Sign in with email or Google account" },
    { step: "02", title: "Enter Topic", description: "Describe your course topic and preferences" },
    { step: "03", title: "AI Generation", description: "AI creates outline, content, quizzes, and scripts" },
    { step: "04", title: "Review & Export", description: "Edit content and export in your preferred format" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      
      {/* --- Add CardNav component here --- */}
      <CardNav 
        logo={myLogo}
        logoAlt="AI Course Creator Logo"
        items={navItems}
        baseColor="#ffffff"
        menuColor="#111827"
        buttonBgColor="#f0f0f0"
        buttonTextColor="#111827"
      />
      
      {/* Hero Section */}
      {/* pt-24 adds padding to the top to prevent content from being hidden behind the nav */}
      <section className="relative overflow-hidden pt-24">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-6 bg-gradient-to-r from-primary to-info text-primary-foreground">
              ✨ AI Course Creator - Beta
            </Badge>
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              Spark the Future of{" "}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Learning
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform any topic into a complete educational experience. 
              Generate course outlines, lesson content, quizzes, and video scripts instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-primary to-info hover:opacity-90 text-primary-foreground"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                <Video className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional educational content
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-info rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create your complete course
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-info rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Formats */}
      <section id="formats" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Export in Your Preferred Format</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the format that works best for your teaching style
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, name: "PDF Course", desc: "Complete course documentation" },
              { icon: Presentation, name: "PowerPoint", desc: "Ready-to-present slides" },
              { icon: BookOpen, name: "Micro-lessons", desc: "Bite-sized learning modules" },
              { icon: Video, name: "Video Script", desc: "Narration and slide cues" }
            ].map((format, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <format.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-lg">{format.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{format.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto shadow-2xl bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Teaching?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of educators creating amazing courses with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-success" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-success" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-success" />
                  Instant setup
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-primary to-info hover:opacity-90 text-primary-foreground"
              >
                Create Your First Course
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-info rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">AI Course Creator</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Empowering educators with AI-powered course creation tools
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;