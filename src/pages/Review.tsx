import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Presentation, 
  Video, 
  BookOpen, 
  Download, 
  Edit, 
  Check, 
  X, 
  RotateCcw,
  ArrowLeft,
  Globe,
  Clock,
  Users
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CourseOutline {
  module: string;
  lessons: string[];
  duration: string;
}

interface Quiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const topic = searchParams.get("topic") || "Sample Course";
  const format = searchParams.get("format") || "pdf";
  const language = searchParams.get("language") || "en";

  const [courseOutline, setCourseOutline] = useState<CourseOutline[]>([
    {
      module: "Introduction to Digital Payments",
      lessons: [
        "Overview of Digital Payment Systems",
        "Types of Digital Payments",
        "Benefits and Challenges"
      ],
      duration: "45 minutes"
    },
    {
      module: "Security Fundamentals",
      lessons: [
        "Common Security Threats",
        "Encryption and Authentication",
        "Best Practices for Users"
      ],
      duration: "60 minutes"
    },
    {
      module: "Implementation and Compliance",
      lessons: [
        "Regulatory Requirements",
        "Implementation Strategies",
        "Monitoring and Maintenance"
      ],
      duration: "50 minutes"
    }
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      question: "What is the primary purpose of encryption in digital payments?",
      options: [
        "To speed up transactions",
        "To protect sensitive data",
        "To reduce costs",
        "To increase user adoption"
      ],
      correct: 1,
      explanation: "Encryption protects sensitive payment data from unauthorized access during transmission."
    },
    {
      question: "Which of the following is a common security threat in digital payments?",
      options: [
        "Fast processing",
        "User convenience",
        "Phishing attacks",
        "Mobile compatibility"
      ],
      correct: 2,
      explanation: "Phishing attacks are one of the most common threats where attackers try to steal user credentials."
    }
  ]);

  const [videoScript, setVideoScript] = useState(`
## Module 1: Introduction to Digital Payments

### Slide 1: Title Slide
**Narration:** "Welcome to our comprehensive course on Digital Payments Security. I'm your instructor, and today we'll explore the critical aspects of securing digital payment systems."

**Slide Content:** Course title, instructor name, duration

### Slide 2: Course Overview  
**Narration:** "In this course, we'll cover three main areas: understanding digital payment systems, security fundamentals, and implementation strategies."

**Slide Content:** Course outline with three main modules

### Slide 3: What Are Digital Payments?
**Narration:** "Digital payments refer to transactions conducted electronically, without the use of physical cash or checks. This includes credit cards, mobile wallets, and online banking."

**Slide Content:** Definition and examples of digital payments

### Slide 4: Types of Digital Payment Systems
**Narration:** "Let's examine the main types: card-based payments, mobile payments, bank transfers, and digital wallets. Each has unique security considerations."

**Slide Content:** Visual breakdown of payment types
  `);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSave = () => {
    setEditingSection(null);
    toast({
      title: "Changes Saved",
      description: "Your modifications have been saved successfully.",
    });
  };

  const handleRegenerate = (section: string) => {
    toast({
      title: "Regenerating Content",
      description: `AI is regenerating the ${section} section...`,
    });
    // Simulate regeneration
    setTimeout(() => {
      toast({
        title: "Content Regenerated",
        description: `The ${section} section has been updated.`,
      });
    }, 2000);
  };

  const handleExport = async (exportFormat: string) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Your course has been exported as ${exportFormat.toUpperCase()}.`,
      });
    }, 2000);
  };

  const formatLabels = {
    pdf: "PDF Course",
    ppt: "PowerPoint Presentation", 
    micro: "Micro-lessons",
    video: "Video Script"
  };

  const formatIcons = {
    pdf: FileText,
    ppt: Presentation,
    micro: BookOpen,
    video: Video
  };

  const FormatIcon = formatIcons[format as keyof typeof formatIcons] || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold">{topic}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">
                    <FormatIcon className="w-3 h-3 mr-1" />
                    {formatLabels[format as keyof typeof formatLabels]}
                  </Badge>
                  <Badge variant="outline">
                    <Globe className="w-3 h-3 mr-1" />
                    {language === "en" ? "English" : language === "hi" ? "Hindi" : "Other"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => handleExport(format)} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="outline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="outline">Course Outline</TabsTrigger>
            <TabsTrigger value="content">Lesson Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="script">Video Script</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Course Outline</CardTitle>
                    <CardDescription>Review and edit the generated course structure</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerate("outline")}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("outline")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courseOutline.map((module, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Module {index + 1}: {module.module}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {module.duration}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {module.lessons.length} lessons
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Lesson Content</CardTitle>
                    <CardDescription>Detailed content for each lesson</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerate("content")}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("content")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Module 1: Introduction to Digital Payments</h3>
                  <h4>Lesson 1.1: Overview of Digital Payment Systems</h4>
                  <p>
                    Digital payment systems have revolutionized the way we conduct financial transactions. 
                    These systems enable the electronic transfer of money between parties without the need 
                    for physical cash or traditional paper-based methods like checks.
                  </p>
                  <ul>
                    <li>Definition and scope of digital payments</li>
                    <li>Historical evolution from cash to digital</li>
                    <li>Key stakeholders in the digital payment ecosystem</li>
                  </ul>
                  
                  <h4>Lesson 1.2: Types of Digital Payments</h4>
                  <p>
                    Understanding the various types of digital payment methods is crucial for implementing 
                    appropriate security measures. Each type has unique characteristics and security considerations.
                  </p>
                  <ul>
                    <li>Card-based payments (Credit/Debit cards)</li>
                    <li>Mobile wallets and contactless payments</li>
                    <li>Bank transfers and ACH payments</li>
                    <li>Cryptocurrency and blockchain-based payments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Assessment Quizzes</CardTitle>
                    <CardDescription>Interactive questions to test understanding</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerate("quizzes")}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("quizzes")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quizzes.map((quiz, index) => (
                    <Card key={index} className="border-l-4 border-l-info">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="font-medium">{quiz.question}</p>
                          <div className="space-y-2">
                            {quiz.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex} 
                                className={`p-3 rounded-md border ${
                                  optionIndex === quiz.correct 
                                    ? 'bg-success/10 border-success text-success-foreground' 
                                    : 'bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span>{option}</span>
                                  {optionIndex === quiz.correct && (
                                    <Check className="w-4 h-4 text-success ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-info/10 border border-info rounded-md">
                            <p className="text-sm"><strong>Explanation:</strong> {quiz.explanation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="script" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Video Script</CardTitle>
                    <CardDescription>Narration text and slide cues for video production</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {editingSection === "script" ? (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleRegenerate("script")}>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit("script")}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingSection === "script" ? (
                  <Textarea
                    value={videoScript}
                    onChange={(e) => setVideoScript(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md text-sm">
                      {videoScript}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Review;