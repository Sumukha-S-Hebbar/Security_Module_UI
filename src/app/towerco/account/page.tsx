
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { organizations } from '@/lib/data/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';

const LOGGED_IN_ORG_ID = 'TCO01';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Invalid email address.'),
  registered_address_line1: z.string().min(1, 'Address is required.'),
  city: z.string().min(1, 'City is required.'),
  state: z.string().min(1, 'State is required.'),
  pincode: z.string().min(1, 'Pincode is required.'),
  commercial_tax_id: z.string().min(1, 'Commercial tax ID is required.'),
  operating_license_number: z.string().min(1, 'Operating license number is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function TowercoAccountPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const organization = useMemo(() => organizations.find(o => o.id === LOGGED_IN_ORG_ID), []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: organization?.name || '',
      phone: organization?.phone || '',
      email: organization?.email || '',
      registered_address_line1: organization?.registered_address_line1 || '',
      city: organization?.city || '',
      state: organization?.state || '',
      pincode: organization?.pincode || '',
      commercial_tax_id: organization?.commercial_tax_id || '',
      operating_license_number: organization?.operating_license_number || '',
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    console.log('Updating organization profile:', values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Profile Updated',
      description: 'Your organization profile has been updated successfully.',
    });

    setIsSaving(false);
  }

  if (!organization) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load organization profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
          <p className="text-muted-foreground">Manage your organization's profile and legal information.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your contact and legal information below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., TowerCo Alpha" {...field} />
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
                          <Input placeholder="e.g., 555-800-0001" {...field} />
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
                          <Input placeholder="e.g., contact@towercoalpha.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="registered_address_line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1 Tower Plaza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Infrastructure City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Region</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 90210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="commercial_tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commercial Tax ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CTX12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="operating_license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operating License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., OLN-ALPHA-987" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem>
                      <FormLabel>Commercial Tax ID Proof</FormLabel>
                      <div className="flex items-center gap-2">
                          <Input type="file" disabled={isSaving} />
                          <Button type="button" variant="secondary" disabled={isSaving}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                          </Button>
                      </div>
                      <FormDescription>Upload a new document to replace the existing one.</FormDescription>
                    </FormItem>
                     <FormItem>
                      <FormLabel>Operating License Document</FormLabel>
                       <div className="flex items-center gap-2">
                          <Input type="file" disabled={isSaving} />
                          <Button type="button" variant="secondary" disabled={isSaving}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                          </Button>
                      </div>
                      <FormDescription>Upload a new document to replace the existing one.</FormDescription>
                    </FormItem>
                 </div>
                <div className="flex justify-end pt-4">
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
      </div>
    </div>
  );
}
