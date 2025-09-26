import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, User, Briefcase, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase"; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- CORRECTED SIGNUP SCHEMA ---
const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["trainer", "user"]), // FIX: Removed the invalid { required_error } parameter.
});

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const signupForm = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", role: undefined },
    });
    
    const handleLoginSuccess = async (user: FirebaseUser) => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'trainer') {
                navigate("/dashboard"); // Or a specific /trainer-dashboard
            } else {
                navigate("/user-dashboard");
            }
        } else {
            // Default new Google sign-ins to the 'user' role
            await setDoc(userDocRef, { 
                uid: user.uid, 
                email: user.email, 
                name: user.displayName || 'Google User', 
                role: 'user',
                createdAt: new Date(),
            });
            navigate("/dashboard");
        }
    };

    const handleLogin = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            await handleLoginSuccess(userCredential.user);
        } catch (err: any) { 
            console.error("Login Error:", err);
            setError("Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (values: z.infer<typeof signupSchema>) => {
        setIsLoading(true);
        setError("");
        try {
            // First, ensure a role is selected
            if (!values.role) {
                setError("Please select a role (Trainer or User).");
                setIsLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: values.name,
                email: values.email,
                role: values.role,
                createdAt: new Date(),
            });
            await handleLoginSuccess(user);
        } catch (err: any) { 
            console.error("Signup Error:", err);
            setError("Signup failed. That email may already be in use.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handleLoginSuccess(result.user);
        } catch (err: any) { 
            console.error("Google Login Error:", err);
            setError("Google sign-in failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                        AI Course Creator
                    </h1>
                    <p className="text-muted-foreground mt-2">Spark the Future of Learning</p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Welcome</CardTitle>
                        <CardDescription>Sign in or create a new account to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && <div className="text-red-500 text-sm mb-4 text-center p-2 border border-red-200 rounded">{error}</div>}
                        <Tabs defaultValue="login" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Login Tab */}
                            <TabsContent value="login" className="space-y-4">
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="Enter your email" {...field} className="pl-10" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input type="password" placeholder="Enter your password" {...field} className="pl-10" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Signing In..." : "Sign In"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            {/* Signup Tab */}
                            <TabsContent value="signup" className="space-y-4">
                                <Form {...signupForm}>
                                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                                        <FormField
                                            control={signupForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="Enter your full name" {...field} className="pl-10" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signupForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="Enter your email" {...field} className="pl-10" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signupForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input type="password" placeholder="Create a password" {...field} className="pl-10" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={signupForm.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>I am a...</FormLabel>
                                                    <FormControl>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div 
                                                                onClick={() => field.onChange("trainer")}
                                                                className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${field.value === 'trainer' ? 'border-primary bg-primary/10' : ''}`}
                                                            >
                                                                <Briefcase className="h-6 w-6 mb-2"/>
                                                                <span className="font-medium">Trainer</span>
                                                            </div>
                                                             <div 
                                                                onClick={() => field.onChange("user")}
                                                                className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${field.value === 'user' ? 'border-primary bg-primary/10' : ''}`}
                                                            >
                                                                <GraduationCap className="h-6 w-6 mb-2"/>
                                                                <span className="font-medium">Learner</span>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Creating Account..." : "Create Account"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <Button variant="outline" onClick={handleGoogleLogin} className="w-full" disabled={isLoading}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Sign in with Google
                            </Button>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;