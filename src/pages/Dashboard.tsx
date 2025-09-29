import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BookOpen, FileText, Presentation, Video, LogOut, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// --- Configuration ---
// 🚨 REPLACE THIS WITH YOUR DEPLOYED FUNCTION URL
const GENERATE_FUNCTION_URL = "https://generatecoursecontent-nilrqvcmlq-uc.a.run.app";

// --- Interface for Generated Content (Must match Cloud Function output) ---
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

// --- Zod Schema and Constants (Unchanged) ---
const courseSchema = z.object({
    topic: z.string().min(5, "Topic must be at least 5 characters"),
    description: z.string().optional(),
    format: z.string().min(1, "Please select an output format"),
    language: z.string().min(1, "Please select a language"),
    difficulty: z.string().min(1, "Please select difficulty level"),
});
type CourseFormValues = z.infer<typeof courseSchema>;

const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "pt", label: "Portuguese" },
    { value: "ar", label: "Arabic" },
    { value: "zh", label: "Chinese" },
];

const formats = [
    { value: "pdf", label: "PDF Course", icon: FileText },
    { value: "ppt", label: "PowerPoint Presentation", icon: Presentation },
    { value: "micro", label: "Micro-lessons", icon: BookOpen },
    { value: "video", label: "Video Script", icon: Video },
];

// --- REAL CONTENT GENERATION FUNCTION (Calls Cloud Function) ---

const generateContent = async (values: CourseFormValues): Promise<GeneratedContent> => {
    console.log("Calling Cloud Function for content generation:", values);

    const response = await fetch(GENERATE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
            // Ignore if response is not JSON
        }
        throw new Error(`Cloud Function Error: ${errorMessage}`);
    }

    return response.json() as Promise<GeneratedContent>;
};

// --- Dashboard Component ---

const Dashboard = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("Awaiting input...");

    const LOCAL_STORAGE_KEY = 'aiCourseCreatorData';

    // Load recent courses from local storage or use initial static data
    const [recentCourses, setRecentCourses] = useState(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            const initialCourses = storedData ? JSON.parse(storedData).recentCourses || [] : [];
            return initialCourses.length > 0 ? initialCourses : [
                { id: 1, topic: "Digital Payments Security", format: "pdf", language: "English", date: "2024-01-15" },
                { id: 2, topic: "Machine Learning Basics", format: "ppt", language: "Hindi", date: "2024-01-14" },
                { id: 3, topic: "Cybersecurity Fundamentals", format: "video", language: "English", date: "2024-01-13" },
            ];
        } catch (error) {
            console.error("Error loading recent courses from localStorage:", error);
            return [
                { id: 1, topic: "Digital Payments Security", format: "pdf", language: "English", date: "2024-01-15" },
                { id: 2, topic: "Machine Learning Basics", format: "ppt", language: "Hindi", date: "2024-01-14" },
                { id: 3, topic: "Cybersecurity Fundamentals", format: "video", language: "English", date: "2024-01-13" },
            ];
        }
    });

    // Function to save data to localStorage
    const saveToLocalStorage = (newCourses: any[], content: GeneratedContent) => {
        const data = { recentCourses: newCourses, currentGeneratedContent: content };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    };


    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            topic: "",
            description: "",
            format: "pdf", // Default to PDF
            language: "en",
            difficulty: "intermediate",
        },
    });

    const handleGenerateCourse = async (values: CourseFormValues) => {
        setIsGenerating(true);
        setGenerationProgress(0);
        setProgressMessage("Starting AI course generation...");

        try {
            // 1. Simulate AI generation progress (client-side)
            const progressSteps = [
                { progress: 20, message: "Analyzing topic and creating prompt..." },
                { progress: 40, message: "Sending request to secure Cloud Function..." },
            ];

            for (const step of progressSteps) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setGenerationProgress(step.progress);
                setProgressMessage(step.message);
            }

            // --- Core API Call ---
            // 2. Call the secure Cloud Function to generate content
            const generatedContent = await generateContent(values);

            // Update progress for post-API call processing
            setGenerationProgress(80);
            setProgressMessage("Structuring received AI data...");
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Update recent courses
            const languageLabel = languages.find(l => l.value === values.language)?.label || "English";

            const newCourse = {
                id: Date.now(),
                topic: values.topic,
                format: values.format, // Save the value for consistent lookup
                language: languageLabel,
                date: new Date().toISOString().split('T')[0],
            };

            const updatedCourses = [newCourse, ...recentCourses];
            setRecentCourses(updatedCourses);

            // 4. Save the generated content and updated courses for the Review page to fetch
            saveToLocalStorage(updatedCourses, generatedContent);

            setGenerationProgress(100);
            setProgressMessage("Course generated successfully! Redirecting...");
            await new Promise(resolve => setTimeout(resolve, 500));

            // 5. Navigate to review page
            navigate(`/review?topic=${encodeURIComponent(values.topic)}&format=${values.format}&language=${values.language}&difficulty=${values.difficulty}`);

        } catch (error) {
            console.error("Course generation failed:", error);
            setGenerationProgress(0);
            setProgressMessage(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        navigate("/");
    };

    // Helper to get Format Label
    const getFormatLabel = (formatValue: string) => {
        return formats.find(f => f.value === formatValue)?.label.replace(' Course', '').replace(' Presentation', '').replace('-lessons', '') || formatValue.toUpperCase();
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold">Tutorate</h1>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            {/* --- Dashboard Content --- */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Course Generation Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>Generate New Course</span>
                                </CardTitle>
                                <CardDescription>
                                    Enter your course topic and preferences to generate a complete educational experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleGenerateCourse)} className="space-y-6">
                                        {/* Topic Field */}
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Topic</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Teach Digital Payments Security" {...field} className="text-base" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description Field */}
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Description (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Provide additional context or specific learning objectives..." {...field} rows={3} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Format Field */}
                                            <FormField
                                                control={form.control}
                                                name="format"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Output Format</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select format" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {formats.map((format) => (
                                                                    <SelectItem key={format.value} value={format.value}>
                                                                        <div className="flex items-center space-x-2">
                                                                            <format.icon className="w-4 h-4" />
                                                                            <span>{format.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Language Field */}
                                            <FormField
                                                control={form.control}
                                                name="language"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Language</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select language" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {languages.map((language) => (
                                                                    <SelectItem key={language.value} value={language.value}>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Globe className="w-4 h-4" />
                                                                            <span>{language.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Difficulty Field */}
                                        <FormField
                                            control={form.control}
                                            name="difficulty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Difficulty Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select difficulty" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="beginner">Beginner</SelectItem>
                                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                                            <SelectItem value="advanced">Advanced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {isGenerating && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span>{progressMessage}</span>
                                                    <span>{generationProgress}%</span>
                                                </div>
                                                <Progress value={generationProgress} className="w-full" />
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? "Generating Course..." : "Generate Course"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Recent Courses --- */}
                    <div className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Recent Courses</CardTitle>
                                <CardDescription>Your previously generated courses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentCourses.map((course, index) => (
                                    <div key={course.id}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm leading-tight">{course.topic}</p>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {getFormatLabel(course.format)}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {course.language}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{course.date}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/review?topic=${encodeURIComponent(course.topic)}&format=${course.format}&language=${course.language}&difficulty=intermediate`)} // Navigate to review
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {index < recentCourses.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                    <p>Be specific with your topic for better AI-generated content</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                    <p>Include learning objectives in the description for targeted content</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                                    <p>Review and edit generated content before final export</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
