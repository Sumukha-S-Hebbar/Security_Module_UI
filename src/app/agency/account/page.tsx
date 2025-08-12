
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sites } from '@/lib/data/sites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, KeyRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Organization, User } from '@/types';


const profileFormSchema = z.object({
  name: z.string().min(1, 'Agency name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Invalid email address.'),
  address: z.string().min(1, 'Address is required.'),
  region: z.string().min(1, 'Region is required.'),
  city: z.string().min(1, 'City is required.'),
  avatar: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AgencyAccountPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [agency, setAgency] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    if(typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        const userData = localStorage.getItem('user');
        if (orgData) setAgency(JSON.parse(orgData));
        if (userData) setUser(JSON.parse(userData));
    }
  }, []);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: agency?.name || '',
      phone: agency?.member?.phone || '',
      email: user?.email || '',
      address: '', // Mock data doesn't have this, so we leave it empty
      region: '', // Mock data doesn't have this
      city: '',   // Mock data doesn't have this
      avatar: undefined,
    },
  });

  const selectedRegion = form.watch('region');

  const allRegions = useMemo(() => {
    return [...new Set(sites.map(site => site.region))].sort();
  }, []);

  const citiesInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return [...new Set(sites.filter(site => site.region === selectedRegion).map(site => site.city))].sort();
  }, [selectedRegion]);
  
  useEffect(() => {
    if (agency?.logo) {
      setAvatarPreview(agency.logo);
    } else if (agency?.member?.profile_picture) {
      setAvatarPreview(agency.member.profile_picture);
    }
  }, [agency]);
  
  // When region changes, if the current city is not in the new region's cities, reset it.
  useEffect(() => {
      if (selectedRegion && !citiesInRegion.includes(form.getValues('city'))) {
          form.setValue('city', '');
      }
  }, [selectedRegion, citiesInRegion, form]);


  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('avatar', event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    console.log('Updating agency profile:', values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Profile Updated',
      description: 'Your agency profile has been updated successfully.',
    });

    setIsSaving(false);
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
  
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691c-1.346 2.536-2.074 5.46-2.074 8.529s.728 5.994 2.074 8.529l-5.645 5.645C1.123 34.12 0 29.268 0 24s1.123-10.12 2.661-13.835l5.645-5.645z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.072 34.777 27.218 36 24 36c-5.223 0-9.657-3.343-11.303-8H2.697v8.309C6.393 40.023 14.61 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l5.657 5.657C40.072 35.817 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82V14.706H9.692V11.084h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.405 0 22.675 0z" />
    </svg>
  );

  const MicrosoftIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 23 23">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your agency's profile information.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Agency Profile</CardTitle>
            <CardDescription>Update your agency's contact and location details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || undefined} alt={agency.name || 'Agency Logo'} />
                        <AvatarFallback>{agency.name ? agency.name.charAt(0) : 'A'}</AvatarFallback>
                    </Avatar>
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency Logo</FormLabel>
                          <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarChange}
                                disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GuardLink Security" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 555-001-0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., contact@guardlink.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123 Security Blvd" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allRegions.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {citiesInRegion.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LINK SOCIAL ACCOUNT</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-center">
              <GoogleIcon />
              <span className="ml-2">Google</span>
            </Button>
            <Button variant="outline" className="justify-center">
              <FacebookIcon />
              <span className="ml-2">Facebook</span>
            </Button>
            <Button variant="outline" className="justify-center">
              <MicrosoftIcon />
              <span className="ml-2">Microsoft</span>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button className="w-full bg-[#1e90ff] hover:bg-[#1c86ee] text-white text-lg py-6">
            <KeyRound className="mr-2 h-5 w-5" />
            Change Password
          </Button>
        </div>

      </div>
    </div>
  );
}
