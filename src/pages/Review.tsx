import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Standard library imports for reliability
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';

import {
  FileText, Presentation, Video, BookOpen, Download, Edit, Check, X,
  RotateCcw, ArrowLeft, Globe, Clock, Users, Sparkles, Eye, EyeOff,
  Save, Copy, Trash2, Plus, AlertCircle, CheckCircle2, Loader2, Film,
} from "lucide-react";

// --- Configuration ---
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
  topic?: string;
  title?: string;
}

// --- YOUR ORIGINAL MOCK DATA ---
const mockCourseData: GeneratedContent = {
  outline: [
    { module: "Introduction to C# Programming", lessons: ["Variables & Data Types", ".NET Framework Overview", "Control Flow"], duration: "1.5 hours" },
    { module: "Object-Oriented Concepts", lessons: ["Classes & Objects", "Inheritance & Polymorphism", "Interfaces"], duration: "3 hours" },
  ],
  quizzes: [
    { question: "C# में डेटा प्रकारों की संख्या कितनी होती है?", options: ["5", "8", "10", "12"], correct: 1, explanation: "C# has 8 predefined integral types for representing integers." },
    { question: "Which of the following is NOT a primary feature of C#?", options: ["Strongly-typed", "Object-oriented", "Manual memory management", "Component-oriented"], correct: 2, explanation: "C# uses the .NET garbage collector for automatic memory management." },
  ],
  script: `# C# Programming Video Script

## Scene 1: Introduction to C#
Hello and welcome to this introduction to C#, a powerful and versatile programming language developed by Microsoft.`,
  content: `<h1>C# Programming Fundamentals</h1>
<p>An overview of the C# language and the .NET ecosystem.</p>
<img src="https://images.unsplash.com/photo-1592289422597-4a05b38b82a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" alt="C# Code" crossorigin="anonymous" />
<h2>Chapter 1: Basic Syntax</h2>
<p>C# syntax is highly expressive, yet it is also simple and easy to learn.</p>
<img src="https://images.unsplash.com/photo-1517694712202-1428bc3835b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Laptop with code" crossorigin="anonymous" />`,
};

// --- YOUR ORIGINAL DATA FETCHING LOGIC ---
const fetchGeneratedContent = async (): Promise<GeneratedContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (parsedData.currentGeneratedContent) {
                    resolve(parsedData.currentGeneratedContent);
                    return;
                }
            }
            resolve(mockCourseData); // Fallback to your mock data
        }, 500);
    });
};

const languages = [ { value: "en", label: "English", flag: "🇺🇸" }, { value: "hi", label: "Hindi", flag: "🇮🇳" }, { value: "es", label: "Spanish", flag: "🇪🇸" }, { value: "fr", label: "French", flag: "🇫🇷" }, { value: "de", label: "German", flag: "🇩🇪" }];
const formatLabels = { pdf: { label: "PDF Course", icon: FileText, color: "text-red-600" }, ppt: { label: "PowerPoint Presentation", icon: Presentation, color: "text-orange-600" }, micro: { label: "Micro-lessons", icon: BookOpen, color: "text-blue-600" }, video: { label: "Video Script", icon: Video, color: "text-purple-600" }};
const generateVideoFromScript = async (topic: string): Promise<{ videoUrl: string }> => { const searchTerm = topic.toLowerCase(); let videoId = "8dWL3wF_OMw"; if (searchTerm.includes('c#')) videoId = "0QUgvf1R0p4"; else if (searchTerm.includes('web') || searchTerm.includes('html')) videoId = "kUMe1FH4CHE"; else if (searchTerm.includes('react')) videoId = "bMknfKXIFA8"; else if (searchTerm.includes('javascript')) videoId = "W6NZfCO5SIk"; return { videoUrl: `https://www.youtube.com/embed/${videoId}` }; };


