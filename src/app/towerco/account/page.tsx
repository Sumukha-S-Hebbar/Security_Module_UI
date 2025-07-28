
'use client';

import { useMemo } from 'react';
import { organizations } from '@/lib/data/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Briefcase, KeyRound } from 'lucide-react';

const LOGGED_IN_ORG_ID = 'TCO01';

// Mock user data since it's not in our data sources
const MOCK_USER = {
  name: 'Tower Co User',
  employeeId: 'ID102',
  designation: 'Senior Manager',
  joinDate: '2023-07-04T00:00:00Z',
  avatar: 'https://placehold.co/128x128.png',
};

export default function TowercoAccountPage() {
  const organization = useMemo(() => organizations.find(o => o.id === LOGGED_IN_ORG_ID), []);

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>PROFILE DETAILS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                <AvatarFallback>{MOCK_USER.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{MOCK_USER.name}</h2>
                <div className="text-muted-foreground mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{organization.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined on {new Date(MOCK_USER.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${organization.email}`} className="hover:underline">{organization.email}</a>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Employee ID</p>
                <p className="font-semibold">{MOCK_USER.employeeId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Designation</p>
                <p className="font-semibold">{MOCK_USER.designation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Organization</p>
                <p className="font-semibold">{organization.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Organization Type</p>
                <p className="font-semibold">{organization.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
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

        <div className="mt-6">
          <Button className="w-full bg-[#1e90ff] hover:bg-[#1c86ee] text-lg py-6">
            <KeyRound className="mr-2 h-5 w-5" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
