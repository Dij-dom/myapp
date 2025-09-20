'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/app/Header';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type UserFormValues = z.infer<typeof formSchema>;

function AuthForm() {
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState('signin');
    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    
    const onSubmit = (data: UserFormValues) => {
        startTransition(async () => {
            try {
                if (activeTab === 'signin') {
                    await signIn(data.email, data.password);
                } else {
                    await signUp(data.email, data.password);
                }
                toast({
                    title: activeTab === 'signin' ? 'Login Successful' : 'Account Created',
                    description: "You're now logged in.",
                });
                router.push('/dashboard');
            } catch (error: any) {
                toast({
                    title: 'Authentication Failed',
                    description: error.message || 'An unexpected error occurred.',
                    variant: 'destructive',
                });
            }
        });
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthFormFields form={form} onSubmit={onSubmit} isPending={isPending} buttonText="Sign In" />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="signup">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Create a new account to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <AuthFormFields form={form} onSubmit={onSubmit} isPending={isPending} buttonText="Sign Up" />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}


function AuthFormFields({form, onSubmit, isPending, buttonText}: any) {
    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="m@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                    {buttonText}
                </Button>
            </form>
        </Form>
    )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 grid md:grid-cols-2">
        <div className="hidden md:flex flex-col items-center justify-center bg-muted p-10 text-center">
            <div className="max-w-md">
                <h1 className="text-4xl font-bold font-headline mb-4 text-primary">MingAI</h1>
                <p className="text-xl text-muted-foreground">
                    “Upgrade your lifestyle with personalized guidance — your buddy who keeps you on track, every step of the way.”
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AuthForm />
            </div>
        </div>
      </main>
    </div>
  );
}