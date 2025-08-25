'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  const handleAuthAction = async (
    action: (email: string, pass: string) => Promise<string | null>, 
    values: z.infer<typeof formSchema>
  ) => {
    setIsSubmitting(true);
    const error = await action(values.email, values.password);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error,
      });
    }
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col items-center rounded-lg border bg-card p-8 text-card-foreground shadow-lg">
        <div className="mb-6 flex items-center gap-2 text-2xl font-semibold">
          <Leaf className="h-8 w-8 text-primary" />
          <span>Backyard Bounty</span>
        </div>
        <p className="mb-8 text-center text-muted-foreground">
          Sign in or create an account to manage your backyard.
        </p>

        <Form {...form}>
          <form className="w-full space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <FormControl>
                    <Input id="email" type="email" placeholder="name@example.com" {...field} />
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
                  <Label htmlFor="password">Password</Label>
                  <FormControl>
                    <Input id="password" type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex flex-col space-y-2 pt-4">
               <Button 
                onClick={form.handleSubmit((values) => handleAuthAction(signInWithEmail, values))}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
               <Button 
                variant="outline"
                onClick={form.handleSubmit((values) => handleAuthAction(signUpWithEmail, values))}
                disabled={isSubmitting}
                className="w-full"
              >
                 {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
