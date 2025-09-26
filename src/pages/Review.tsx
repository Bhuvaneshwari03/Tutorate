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
import { useToast } from "@/hooks/use-toast"; // Assuming this is your custom hook for toasts

interface Lesson {
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

interface GeneratedContent {
  outline: Lesson[];
  quizzes: Quiz[];
  script: string;
  content: string; // Used for generic Lesson Content
}

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

const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get query parameters
  const topic = searchParams.get("topic") || "Sample Course";
  const format = searchParams.get("format") || "pdf";
  const language = searchParams.get("language") || "en";
  const difficulty = searchParams.get("difficulty") || "intermediate";
  
  const FormatIcon = formatIcons[format as keyof typeof formatIcons] || FileText;

  // Initial state will be empty or use a default to ensure types are correct
  const [courseOutline, setCourseOutline] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [videoScript, setVideoScript] = useState<string>("");
  const [lessonContent, setLessonContent] = useState<string>("");

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const languageLabel = (lang: string) => {
    switch(lang) {
      case "en": return "English";
      case "hi": return "Hindi";
      case "es": return "Spanish";
      case "fr": return "French";
      case "de": return "German";
      case "pt": return "Portuguese";
      case "ar": return "Arabic";
      case "zh": return "Chinese";
      default: return lang.toUpperCase();
    }
  }

  // Effect to load generated content on component mount
  useEffect(() => {
    const LOCAL_STORAGE_KEY = 'aiCourseCreatorData';
    const loadContent = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const content: GeneratedContent = parsedData.currentGeneratedContent;
          
          if (content) {
            setCourseOutline(content.outline);
            setQuizzes(content.quizzes);
            setVideoScript(content.script);
            setLessonContent(content.content);
          } else {
             // Handle case where content is not in localStorage (e.g., direct navigation)
             // You might want to navigate back or display an error
             toast({ title: "Error", description: "No generated content found.", variant: "destructive" });
          }
        }
      } catch (error) {
        console.error("Error loading content from localStorage:", error);
        toast({ title: "Error", description: "Could not load course data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [toast]);

  // --- Handlers (Simplified, assuming data is modified directly in state) ---

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSave = () => {
    setEditingSection(null);
    toast({
      title: "Changes Saved",
      description: "Your modifications have been saved successfully.",
    });
    // In a real app, you would save the modified state back to the server/storage
  };

  const handleRegenerate = (section: string) => {
    toast({
      title: "Regenerating Content",
      description: `AI is regenerating the ${section} section...`,
    });
    // Simulate regeneration (In a real app, this would be another API call)
    setTimeout(() => {
      toast({
        title: "Content Regenerated",
        description: `The ${section} section has been updated.`,
      });
      // A real API call would update the state with new content here
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

  // --- Loading State Render ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="flex flex-col items-center space-y-4">
          <RotateCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading generated content...</p>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
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
                    {languageLabel(language)}
                  </Badge>
                  <Badge variant="outline">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
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

          {/* --- Tabs Content: Outline --- */}
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

          {/* --- Tabs Content: Lesson Content (Using Dynamic Data) --- */}
          <TabsContent value="content" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Lesson Content</CardTitle>
                    <CardDescription>Detailed content for each lesson in the **{formatLabels[format as keyof typeof formatLabels]}** format.</CardDescription>
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
                 {editingSection === "content" ? (
                    <Textarea
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                 ) : (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lessonContent }} />
                 )}
                
                {/* Edit/Save/Cancel buttons for content */}
                {editingSection === "content" && (
                    <div className="flex space-x-2 mt-4 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Check className="w-4 h-4 mr-1" />
                            Save Content
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tabs Content: Quizzes (Using Dynamic Data) --- */}
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
                  
                  {/* Edit/Save/Cancel buttons for quizzes (not fully implemented due to complexity) */}
                  {editingSection === "quizzes" && (
                    <div className="flex space-x-2 mt-4 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Check className="w-4 h-4 mr-1" />
                            Save Quizzes
                        </Button>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tabs Content: Video Script (Using Dynamic Data) --- */}
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
