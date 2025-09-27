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
  Users,
  Sparkles
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Assuming this is your custom hook for toasts
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import DOMPurify from 'dompurify'; // You will need to install this: npm install dompurify

// --- Configuration ---
// 🚨 REPLACE THIS WITH YOUR DEPLOYED FUNCTION URL (The one for regeneration)
const REGENERATE_FUNCTION_URL = "https://<your-region>-tutorate-2025.cloudfunctions.net/regenerateContent";
const LOCAL_STORAGE_KEY = 'aiCourseCreatorData';

// --- Interfaces (Must match Dashboard) ---
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

interface GeneratedContent {
    outline: CourseOutline[];
    quizzes: Quiz[];
    script: string;
    content: string;
}

const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
];

const formatLabels = {
  pdf: "PDF Course",
  ppt: "PowerPoint Presentation", 
  micro: "Micro-lessons",
  video: "Video Script"
};

// --- Component ---

const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const topic = searchParams.get("topic") || "Sample Course";
  const format = searchParams.get("format") || "pdf";
  const language = searchParams.get("language") || "en";
  const difficulty = searchParams.get("difficulty") || "intermediate";

  // Data States
  const [courseOutline, setCourseOutline] = useState<CourseOutline[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [videoScript, setVideoScript] = useState<string>("");
  const [lessonContent, setLessonContent] = useState<string>("");
  
  // UI States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState<string>("");
  const [exportLanguage, setExportLanguage] = useState<string>(language);


  // Helper to safely render HTML content
  const renderContent = (htmlContent: string) => ({
    __html: DOMPurify.sanitize(htmlContent) // Use DOMPurify for security
  });
  
  const getSectionContent = (section: string) => {
    switch(section) {
      case 'outline': return courseOutline;
      case 'quizzes': return quizzes;
      case 'script': return videoScript;
      case 'content': return lessonContent;
      default: return null;
    }
  }

  // --- Data Loading Effect ---
  useEffect(() => {
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
            // If content is missing, navigate back or show error
            toast({ title: "Error", description: "No generated content found.", variant: "destructive" });
             navigate("/dashboard");
          }
        } else {
             navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading content from localStorage:", error);
        toast({ title: "Error", description: "Could not load course data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [toast, navigate]);

  // --- Handlers ---
  
  const handleEdit = (section: string) => {
    setEditingSection(section);
  };
  
  const handleRegenerateClick = (section: string) => {
    setRegeneratePrompt(""); // Clear prompt
    setEditingSection(section);
    setIsRegenerating(true);
  };

  const handleSave = (section: string) => {
    setEditingSection(null);
    setIsRegenerating(false);
    toast({
      title: "Changes Saved",
      description: `Your modifications to the ${section} section have been saved locally.`,
    });
    // In a real app, you would dispatch a local storage or database update action here
  };
  
  const handleCancelRegenerate = () => {
    setRegeneratePrompt("");
    setIsRegenerating(false);
    setEditingSection(null);
  };

  const handleConfirmRegenerate = async (section: string) => {
    const currentContent = getSectionContent(section);
    if (!regeneratePrompt || !currentContent) return;

    setIsRegenerating(false); // Hide the prompt field
    setEditingSection(null); // Lock the UI
    toast({
        title: "Regenerating...",
        description: `AI is applying changes to the ${section} section. Please wait.`,
    });
    
    try {
        const response = await fetch(REGENERATE_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                section: section,
                currentContent: currentContent,
                prompt: regeneratePrompt,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch regenerated content.');
        }

        const newContent = await response.json();
        
        // Update the respective state with the new content
        switch (section) {
            case 'outline': setCourseOutline(newContent); break;
            case 'quizzes': setQuizzes(newContent); break;
            case 'script': setVideoScript(newContent); break;
            case 'content': setLessonContent(newContent); break;
        }

        toast({ title: "Success", description: `${section} content updated based on your prompt.` });

    } catch (error) {
        console.error("Regeneration failed:", error);
        toast({ title: "Error", description: `Failed to regenerate ${section}: ${error.message}`, variant: "destructive" });
    }
  };


  const handleExport = async () => {
    setIsExporting(true);
    
    // --- Step 1: Handle Language Translation if needed ---
    let finalContent = getSectionContent("content");
    let finalScript = getSectionContent("script");
    const targetLanguage = languages.find(l => l.value === exportLanguage)?.label || "English";

    if (exportLanguage !== language) {
        toast({ title: "Translation in Progress", description: `Translating all content to ${targetLanguage}...` });
        try {
            // Translate Content
            let contentResponse = await fetch(REGENERATE_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: 'content',
                    currentContent: { content: lessonContent },
                    newLanguage: targetLanguage,
                }),
            });
            let contentResult = await contentResponse.json();
            finalContent = contentResult.content || finalContent;

            // Translate Script
            let scriptResponse = await fetch(REGENERATE_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: 'script',
                    currentContent: { script: videoScript },
                    newLanguage: targetLanguage,
                }),
            });
            let scriptResult = await scriptResponse.json();
            finalScript = scriptResult.script || finalScript;

            toast({ title: "Translation Complete", description: `Content successfully prepared in ${targetLanguage}.` });

        } catch (error) {
            toast({ title: "Translation Failed", description: "Could not translate content. Exporting original.", variant: "destructive" });
        }
    }

    // --- Step 2: Prepare and Download File (Simulation) ---
    const fileContent = `
    Course: ${topic}
    Format: ${formatLabels[format as keyof typeof formatLabels]}
    Language: ${targetLanguage}
    Difficulty: ${difficulty.toUpperCase()}
    
    --- LESSON CONTENT ---
    ${finalContent}

    --- VIDEO SCRIPT ---
    ${finalScript}
    `;

    // Simulate file download
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${topic.replace(/\s/g, '_')}_${exportLanguage}.${format === 'pdf' ? 'txt' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setIsExporting(false);
    toast({
      title: "Export Complete",
      description: `Your course has been exported as a file for ${targetLanguage}.`,
    });
  };

  const languageLabel = (lang: string) => {
    const foundLang = languages.find(l => l.value === lang);
    return foundLang ? foundLang.label : lang.toUpperCase();
  }

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

  // --- Regeneration Prompt UI Component ---
  const RegenerationPrompt = ({ section, currentContent, onCancel, onConfirm, isAwaitingInput }) => {
    if (!isAwaitingInput || editingSection !== section) return null;

    return (
        <Card className="mt-4 border-2 border-warning shadow-md">
            <CardHeader className="py-3">
                <CardTitle className="text-base text-warning-foreground">Regeneration Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    placeholder={`Tell the AI exactly what you want to change in the ${section} (e.g., 'Add a module on blockchain basics' or 'Simplify the quiz questions').`}
                    value={regeneratePrompt}
                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                    rows={4}
                />
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => onConfirm(section)} 
                        disabled={!regeneratePrompt}
                    >
                        <Sparkles className="w-4 h-4 mr-1" /> Regenerate & Apply
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  };
  
  // --- Export Dialog Component (Simplified for inline presentation) ---
  const ExportDialog = () => {
    if (!isExporting) return null;

    return (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Export Course</CardTitle>
                    <CardDescription>Select the final output language.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={setExportLanguage} defaultValue={exportLanguage}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select export language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    <div className="flex items-center space-x-2">
                                        <Globe className="w-4 h-4" />
                                        <span>{lang.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Current Format: **{formatLabels[format as keyof typeof formatLabels]}**. File will be saved as a plain text file.
                    </p>
                    <div className="flex justify-between space-x-2">
                        <Button variant="outline" onClick={() => setIsExporting(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={isRegenerating || isExporting}>
                            <Download className="w-4 h-4 mr-2" />
                            {exportLanguage !== language ? "Translate & Download" : "Download"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Card>
    );
  };

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Export Dialog */}
      <ExportDialog />

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
              <Button onClick={() => setIsExporting(true)} disabled={isExporting || isRegenerating}>
                <Download className="w-4 h-4 mr-2" />
                Export
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

          {/* --- Tab Content: Outline --- */}
          <TabsContent value="outline" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Course Outline</CardTitle>
                    <CardDescription>Review and edit the generated course structure</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerateClick("outline")} disabled={isRegenerating}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("outline")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit (Local)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Regeneration Prompt UI */}
                <RegenerationPrompt 
                    section="outline" 
                    currentContent={courseOutline}
                    onCancel={handleCancelRegenerate}
                    onConfirm={handleConfirmRegenerate}
                    isAwaitingInput={isRegenerating}
                />

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
                        {editingSection === "outline" && (
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                                <Button size="sm" onClick={() => handleSave("outline")}><Check className="w-4 h-4 mr-1" /> Save</Button>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tab Content: Lesson Content (Improved UI/UX) --- */}
          <TabsContent value="content" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Lesson Content</CardTitle>
                    <CardDescription>Detailed content for each lesson formatted for **{formatLabels[format as keyof typeof formatLabels]}**.</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerateClick("content")} disabled={isRegenerating}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("content")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit (Local)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RegenerationPrompt 
                    section="content" 
                    currentContent={lessonContent}
                    onCancel={handleCancelRegenerate}
                    onConfirm={handleConfirmRegenerate}
                    isAwaitingInput={isRegenerating}
                />
                
                {editingSection === "content" ? (
                  <Textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose max-w-none p-4 border rounded-md" 
                         dangerouslySetInnerHTML={renderContent(lessonContent)} 
                    />
                )}

                {editingSection === "content" && (
                    <div className="flex space-x-2 mt-4 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                        <Button size="sm" onClick={() => handleSave("content")}><Check className="w-4 h-4 mr-1" /> Save Content</Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tab Content: Quizzes --- */}
          <TabsContent value="quizzes" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Assessment Quizzes</CardTitle>
                    <CardDescription>Interactive questions to test understanding</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRegenerateClick("quizzes")} disabled={isRegenerating}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit("quizzes")}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit (Local)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RegenerationPrompt 
                    section="quizzes" 
                    currentContent={quizzes}
                    onCancel={handleCancelRegenerate}
                    onConfirm={handleConfirmRegenerate}
                    isAwaitingInput={isRegenerating}
                />
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
                        {editingSection === "quizzes" && (
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                                <Button size="sm" onClick={() => handleSave("quizzes")}><Check className="w-4 h-4 mr-1" /> Save</Button>
                            </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Tab Content: Video Script (Improved UI/UX) --- */}
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
                        <Button size="sm" onClick={() => handleSave("script")}>
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleRegenerateClick("script")} disabled={isRegenerating}>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit("script")}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit (Local)
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RegenerationPrompt 
                    section="script" 
                    currentContent={videoScript}
                    onCancel={handleCancelRegenerate}
                    onConfirm={handleConfirmRegenerate}
                    isAwaitingInput={isRegenerating}
                />
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
