import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGeneratedContent } from "@/lib/fetchGeneratedContent";
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
  Sparkles,
  Eye,
  EyeOff,
  Save,
  Copy,
  Share2,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// --- Configuration ---
// 🚨 REPLACE WITH YOUR ACTUAL DEPLOYED FUNCTION URLs
const REGENERATE_FUNCTION_URL =
  "https://your-region-your-project.cloudfunctions.net/regenerateContent";
const TRANSLATE_FUNCTION_URL =
  "https://your-region-your-project.cloudfunctions.net/translateContent";
const LOCAL_STORAGE_KEY = "aiCourseCreatorData";

// --- Interfaces ---
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

// Mock data for development/demo (remove when using real backend)
const mockCourseData: GeneratedContent = {
  outline: [
    {
      module: "Introduction to Web Development",
      lessons: ["HTML Basics", "CSS Fundamentals", "JavaScript Introduction"],
      duration: "2 hours",
    },
    {
      module: "Advanced Frontend",
      lessons: ["React Components", "State Management", "API Integration"],
      duration: "3 hours",
    },
  ],
  quizzes: [
    {
      question: "What does HTML stand for?",
      options: [
        "HyperText Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      correct: 0,
      explanation:
        "HTML stands for HyperText Markup Language, which is used to create web pages.",
    },
    {
      question: "Which CSS property is used to change text color?",
      options: ["font-color", "text-color", "color", "background-color"],
      correct: 2,
      explanation:
        "The 'color' property in CSS is used to set the text color of an element.",
    },
  ],
  script: `# Introduction to Web Development - Video Script

## Scene 1: Welcome (0:00 - 0:30)
**[Slide: Welcome screen with course title]**
Hello and welcome to our comprehensive Web Development course! I'm excited to guide you through this journey from beginner to proficient web developer.

## Scene 2: Course Overview (0:30 - 1:15)
**[Slide: Course outline animation]**
In this course, we'll cover everything you need to know about modern web development...

## Scene 3: Getting Started (1:15 - 2:00)
**[Slide: Development environment setup]**
Let's start by setting up your development environment...`,
  content: `<h1>Web Development Fundamentals</h1>

<h2>Chapter 1: Introduction to HTML</h2>
<p>HTML (HyperText Markup Language) is the backbone of every web page. It provides the structure and semantic meaning to web content.</p>

<h3>Key Concepts:</h3>
<ul>
  <li><strong>Elements:</strong> The building blocks of HTML documents</li>
  <li><strong>Tags:</strong> Keywords enclosed in angle brackets</li>
  <li><strong>Attributes:</strong> Additional information about elements</li>
</ul>

<h2>Chapter 2: CSS Styling</h2>
<p>Cascading Style Sheets (CSS) control the presentation and layout of HTML elements.</p>

<h3>CSS Properties:</h3>
<ul>
  <li>Color and Typography</li>
  <li>Layout and Positioning</li>
  <li>Responsive Design</li>
</ul>`,
};

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
];

const formatLabels = {
  pdf: { label: "PDF Course", icon: FileText, color: "text-red-600" },
  ppt: {
    label: "PowerPoint Presentation",
    icon: Presentation,
    color: "text-orange-600",
  },
  micro: { label: "Micro-lessons", icon: BookOpen, color: "text-blue-600" },
  video: { label: "Video Script", icon: Video, color: "text-purple-600" },
};