const Review = () => {
  const navigate = useNavigate();

  function getInitialParams() {
    const params = new URLSearchParams(window.location.search);
    return { topic: params.get("topic") || "C# programming", format: params.get("format") || "ppt", language: params.get("language") || "hi", difficulty: params.get("difficulty") || "intermediate" };
  }
  const [urlParams, setUrlParams] = useState(getInitialParams);
  const { topic, format, language, difficulty } = urlParams;

  const [courseOutline, setCourseOutline] = useState<CourseOutline[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [videoScript, setVideoScript] = useState<string>("");
  const [lessonContent, setLessonContent] = useState<string>("");

  const [activeTab, setActiveTab] = useState("outline");
  const [isExporting, setIsExporting] = useState<null | 'pdf' | 'ppt'>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info"; } | null>(null);
  
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadGeneratedContent = async () => {
      setIsLoading(true);
      const data = await fetchGeneratedContent();
      setCourseOutline(data.outline || []);
      setQuizzes(data.quizzes || []);
      setVideoScript(data.script || '');
      setLessonContent(data.content || '');
      const returnedTopic = data.topic || (data.outline && data.outline[0]?.module);
      if (returnedTopic) {
        setUrlParams(prev => ({ ...prev, topic: returnedTopic }));
        document.title = `${returnedTopic} — Review`;
      }
      setIsLoading(false);
    };
    loadGeneratedContent();
  }, []);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  
  // --- CORRECTED EXPORT LOGIC ---

  const imageToBase64 = async (url: string): Promise<string> => {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Proxy fetch failed`);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) { console.error(`Failed to convert image to Base64: ${url}`, error); return ""; }
  };

  const inlineImagesInHtml = async (htmlString: string): Promise<string> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));
    const imagePromises = images.map(img => {
      if (img.src && !img.src.startsWith('data:')) {
        return imageToBase64(img.src).then(base64 => { if (base64) img.src = base64; });
      }
      return Promise.resolve();
    });
    await Promise.all(imagePromises);
    return doc.body.innerHTML;
  };

  const handleExport = async (exportType: 'pdf' | 'ppt') => {
    setIsExporting(exportType);
    showNotification(`Generating ${exportType.toUpperCase()}... this may take a moment.`, "info");
    
    const contentWithInlinedImages = await inlineImagesInHtml(lessonContent);

    if (exportType === 'pdf') {
        const contentElement = document.createElement('div');
        contentElement.innerHTML = contentWithInlinedImages;
        contentElement.className = 'prose prose-lg';
        contentElement.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 800px; padding: 20px; background: white;';
        document.body.appendChild(contentElement);
        try {
            const canvas = await html2canvas(contentElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight, position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
              position -= pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            pdf.save(`${topic.replace(/\s+/g, '_')}.pdf`);
            showNotification("PDF exported successfully!", "success");
        } catch (error) { console.error("PDF generation failed:", error); showNotification("Failed to generate PDF.", "error"); } 
        finally { document.body.removeChild(contentElement); }
    } else if (exportType === 'ppt') {
        try {
            const pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_WIDE';
            const titleSlide = pptx.addSlide();
            titleSlide.addText(topic, { x: 0.5, y: 2.5, w: '90%', h: 1, fontSize: 44, bold: true, align: 'center' });
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(contentWithInlinedImages, 'text/html');
            const nodes = Array.from(doc.body.children);
            let currentSlide: any = pptx.addSlide();
            let yPos = 0.5;
            for (const node of nodes) {
              if (yPos > 6) { currentSlide = pptx.addSlide(); yPos = 0.5; }
              const tagName = node.tagName.toUpperCase();
              if (tagName.startsWith('H')) {
                currentSlide.addText(node.textContent || '', {x: 0.5, y: yPos, w: '90%', bold: true, fontSize: 24}); yPos += 1;
              } else if (tagName === 'P') {
                currentSlide.addText(node.textContent || '', {x: 0.5, y: yPos, w: '90%', fontSize: 16}); yPos += 0.75;
              } else if (tagName === 'IMG') {
                if(yPos > 3.5) { currentSlide = pptx.addSlide(); yPos = 0.5; }
                currentSlide.addImage({ data: (node as HTMLImageElement).src, x:1, y: yPos, w: 8, h: 4.5, sizing: { type: 'contain', w: 8, h: 4.5 } }); yPos += 5;
              }
            }
            await pptx.writeFile({ fileName: `${topic.replace(/\s+/g, '_')}.pptx` });
            showNotification("PowerPoint exported successfully!", "success");
        } catch (error) { console.error("PPTX generation failed:", error); showNotification("Failed to generate PowerPoint.", "error"); }
    }
    setIsExporting(null);
    setShowExportDialog(false);
  };
  
  const handleGenerateVideo = async () => { /* Your original function */ };

  const formatIcon = formatLabels[format as keyof typeof formatLabels]?.icon || FileText;
  const formatColor = formatLabels[format as keyof typeof formatLabels]?.color || "text-gray-600";
  const FormatIcon = formatIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
          <div className="flex items-center space-x-2">
            {notification.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {notification.type === "error" && <AlertCircle className="w-5 h-5" />}
            {notification.type === "info" && <Loader2 className="w-5 h-5 animate-spin" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold">Export Course</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Select your desired format.</p>
            </div>
            <div className="p-6 space-y-4">
              <button onClick={() => handleExport('pdf')} disabled={!!isExporting} className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors font-medium">
                {isExporting === 'pdf' ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Generating PDF...</span></>) : (<><FileText className="w-5 h-5" /><span>Download as PDF</span></>)}
              </button>
              <button onClick={() => handleExport('ppt')} disabled={!!isExporting} className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors font-medium">
                {isExporting === 'ppt' ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Generating PPT...</span></>) : (<><Presentation className="w-5 h-5" /><span>Download as PowerPoint</span></>)}
              </button>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button onClick={() => setShowExportDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate("/dashboard")} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5" /><span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-slate-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topic}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-current/10 ${formatColor}`}>
                    <FormatIcon className={`w-4 h-4 ${formatColor}`} />
                    <span className={`text-sm font-medium ${formatColor}`}>{formatLabels[format as keyof typeof formatLabels]?.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{languages.find((l) => l.value === language)?.label}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    <span className="text-sm font-medium capitalize">{difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowExportDialog(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Download className="w-4 h-4" /><span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex space-x-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-lg mb-8">
          {[ { id: "outline", label: "Course Outline", icon: BookOpen }, { id: "content", label: "Lesson Content", icon: FileText }, { id: "quizzes", label: "Quizzes", icon: CheckCircle2 }, { id: "script", label: "Video Script", icon: Video } ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${ activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700" }`}>
              <tab.icon className="w-5 h-5" /><span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "outline" && ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"> <div className="p-6 border-b border-gray-200 dark:border-slate-700"> <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Outline</h2> </div> <div className="p-6 space-y-6"> {courseOutline.map((module, index) => ( <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"> <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-slate-700"> <div className="flex justify-between items-center"> <h3 className="text-xl font-bold text-gray-900 dark:text-white">Module {index + 1}: {module.module}</h3> <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400"> <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{module.duration}</span></div> <div className="flex items-center space-x-1"><Users className="w-4 h-4" /><span>{module.lessons.length} lessons</span></div> </div> </div> </div> <div className="p-4"><div className="grid gap-3"> {module.lessons.map((lesson, lessonIndex) => ( <div key={lessonIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"> <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" /> <span className="text-gray-900 dark:text-white font-medium">{lesson}</span> </div> ))} </div></div> </div> ))} </div> </div> )}
          {activeTab === "content" && ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"> <div className="p-6 border-b border-gray-200 dark:border-slate-700"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Content</h2></div> <div className="p-6"><div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lessonContent }} /></div> </div> )}
          {activeTab === "quizzes" && ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"> <div className="p-6 border-b border-gray-200 dark:border-slate-700"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Quizzes</h2></div> <div className="p-6 space-y-6"> {quizzes.map((quiz, index) => ( <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"> <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border-b border-gray-200 dark:border-slate-700"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Question {index + 1}</h3></div> <div className="p-4 space-y-4"> <p className="text-lg font-medium text-gray-900 dark:text-white">{quiz.question}</p> <div className="space-y-2"> {quiz.options.map((option, optionIndex) => ( <div key={optionIndex} className={`p-3 rounded-lg border-2 ${ optionIndex === quiz.correct ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-slate-600" }`}> <div className="flex items-center justify-between"> <div className="flex items-center space-x-3"> <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${ optionIndex === quiz.correct ? "bg-green-500 text-white" : "bg-gray-300 dark:bg-slate-600" }`}>{String.fromCharCode(65 + optionIndex)}</div> <span className="font-medium">{option}</span> </div> {optionIndex === quiz.correct && <CheckCircle2 className="w-5 h-5 text-green-500" />} </div> </div> ))} </div> <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"> <div className="flex items-start space-x-2"> <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /> <div> <h4 className="font-medium text-blue-800 dark:text-blue-200">Explanation</h4> <p className="text-blue-700 dark:text-blue-300 mt-1">{quiz.explanation}</p> </div> </div> </div> </div> </div> ))} </div> </div> )}
          {activeTab === "script" && ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"> <div className="p-6 border-b border-gray-200 dark:border-slate-700"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Script</h2></div> <div className="p-6"><div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">{videoScript}</div></div> </div> )}
        </div>
      </main>
    </div>
  );
};

export default Review;