
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  BookOpen,
  Globe,
  FileText,
  Presentation,
  Video,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Corrected & New Imports ---
import CardNav from "@/components/CardNav";
import DotGrid from "@/components/dot-grid";
import Shuffle from '@/components/Shuffle';

const Index = () => {
  const navigate = useNavigate();

  // --- Data for CardNav ---
  const navItems = [
    {
      label: "Features",
      bgColor: "#f0f4ff",
      textColor: "#335d9d",
      links: [
        {
          label: "AI Generation",
          href: "#features",
          ariaLabel: "View AI Generation Features",
        },
        {
          label: "Multi-Language",
          href: "#features",
          ariaLabel: "View Multi-Language Features",
        },
        {
          label: "Export Formats",
          href: "#formats",
          ariaLabel: "View Export Formats",
        },
      ],
    },
    {
      label: "How It Works",
      bgColor: "#f0fff4",
      textColor: "#339d5d",
      links: [
        {
          label: "Simple Steps",
          href: "#how-it-works",
          ariaLabel: "See How It Works",
        },
        { label: "Watch Demo", href: "#", ariaLabel: "Watch a Demo Video" },
      ],
    },
    {
      label: "Get Started",
      bgColor: "#fff4f0",
      textColor: "#9d5d33",
      links: [
        {
          label: "Sign Up Free",
          href: "/login",
          ariaLabel: "Sign Up for Free",
        },
        { label: "View Pricing", href: "#", ariaLabel: "View Pricing Plans" },
      ],
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description:
        "Advanced AI creates comprehensive courses from just a topic",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description:
        "Generate courses in 8+ languages with automatic translation",
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description: "PDF, PowerPoint, Micro-lessons, and Video Scripts",
    },
    {
      icon: Zap,
      title: "Instant Creation",
      description: "Complete course materials generated in minutes",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Login",
      description: "Sign in with email or Google account",
    },
    {
      step: "02",
      title: "Enter Topic",
      description: "Describe your course topic and preferences",
    },
    {
      step: "03",
      title: "AI Generation",
      description: "AI creates outline, content, quizzes, and scripts",
    },
    {
      step: "04",
      title: "Review & Export",
      description: "Edit content and export in your preferred format",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg,#f8fafc 0%,#e0e7ff 100%)" }}
    >
      {/* Animated DotGrid background for Hero */}
      <div className="absolute top-0 left-0 w-full h-screen z-0 pointer-events-none">
        <DotGrid
          dotSize={4}
          gap={20}
          baseColor="#d1d5db"
          activeColor="#4338ca"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
      {/* Glassmorphism nav */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-50">
        <CardNav
          logo="/logo.svg"
          logoAlt="AI Course Creator Logo"
          items={navItems}
          baseColor="rgba(255,255,255,0.85)"
          menuColor="#111827"
          buttonBgColor="#6366f1"
          buttonTextColor="#fff"
        />
      </div>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen w-full text-center">
        {/* Hero Content (no card background) */}
        <div className="relative z-10 mx-auto max-w-3xl w-full px-6 py-14">
          <Shuffle
            text="The Future Of Learning"
            shuffleDirection="right"
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={1}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover={true}
            respectReducedMotion={true}
            // --- FIX: Added the 3 missing required properties ---
            onShuffleComplete={() => {}}
            colorFrom="#6366f1" // Indigo
            colorTo="#3b82f6" // Blue
          />
          <p className="mb-8 text-xl text-black-600 max-w-2xl mx-auto">
            One line in, a full course out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-indigo-500 to-blue-400 hover:opacity-90 text-white shadow-lg px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg font-semibold rounded-xl border-indigo-200"
            >
              <Video className="w-5 h-5 mr-2 text-indigo-400" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to create professional educational content
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-2xl"
              >
                <CardHeader>
                  <div className="mx-auto w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-indigo-700">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
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
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Four simple steps to create your complete course
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-2xl shadow-lg py-8 px-4"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Formats */}
      <section id="formats" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              Export in Your Preferred Format
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Choose the format that works best for your teaching style
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                name: "PDF Course",
                desc: "Complete course documentation",
              },
              {
                icon: Presentation,
                name: "PowerPoint",
                desc: "Ready-to-present slides",
              },
              {
                icon: BookOpen,
                name: "Micro-lessons",
                desc: "Bite-sized learning modules",
              },
              {
                icon: Video,
                name: "Video Script",
                desc: "Narration and slide cues",
              },
            ].map((format, index) => (
              <Card
                key={index}
                className="text-center shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-2xl"
              >
                <CardHeader>
                  <format.icon className="w-14 h-14 mx-auto mb-4 text-indigo-500" />
                  <CardTitle className="text-lg font-bold text-indigo-700">
                    {format.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm">{format.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto shadow-2xl bg-white/90 backdrop-blur-lg border border-indigo-100 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold text-indigo-700">
                Ready to Transform Your Teaching?
              </CardTitle>
              <CardDescription className="text-lg text-gray-500">
                Join thousands of educators creating amazing courses with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
                  Instant setup
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-indigo-500 to-blue-400 hover:opacity-90 text-white shadow-lg px-8 py-3 text-lg font-semibold rounded-xl"
              >
                Create Your First Course
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-lg py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-indigo-700 text-lg">
              Tutorate
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Empowering educators with AI-powered course creation tools
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

