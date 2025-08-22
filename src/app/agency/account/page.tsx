
'use client';

import { useState, useEffect } from 'react';
import type { Organization, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin } from 'lucide-react';


export default function AgencyAccountPage() {
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

  const avatarSrc = agency?.logo || agency?.member?.profile_picture;
  const avatarFallback = agency?.name ? agency.name.charAt(0) : 'A';
  
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
                        <p className="text-muted-foreground">Agency Profile</p>
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
      </div>
    </div>
  );
}
