
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Organization, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, KeyRound, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


const passwordFormSchema = z.object({
  old_password: z.string().min(1, 'Old password is required.'),
  new_password1: z.string().min(8, 'New password must be at least 8 characters.'),
  new_password2: z.string(),
}).refine(data => data.new_password1 === data.new_password2, {
  message: 'New passwords do not match.',
  path: ['new_password2'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function AgencyAccountPage() {
  const { toast } = useToast();
  const [agency, setAgency] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const passwordFormRef = useRef<HTMLDivElement>(null);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        old_password: '',
        new_password1: '',
        new_password2: ''
    }
  });


  useEffect(() => {
    if(typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        const userData = localStorage.getItem('user');
        if (orgData) setAgency(JSON.parse(orgData));
        if (userData) setUser(JSON.parse(userData));
    }
  }, []);
  
  useEffect(() => {
    if (isPasswordFormVisible && passwordFormRef.current) {
        const timer = setTimeout(() => {
             passwordFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [isPasswordFormVisible]);

  const avatarSrc = agency?.logo || agency?.member?.profile_picture;
  const avatarFallback = agency?.name ? agency.name.charAt(0) : 'A';
  
  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsUpdatingPassword(true);
    const token = localStorage.getItem('token');
    
    try {
        const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/users/account/password/change/`;
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(values)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || 'Failed to change password.');
        }
        
        toast({
            title: 'Password Updated',
            description: 'Your password has been changed successfully.',
        });
        passwordForm.reset();
        setIsPasswordFormVisible(false);

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'An error occurred.',
        });
    } finally {
        setIsUpdatingPassword(false);
    }
  }


  if (!agency || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading your profile information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">View your agency's profile information.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Agency Profile</CardTitle>
            <CardDescription>Your agency's contact and location details.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarSrc || undefined} alt={agency.name || 'Agency Logo'} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                     <div>
                        <h3 className="text-xl font-bold">{agency.name}</h3>
                        <p className="text-muted-foreground">{agency.type}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Agency Name</p>
                            <p className="font-semibold">{agency.name || 'Not available'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                             <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold">{user.email || 'Not available'}</p>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold">{agency.member?.phone || 'Not available'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                             <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold">{agency.member?.designation || 'Address not available'}</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
          </CardContent>
        </Card>

         <Collapsible open={isPasswordFormVisible} onOpenChange={setIsPasswordFormVisible}>
          <CollapsibleTrigger asChild>
            <Button className="w-full bg-[#1e90ff] hover:bg-[#1c86ee] text-lg py-6">
                <KeyRound className="mr-2 h-5 w-5" />
                Change Password
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-4" ref={passwordFormRef}>
                <CardHeader>
                    <CardTitle>Change Your Password</CardTitle>
                    <CardDescription>Enter your old password and a new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="old_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Old Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter current password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="new_password1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="new_password2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Re-enter new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isUpdatingPassword} className="bg-[#1e90ff] hover:bg-[#1c86ee]">
                                    {isUpdatingPassword ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

      </div>
    </div>
  );
}
