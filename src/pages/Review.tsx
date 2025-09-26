import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
// ADDED: Missing imports for Select/Label components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Label } from "@/components/ui/label"; 
import { 
  FileText, 
  Presentation, 
  Video, 
  BookOpen, 
  Download, 
  Edit, 
  Check, 
  RotateCcw,
  ArrowLeft,
  Globe,
  Clock,
  Users
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from "firebase/app";

// --- TYPE DEFINITIONS for AI Output ---
interface CourseOutline {
    module: string;
    lessons: string[];
    duration: string;
}

interface Quiz {
    question: string;
    options: string[];
    correctIndex: number; // Corrected property name
    explanation: string;
}

interface GeneratedCourseData {
    outline: CourseOutline[];
    fullContent: string;
    quizzes: Quiz[];
    videoScript: string;
}

interface LessonContent {
    fullContent: string;
    videoScript: string;
}

// NEW TYPE: Expected structure from the translation function response
interface TranslationResponse {
    success: boolean;
    translatedContent: string; // The translated JSON string from the Cloud Function
}
// ------------------------------------

const app = getApp();
const functions = getFunctions(app);
// Typed callable function: fixes Property 'translatedContent' does not exist on type 'unknown'
const translateCourseContent = httpsCallable<{content: string, targetLanguage: string}, TranslationResponse>(functions, 'translateCourseContent');

const languages = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "ja", label: "Japanese" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "hi", label: "Hindi" },
];

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
  
  const topic = searchParams.get("topic") || "Sample Course";
  const format = searchParams.get("format") || "pdf";
  const initialLanguageCode = searchParams.get("language") || "en";

  const [courseData, setCourseData] = useState<GeneratedCourseData | null>(null);
  const [currentLanguageCode, setCurrentLanguageCode] = useState(initialLanguageCode);
  const [translatedContent, setTranslatedContent] = useState<LessonContent>({ fullContent: "", videoScript: "" });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [contentError, setContentError] = useState("");
  
  const currentLanguageName = languages.find(l => l.value === currentLanguageCode)?.label || "English";
  const FormatIcon = formatIcons[format as keyof typeof formatIcons] || FileText;

  // --- CONTENT LOADING ---
  useEffect(() => {
    const dataString = localStorage.getItem('generatedCourseData');
    if (dataString) {
      try {
        const data: GeneratedCourseData = JSON.parse(dataString);
        setCourseData(data);
        // Set English content as initial display content
        setTranslatedContent({ fullContent: data.fullContent, videoScript: data.videoScript });
        localStorage.removeItem('generatedCourseData'); // Clean up temporary storage
      } catch (e) {
        setContentError("Error loading course data from storage. Please regenerate.");
        setCourseData(null);
      }
    } else {
      // NOTE: This fallback data is here for display only if localStorage is empty
      // In a real app, you'd fetch it from Firestore/DB.
      setCourseData({
        outline: [{module: "Introduction to Digital Payments (EN)", lessons: ["L1", "L2"], duration: "45 minutes"}],
        fullContent: "Sample lesson content goes here.",
        quizzes: [{question: "Sample Q (EN)", options: ["A", "B", "C"], correctIndex: 0, explanation: "Sample E"}],
        videoScript: "Sample script."
      } as GeneratedCourseData);
      setTranslatedContent({fullContent: "Sample lesson content goes here.", videoScript: "Sample script."});

      // setContentError("No course data found. Please go back and generate a course.");
    }
  }, []);

  // --- DYNAMIC TRANSLATION FUNCTION ---
  const handleTranslateCourse = useCallback(async (targetCode: string) => {
    if (!courseData) return;
    
    setIsTranslating(true);
    const targetName = languages.find(l => l.value === targetCode)?.label || "English";
    toast({ title: "Translation Started", description: `Translating content to ${targetName}...` });

    try {
      // 1. Prepare Content for Translation (Outline titles, Full Content, Quizzes)
      const contentToTranslate = JSON.stringify({
        outlineTitles: courseData.outline.map(m => m.module),
        fullContent: courseData.fullContent,
        quizQuestions: courseData.quizzes.map(q => ({ question: q.question, options: q.options, explanation: q.explanation })),
        videoScript: courseData.videoScript
      });

      const response = await translateCourseContent({
        content: contentToTranslate,
        targetLanguage: targetName
      });

      // The translatedContent property is now correctly typed on response.data
      const translatedData = JSON.parse(response.data.translatedContent);

      // 2. Update state with translated content
      const newOutline: CourseOutline[] = courseData.outline.map((module, index) => ({
        ...module,
        module: translatedData.outlineTitles[index] || module.module
      }));

      setCourseData(prev => ({
          ...prev!,
          outline: newOutline,
          quizzes: translatedData.quizQuestions.map((q: any, index: number) => ({
              // Retain original correct index, but update text
              correctIndex: prev!.quizzes[index].correctIndex, 
              question: q.question,
              options: q.options,
              explanation: q.explanation,
          })),
      }));

      setTranslatedContent({
        fullContent: translatedData.fullContent,
        videoScript: translatedData.videoScript
      });
      setCurrentLanguageCode(targetCode);
      toast({ title: "Translation Complete", description: `Successfully translated to ${targetName}.` });

    } catch (error) {
        console.error("Translation failed:", error);
        toast({ title: "Translation Error", description: "Failed to translate content. See console for details.", variant: "destructive" });
    } finally {
        setIsTranslating(false);
    }
  }, [courseData, toast]);


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
        description: `Your course has been exported as ${exportFormat.toUpperCase()} in ${currentLanguageName}.`,
      });
    }, 2000);
  };
  
  if (contentError) {
      return <div className="min-h-screen flex items-center justify-center"><Card><CardHeader><CardTitle>Loading Error</CardTitle><CardDescription className="text-red-500">{contentError}</CardDescription></CardHeader><CardContent><Button onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4 mr-2" />Go to Dashboard</Button></CardContent></Card></div>;
  }

  if (!courseData) {
      return <div className="min-h-screen flex items-center justify-center"><Card><CardTitle>Loading...</CardTitle></Card></div>;
  }

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
                  <Badge variant="outline" className="text-sm">
                    <Globe className="w-3 h-3 mr-1" />
                    {currentLanguageName}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector for Translation */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="translate-select" className="text-sm font-medium">Translate to:</Label>
                <Select onValueChange={handleTranslateCourse} value={currentLanguageCode} disabled={isTranslating}>
                    <SelectTrigger id="translate-select" className="w-[150px]">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} disabled={lang.value === currentLanguageCode}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={() => handleExport(format)} disabled={isExporting || isTranslating}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : `Export (${currentLanguageName})`}
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
                  {courseData.outline.map((module, index) => (
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
                  <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md text-sm">
                      {translatedContent.fullContent || "Content not available."}
                  </pre>
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
                  {courseData.quizzes.map((quiz, index) => (
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
                                  optionIndex === quiz.correctIndex 
                                    ? 'bg-success/10 border-success text-success-foreground' 
                                    : 'bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span>{option}</span>
                                  {optionIndex === quiz.correctIndex && (
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
                          {/* Replaced 'X' icon with a component placeholder or import if needed */}
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
                    value={translatedContent.videoScript}
                    onChange={(e) => setTranslatedContent(prev => ({...prev, videoScript: e.target.value}))}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md text-sm">
                      {translatedContent.videoScript || "Video script not available for this format."}
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