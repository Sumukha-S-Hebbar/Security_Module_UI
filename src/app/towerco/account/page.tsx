
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Briefcase, KeyRound, Building, Loader2 } from 'lucide-react';
import type { Organization, User } from '@/types';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function TowercoAccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const orgData = localStorage.getItem('organization');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (orgData) {
        setOrganization(JSON.parse(orgData));
      }
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (isPasswordFormVisible && passwordFormRef.current) {
        const timer = setTimeout(() => {
             passwordFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [isPasswordFormVisible]);

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


  if (isLoading) {
      return (
          <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                  <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                  <CardContent className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                          <Skeleton className="h-24 w-24 rounded-full" />
                          <div className="space-y-2">
                              <Skeleton className="h-8 w-40" />
                              <Skeleton className="h-4 w-64" />
                              <Skeleton className="h-4 w-56" />
                              <Skeleton className="h-4 w-60" />
                          </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-24" /></div>
                          <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-24" /></div>
                          <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-24" /></div>
                          <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-24" /></div>
                      </div>
                  </CardContent>
                </Card>
              </div>
          </div>
      );
  }

  if (!organization || !user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load organization or user profile. Please log in again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const userFullName = `${user.first_name} ${user.last_name || ''}`.trim();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PROFILE DETAILS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={organization.logo || undefined} alt={userFullName} />
                <AvatarFallback>{user.first_name.charAt(0)}{user.last_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{userFullName}</h2>
                <div className="text-muted-foreground mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{organization.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined on {new Date(user.date_joined).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">EMP ID</p>
                <p className="font-semibold">{organization.member?.employee_id || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Designation</p>
                <p className="font-semibold">{organization.member?.designation || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Organization</p>
                <p className="font-semibold">{organization.name}</p>
              </div>
              {user.country && (
                <div className="space-y-1">
                    <p className="text-muted-foreground font-medium">Country</p>
                    <p className="font-semibold">{user.country.name} ({user.country.code3})</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Collapsible open={isPasswordFormVisible} onOpenChange={setIsPasswordFormVisible}>
          <CollapsibleTrigger asChild>
            <Button className="w-full bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-lg py-6 text-white">
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
                                <Button type="submit" disabled={isUpdatingPassword} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
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
