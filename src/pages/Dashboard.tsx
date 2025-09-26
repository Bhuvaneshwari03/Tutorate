import { useState, useEffect } from "react";
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
import { BookOpen, FileText, Presentation, Video, LogOut, Sparkles, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// --- Firebase SDK Imports ---
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from "firebase/firestore";

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
    apiKey: "AIzaSyCmPwslZ5uTkdP2midSXtCllYRMluxZlIE",
    authDomain: "tutorate-2025.firebaseapp.com",
    projectId: "tutorate-2025",
    storageBucket: "tutorate-2025.appspot.com",
    messagingSenderId: "982451792331",
    appId: "1:982451792331:web:aef7d3c800dafe9e7cae4e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- App Configuration ---
const CLOUD_FUNCTION_URL = "https://generatecoursecontent-nilrqvcmlq-uc.a.run.app"; 

// --- [DEBUGGING] MOCK API FLAG ---
// Set this to 'true' to use fake data and test the Firestore connection.
// Set this to 'false' to use your real Cloud Function.
const USE_MOCK_API = true;

// --- Interface for Generated Content ---
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

// --- Zod Schema and Constants ---
const courseSchema = z.object({
    topic: z.string().min(5, "Topic must be at least 5 characters"),
    description: z.string().optional(),
    format: z.string().min(1, "Please select an output format"),
    language: z.string().min(1, "Please select a language"),
    difficulty: z.string().min(1, "Please select difficulty level"),
});
type CourseFormValues = z.infer<typeof courseSchema>;

const languages = [
    { value: "en", label: "English" }, { value: "hi", label: "Hindi" },
    { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
    { value: "de", label: "German" }, { value: "pt", label: "Portuguese" },
    { value: "ar", label: "Arabic" }, { value: "zh", label: "Chinese" },
];

const formats = [
    { value: "pdf", label: "PDF Course", icon: FileText },
    { value: "ppt", label: "PowerPoint Presentation", icon: Presentation },
    { value: "micro", label: "Micro-lessons", icon: BookOpen },
    { value: "video", label: "Video Script", icon: Video },
];

// --- MOCK CONTENT GENERATION FUNCTION ---
const generateMockContent = (values: CourseFormValues): Promise<GeneratedContent> => {
    console.log("--- USING MOCK API ---. Simulating content generation for:", values.topic);
    return new Promise(resolve => {
        setTimeout(() => {
            const mockData: GeneratedContent = {
                outline: [
                    { module: "Module 1: Mock Introduction", lessons: ["Lesson 1.1", "Lesson 1.2"], duration: "20 mins" },
                    { module: "Module 2: Core Concepts (Mock)", lessons: ["Lesson 2.1", "Lesson 2.2"], duration: "45 mins" }
                ],
                quizzes: [
                    { question: "This is a mock question.", options: ["Option A", "Option B"], correct: 0, explanation: "This is a mock explanation." }
                ],
                script: "This is a mock video script.",
                content: "# Mock Course Content\n\nThis is the main content for the generated course. It's all placeholder text to test the system."
            };
            console.log("--- MOCK API ---: Returning mock data.");
            resolve(mockData);
        }, 1500); // Simulate a 1.5 second network delay
    });
};


// --- REAL CONTENT GENERATION FUNCTION ---
const generateRealContent = async (values: CourseFormValues): Promise<GeneratedContent> => {
    console.log("Calling REAL Cloud Function for content generation:", values);
    const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloud Function Error Response:", errorText);
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {}
        throw new Error(`Cloud Function Error: ${errorMessage}`);
    }
    return response.json() as Promise<GeneratedContent>;
};

const generateContent = (values: CourseFormValues): Promise<GeneratedContent> => {
    if (USE_MOCK_API) {
        return generateMockContent(values);
    }
    return generateRealContent(values);
}

// --- Dashboard Component ---
const Dashboard = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("Awaiting input...");
    const [recentCourses, setRecentCourses] = useState([]);
    const [userId, setUserId] = useState<string | null>(null);

    // --- Firebase Authentication Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User authenticated with UID:", user.uid);
                setUserId(user.uid);
            } else {
                try {
                    console.log("No user found, signing in anonymously...");
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Firebase anonymous sign-in error:", error);
                    setProgressMessage("Could not authenticate user.");
                }
            }
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // --- Firestore Data Fetching Effect ---
    useEffect(() => {
        if (!userId) {
            console.log("No user ID yet, skipping Firestore fetch.");
            return; 
        }

        console.log(`Setting up Firestore listener for user: ${userId}`);
        const appId = firebaseConfig.projectId; // Use projectId for the path
        const coursesCollectionPath = `artifacts/${appId}/users/${userId}/courses`;
        
        const q = query(collection(db, coursesCollectionPath), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const coursesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Firestore data received:", coursesData);
            setRecentCourses(coursesData);
        }, (error) => {
            console.error("Error fetching courses from Firestore:", error);
        });

        return () => {
            console.log("Cleaning up Firestore listener.");
            unsubscribe();
        }
    }, [userId]);


    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            topic: "",
            description: "",
            format: "pdf",
            language: "en",
            difficulty: "intermediate",
        },
    });

    const handleGenerateCourse = async (values: CourseFormValues) => {
        if (!userId) {
            setProgressMessage("Error: User not authenticated. Cannot generate course.");
            console.error("handleGenerateCourse called without a userId.");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setProgressMessage("Starting AI course generation...");

        try {
            // Simulate initial progress
            setGenerationProgress(20);
            setProgressMessage("Analyzing topic...");
            await new Promise(resolve => setTimeout(resolve, 500));
            setGenerationProgress(40);
            setProgressMessage(USE_MOCK_API ? "Calling Mock API..." : "Sending request to Cloud Function...");
            
            // Core API Call (either real or mock)
            const generatedContent = await generateContent(values);
            setGenerationProgress(80);
            setProgressMessage("Content received, saving to database...");

            // --- Save to Firestore ---
            const appId = firebaseConfig.projectId;
            const coursesCollectionPath = `artifacts/${appId}/users/${userId}/courses`;
            const languageLabel = languages.find(l => l.value === values.language)?.label || "English";

            const newCourseData = {
                topic: values.topic,
                description: values.description || "",
                format: values.format,
                language: languageLabel,
                languageValue: values.language,
                difficulty: values.difficulty,
                createdAt: serverTimestamp(),
                userId: userId,
                ...generatedContent
            };

            console.log("Saving new course data to Firestore:", newCourseData);
            const docRef = await addDoc(collection(db, coursesCollectionPath), newCourseData);
            console.log("Successfully saved with document ID:", docRef.id);
            
            setGenerationProgress(100);
            setProgressMessage("Course saved! Redirecting...");
            await new Promise(resolve => setTimeout(resolve, 500));

            // Navigate to the review page with the new Firestore document ID
            navigate(`/review?id=${docRef.id}`);

        } catch (error) {
            console.error("Course generation failed:", error);
            setProgressMessage(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            setGenerationProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => navigate("/");
    
    const getFormatLabel = (formatValue: string) => {
        return formats.find(f => f.value === formatValue)?.label.replace(' Course', '').replace(' Presentation', '').replace('-lessons', '') || formatValue.toUpperCase();
    }
    
    // Function to format Firestore Timestamp to a readable date string
    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return "N/A";
        return timestamp.toDate().toISOString().split('T')[0];
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
            
            <main className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Course Generation Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>Generate New Course</span>
                                </CardTitle>
                                <CardDescription>
                                    Enter your course topic and preferences to generate a complete educational experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleGenerateCourse)} className="space-y-6">
                                        {/* Topic, Description, Format, Language, Difficulty Fields (Unchanged) */}
                                        <FormField control={form.control} name="topic" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course Topic</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Teach Digital Payments Security" {...field} className="text-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Provide additional context or specific learning objectives..." {...field} rows={3} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="format" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Output Format</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
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
                                            )} />
                                            <FormField control={form.control} name="language" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Language</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
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
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="difficulty" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="beginner">Beginner</SelectItem>
                                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                                        <SelectItem value="advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        {isGenerating && (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>{progressMessage}</span>
                                                    <span>{generationProgress}%</span>
                                                </div>
                                                <Progress value={generationProgress} className="w-full" />
                                            </div>
                                        )}

                                        <Button type="submit" size="lg" className="w-full" disabled={isGenerating || !userId}>
                                            {isGenerating ? "Generating Course..." : (userId ? "Generate Course" : "Authenticating...")}
                                            <Sparkles className="w-4 h-4 ml-2" />
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* --- Recent Courses --- */}
                    <aside className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Recent Courses</CardTitle>
                                <CardDescription>Your previously generated courses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentCourses.length > 0 ? recentCourses.map((course, index) => (
                                    <div key={course.id} className="space-y-3">
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
                                                <p className="text-xs text-muted-foreground">{formatDate(course.createdAt)}</p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => navigate(`/review?id=${course.id}`)}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {index < recentCourses.length - 1 && <Separator />}
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No courses generated yet.</p>
                                )}
                            </CardContent>
                        </Card>
                        {/* Quick Tips (Unchanged) */}
                        <Card className="shadow-lg">
                            <CardHeader><CardTitle>Quick Tips</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-info mt-2 flex-shrink-0" />
                                    <p>Be **specific** with your topic for better AI-generated content.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                                    <p>Include **learning objectives** in the description for targeted content.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                                    <p>Review and edit generated content before the final export.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside> 
                </div> 
            </main> 
        </div> 
    );
};

export default Dashboard;

