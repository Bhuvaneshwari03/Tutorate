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
import { BookOpen, FileText, Presentation, Video, Download, LogOut, Sparkles, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
// --- FIX: IMPORT SHARED FIREBASE INSTANCES ---
import { functions, auth } from "@/lib/firebase"; 
import { httpsCallable } from 'firebase/functions';
// --- REMOVED getFunctions, getAuth, getApp imports ---


// --- TYPE DEFINITIONS for AI Output (Must match Cloud Function JSON) ---
interface CourseOutline {
    module: string;
    lessons: string[];
    duration: string;
}

interface Quiz {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface GeneratedCourseData {
    outline: CourseOutline[];
    fullContent: string;
    quizzes: Quiz[];
    videoScript: string;
}

interface GenerateCourseResponse {
    success: boolean;
    courseData: GeneratedCourseData;
}
// ----------------------------------------------------------------------

// Use imported 'functions' instance for callable function setup
const generateCourseFunction = httpsCallable<z.infer<typeof courseSchema>, GenerateCourseResponse>(functions, 'generateCourse');

const courseSchema = z.object({
    topic: z.string().min(5, "Topic must be at least 5 characters"),
    description: z.string().optional(),
    format: z.string().min(1, "Please select an output format"),
    language: z.string().min(1, "Please select a language"),
    difficulty: z.string().min(1, "Please select difficulty level"),
});

const languages = [
    { value: "en", label: "English" },
    { value: "ta", label: "Tamil" },
    { value: "ja", label: "Japanese" },
    { value: "de", label: "German" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "hi", label: "Hindi" },
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

const Dashboard = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Ready to spark new learning!");
    
    // Sample recent courses data (replace with actual data fetching if available)
    const [recentCourses, setRecentCourses] = useState([
        { id: 1, topic: "Digital Payments Security", format: "PDF", language: "English", date: "2024-01-15" },
        { id: 2, topic: "Machine Learning Basics", format: "PPT", language: "Hindi", date: "2024-01-14" },
        { id: 3, topic: "Cybersecurity Fundamentals", format: "Video Script", language: "English", date: "2024-01-13" },
    ]);

    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            topic: "",
            description: "",
            format: "",
            language: "en",
            difficulty: "intermediate",
        },
    });

    const handleGenerateCourse = async (values: z.infer<typeof courseSchema>) => {
        setIsGenerating(true);
        setGenerationProgress(10);
        setStatusMessage("1. Initializing AI model...");

        try {
            // Step 1: Call the Cloud Function to Generate Content. 
            // The imported 'functions' instance knows about the logged-in user via 'auth'.
            const response = await generateCourseFunction(values); 

            // Accessing courseData is now type-safe
            const { courseData } = response.data; 

            setGenerationProgress(50);
            setStatusMessage("2. Generating course content and structure...");
            await new Promise(resolve => setTimeout(resolve, 1000));

            setGenerationProgress(80);
            setStatusMessage("3. Finalizing quizzes and video script...");
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setGenerationProgress(100);
            setStatusMessage("✅ Course generated successfully! Redirecting for review.");
            
            // Step 2: Store generated data temporarily
            localStorage.setItem('generatedCourseData', JSON.stringify(courseData));
            
            // Step 3: Add to recent courses and navigate
            const newCourse = {
                id: Date.now(),
                topic: values.topic,
                format: values.format.toUpperCase(),
                language: languages.find(l => l.value === values.language)?.label || "English",
                date: new Date().toISOString().split('T')[0],
            };
            setRecentCourses([newCourse, ...recentCourses]);

            navigate(`/review?topic=${encodeURIComponent(values.topic)}&format=${values.format}&language=${values.language}`);

        } catch (error: any) {
            console.error("Course Generation Failed:", error);
            const errorMessage = error.code === 'unauthenticated' 
                ? "Authentication failed. Please log out and log back in." 
                : error.details?.message || error.message || "Failed to generate course. Check function logs.";
            setStatusMessage(`❌ Error: ${errorMessage}`);
            setGenerationProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        auth.signOut() 
            .then(() => navigate("/"))
            .catch((error) => console.error("Logout error:", error));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-info rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-bold">AI Course Creator</h1>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Course Generation Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-info" />
                                    <span>Generate New Course</span>
                                </CardTitle>
                                <CardDescription>
                                    Enter your course topic and preferences to generate a complete educational experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleGenerateCourse)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Topic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., Teach Digital Payments Security"
                                                            {...field}
                                                            className="text-base"
                                                            disabled={isGenerating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Course Description (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Provide additional context or specific learning objectives..."
                                                            {...field}
                                                            rows={3}
                                                            disabled={isGenerating}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="format"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Output Format</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
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

                                            <FormField
                                                control={form.control}
                                                name="language"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Language</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
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

                                        <FormField
                                            control={form.control}
                                            name="difficulty"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Difficulty Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
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
                                                    <span>{statusMessage}</span>
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
                                            <Sparkles className="w-4 h-4 ml-2" />
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Courses */}
                    <div className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Recent Courses</CardTitle>
                                <CardDescription>Your previously generated courses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentCourses.map((course, index) => (
                                    <div key={course.id} className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm leading-tight">{course.topic}</p>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {course.format}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {course.language}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{course.date}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {index < recentCourses.length - 1 && <Separator />}
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
                                    <div className="w-2 h-2 rounded-full bg-info mt-2 flex-shrink-0" />
                                    <p>Be specific with your topic for better AI-generated content</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                                    <p>Include learning objectives in the description for targeted content</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
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