const Review = () => {
  const navigate = useNavigate();

  // Try to get initial values from query params, or fallback to empty/defaults
  function getInitialParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      topic: params.get("topic") || "",
      format: params.get("format") || "pdf",
      language: params.get("language") || "en",
      difficulty: params.get("difficulty") || "intermediate",
    };
  }
  const [urlParams, setUrlParams] = useState(getInitialParams());

  const { topic, format, language, difficulty } = urlParams;

  // Data States
  const [courseOutline, setCourseOutline] = useState<CourseOutline[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [videoScript, setVideoScript] = useState<string>("");
  const [lessonContent, setLessonContent] = useState<string>("");

  // UI States
  const [activeTab, setActiveTab] = useState("outline");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [exportLanguage, setExportLanguage] = useState(language);
  const [previewMode, setPreviewMode] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [wordCount, setWordCount] = useState({ content: 0, script: 0 });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // --- Real Data Loading from localStorage/Cloud Function ---
  useEffect(() => {
    const loadGeneratedContent = async () => {
      setIsLoading(true);
      try {
        // Fetch from cloud function
        const data = await fetchGeneratedContent({ topic, format, language, difficulty });
        setCourseOutline(Array.isArray(data.outline) ? data.outline : []);
        setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
        setVideoScript(typeof data.script === 'string' ? data.script : '');
        setLessonContent(typeof data.content === 'string' ? data.content : '');

        // Derive a topic/title from several possible sources so the header updates:
        // 1) explicit data.topic or data.title
        // 2) first <h1> inside returned HTML content
        // 3) first module title in the outline
        let returnedTopic: string | null = null;
        if (data.topic && typeof data.topic === 'string') returnedTopic = data.topic;
        else if (data.title && typeof data.title === 'string') returnedTopic = data.title;
        else if (data.content && typeof data.content === 'string') {
          const m = data.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
          if (m && m[1]) returnedTopic = m[1].replace(/<[^>]*>/g, '').trim();
        }
        else if (Array.isArray(data.outline) && data.outline.length) {
          const first = data.outline[0];
          if (first && typeof first.module === 'string') returnedTopic = first.module;
        }

        if (returnedTopic) {
          setUrlParams(prev => ({ ...prev, topic: returnedTopic }));
          try { document.title = `${returnedTopic} — Review`; } catch {}
        }

        showNotification("Course content loaded successfully!");
      } catch (error) {
        console.error("Error loading course content from cloud function:", error);
        showNotification("Error loading course content from server. Using demo data.", "error");
        // Fallback to mock data
        setCourseOutline(mockCourseData.outline);
        setQuizzes(mockCourseData.quizzes);
        setVideoScript(mockCourseData.script);
        setLessonContent(mockCourseData.content);
        // ensure title updates when using demo data
        setUrlParams(prev => ({ ...prev, topic: mockCourseData.outline && mockCourseData.outline.length ? mockCourseData.outline[0].module : prev.topic }));
        try { document.title = `${mockCourseData.outline && mockCourseData.outline.length ? mockCourseData.outline[0].module : "Review"} — Review`; } catch {}
      } finally {
        setIsLoading(false);
      }
    };
    loadGeneratedContent();
  }, [topic, format, language, difficulty]);

  // --- Save content back to localStorage when changes are made ---
  const saveToLocalStorage = (updatedContent: Partial<GeneratedContent>) => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedData = storedData ? JSON.parse(storedData) : {};

      const currentContent: GeneratedContent = {
        outline: courseOutline,
        quizzes: quizzes,
        script: videoScript,
        content: lessonContent,
        ...updatedContent,
      };

      parsedData.currentGeneratedContent = currentContent;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedData));

      console.log("Content saved to localStorage:", currentContent);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      showNotification("Error saving changes locally", "error");
    }
  };

  // Calculate word counts
  useEffect(() => {
    setWordCount({
      content: lessonContent.replace(/<[^>]*>/g, "").split(/\s+/).length,
      script: videoScript.split(/\s+/).length,
    });
  }, [lessonContent, videoScript]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    // If type is not valid, fallback to 'info'
    const validTypes = ["success", "error", "info"];
    const safeType = validTypes.includes(type) ? type : "info";
    setNotification({ message, type: safeType as "success" | "error" | "info" });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setPreviewMode(false);
    setUnsavedChanges(true);
  };

  const handleRegenerateClick = (section) => {
    setRegeneratePrompt("");
    setEditingSection(section);
    setIsRegenerating(true);
  };

  const handleSave = (section) => {
    setEditingSection(null);
    setIsRegenerating(false);
    setUnsavedChanges(false);
    setPreviewMode(true);
    showNotification(
      `${
        section.charAt(0).toUpperCase() + section.slice(1)
      } saved successfully!`
    );
  };

  const handleCancelEdit = () => {
    if (unsavedChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        setEditingSection(null);
        setIsRegenerating(false);
        setRegeneratePrompt("");
        setUnsavedChanges(false);
        setPreviewMode(true);
      }
    } else {
      setEditingSection(null);
      setIsRegenerating(false);
      setRegeneratePrompt("");
      setPreviewMode(true);
    }
  };

  const handleConfirmRegenerate = async (section) => {
    if (!regeneratePrompt) return;

    setIsRegenerating(false);
    setEditingSection(null);
    setIsLoading(true);

    showNotification(`Regenerating ${section} content...`, "info");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showNotification(
        `${
          section.charAt(0).toUpperCase() + section.slice(1)
        } regenerated successfully!`
      );
      setRegeneratePrompt("");
    }, 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    showNotification("Preparing export...", "info");

    // Simulate export process
    setTimeout(() => {
      const fileContent = `Course: ${topic}\nContent: ${lessonContent}\nScript: ${videoScript}`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic.replace(/\s+/g, "_")}.txt`;
      a.click();

      setIsExporting(false);
      setShowExportDialog(false);
      showNotification("Course exported successfully!");
    }, 1500);
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`${section} copied to clipboard!`);
    } catch (err) {
      showNotification("Failed to copy to clipboard", "error");
    }
  };

  const addNewQuiz = () => {
    const newQuiz = {
      question: "New quiz question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
      explanation: "Explanation for the correct answer",
    };
    setQuizzes([...quizzes, newQuiz]);
    setUnsavedChanges(true);
    showNotification("New quiz added!");
  };

  const deleteQuiz = (index) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((_, i) => i !== index));
      setUnsavedChanges(true);
      showNotification("Quiz deleted!");
    }
  };

  const formatIcon = formatLabels[format]?.icon || FileText;
  const formatColor = formatLabels[format]?.color || "text-gray-600";
  const FormatIcon = formatIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" && (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.type === "info" && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold">Export Course</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Choose your export preferences
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Export Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setExportLanguage(lang.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        exportLanguage === lang.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg ${formatColor} bg-current/10`}
                  >
                    <FormatIcon className={`w-5 h-5 ${formatColor}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {formatLabels[format]?.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Content: ~{wordCount.content} words • Script: ~
                      {wordCount.script} words
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowExportDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Course</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-slate-600" />

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topic}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-current/10 ${formatColor}`}
                  >
                    <FormatIcon className={`w-4 h-4 ${formatColor}`} />
                    <span className={`text-sm font-medium ${formatColor}`}>
                      {formatLabels[format]?.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {languages.find((l) => l.value === language)?.label}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    <span className="text-sm font-medium capitalize">
                      {difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}

              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-lg mb-8">
          {[
            { id: "outline", label: "Course Outline", icon: BookOpen },
            { id: "content", label: "Lesson Content", icon: FileText },
            { id: "quizzes", label: "Quizzes", icon: CheckCircle2 },
            { id: "script", label: "Video Script", icon: Video },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Course Outline Tab */}
          {activeTab === "outline" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Course Outline
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Review and customize your course structure
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRegenerateClick("outline")}
                      disabled={isRegenerating || isLoading}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={() => handleEdit("outline")}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {courseOutline.map((module, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Module {index + 1}: {module.module}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{module.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{module.lessons.length} lessons</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid gap-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {lesson}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lesson Content Tab */}
          {activeTab === "content" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Lesson Content
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      ~{wordCount.content} words • Formatted for{" "}
                      {formatLabels[format]?.label}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingSection !== "content" && (
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {previewMode ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span>{previewMode ? "Raw" : "Preview"}</span>
                      </button>
                    )}

                    {editingSection === "content" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleSave("content")}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            copyToClipboard(lessonContent, "Content")
                          }
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateClick("content")}
                          disabled={isRegenerating || isLoading}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <RotateCcw
                            className={`w-4 h-4 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                          <span>Regenerate</span>
                        </button>
                        <button
                          onClick={() => handleEdit("content")}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Regeneration Prompt */}
              {isRegenerating && editingSection === "content" && (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-3">
                    Regeneration Request
                  </h3>
                  <textarea
                    value={regeneratePrompt}
                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                    placeholder="Describe what you want to change in the content..."
                    className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-800 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmRegenerate("content")}
                      disabled={!regeneratePrompt}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6">
                {editingSection === "content" ? (
                  <textarea
                    value={lessonContent}
                    onChange={(e) => {
                      setLessonContent(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full h-96 p-4 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div
                    className={`${
                      previewMode
                        ? "prose prose-lg max-w-none dark:prose-invert"
                        : "font-mono text-sm bg-gray-50 dark:bg-slate-900 p-4 rounded-lg whitespace-pre-wrap"
                    }`}
                  >
                    {previewMode ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: lessonContent }}
                      />
                    ) : (
                      lessonContent
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Assessment Quizzes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {quizzes.length} quiz questions
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={addNewQuiz}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Quiz</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateClick("quizzes")}
                      disabled={isRegenerating || isLoading}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                      <span>Regenerate All</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Regeneration Prompt */}
              {isRegenerating && editingSection === "quizzes" && (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-3">
                    Regeneration Request
                  </h3>
                  <textarea
                    value={regeneratePrompt}
                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                    placeholder="Describe what you want to change in the quizzes (e.g., 'Make questions easier', 'Add more technical questions')..."
                    className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-800 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmRegenerate("quizzes")}
                      disabled={!regeneratePrompt}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {quizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h3>
                        <button
                          onClick={() => deleteQuiz(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {quiz.question}
                      </p>

                      <div className="space-y-2">
                        {quiz.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              optionIndex === quiz.correct
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                                : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                    optionIndex === quiz.correct
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="font-medium">{option}</span>
                              </div>
                              {optionIndex === quiz.correct && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800 dark:text-blue-200">
                              Explanation
                            </h4>
                            <p className="text-blue-700 dark:text-blue-300 mt-1">
                              {quiz.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Script Tab */}
          {activeTab === "script" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Video Script
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      ~{wordCount.script} words • Estimated{" "}
                      {Math.ceil(wordCount.script / 150)} min read time
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingSection === "script" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleSave("script")}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(videoScript, "Script")}
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateClick("script")}
                          disabled={isRegenerating || isLoading}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <RotateCcw
                            className={`w-4 h-4 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                          <span>Regenerate</span>
                        </button>
                        <button
                          onClick={() => handleEdit("script")}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Regeneration Prompt */}
              {isRegenerating && editingSection === "script" && (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-3">
                    Regeneration Request
                  </h3>
                  <textarea
                    value={regeneratePrompt}
                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                    placeholder="Describe changes for the video script (e.g., 'Make it more conversational', 'Add more examples')..."
                    className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-800 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmRegenerate("script")}
                      disabled={!regeneratePrompt}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Changes</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6">
                {editingSection === "script" ? (
                  <textarea
                    value={videoScript}
                    onChange={(e) => {
                      setVideoScript(e.target.value);
                      setUnsavedChanges(true);
                    }}
                    className="w-full h-96 p-4 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {videoScript}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="fixed bottom-6 right-6 flex items-center space-x-3">
          {unsavedChanges && (
            <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Unsaved changes
              </span>
            </div>
          )}

          <button
            onClick={() => setShowExportDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={() =>
              copyToClipboard(
                activeTab === "content"
                  ? lessonContent
                  : activeTab === "script"
                  ? videoScript
                  : activeTab === "outline"
                  ? JSON.stringify(courseOutline, null, 2)
                  : JSON.stringify(quizzes, null, 2),
                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              )
            }
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
