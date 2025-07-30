
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Organization, User } from '@/types';

interface LoginResponse {
  token: string;
  user: User;
  organization: Organization | null;
  country: any; // The country can be at the root or nested, handle flexibly.
}

// Mock API responses based on user input
const MOCK_TOWERCO_RESPONSE: LoginResponse = {
    "token": "some_towerco_token_string",
    "user": {
        "id": 2,
        "email": "towerco@i4sight.net",
        "first_name": "TowerCo",
        "last_name": "User",
        "middle_name": null,
        "role": "T",
        "role_details": "Tower Company",
        "date_joined": "2025-07-30T07:47:32.371932Z",
        "last_login": "2025-07-30T07:47:32.371972Z",
        "has_user_profile": false,
        "country": {
            "id": 290557,
            "name": "United Arab Emirates",
            "code3": "ARE",
            "currency": "AED",
            "currency_name": "Dirham",
            "currency_symbol": "د.إ",
            "phone": "971"
        }
    },
    "organization": {
        id: 'TCO01',
        name: 'TowerCo Alpha',
        role: 'TOWERCO',
        email: 'contact@towercoalpha.com',
        phone: '555-800-0001',
        registered_address_line1: '1 Tower Plaza',
        city: 'Infrastructure City',
        state: 'CA',
        country: 'USA',
        pincode: '90210',
        commercial_tax_id: 'CTX12345',
        commercial_tax_id_proof: '/path/to/tax_proof_alpha.pdf',
        operating_license_number: 'OLN-ALPHA-987',
        operating_license_document: '/path/to/license_alpha.pdf',
        logo: 'https://placehold.co/100x100.png',
    },
    "country": {
        "id": 290557,
        "name": "United Arab Emirates",
        "code3": "ARE",
        "currency": "AED",
        "currency_name": "Dirham",
        "currency_symbol": "د.إ",
        "phone": "971"
    }
};

const MOCK_AGENCY_RESPONSE: LoginResponse = {
    "token": "5853a4ac6dd4659f540589e297cf181d2eff1996",
    "user": {
        "id": 4,
        "email": "testsecurity1@i4sight.net",
        "first_name": "Test Security Agency 1",
        "middle_name": null,
        "last_name": null,
        "role": "SA",
        "role_details": "Security Agency",
        "date_joined": "2025-07-30T07:58:42.758101Z",
        "last_login": "2025-07-30T08:00:24.623352Z",
        "has_user_profile": false,
    },
    "organization": null,
    "country": {
        "id": 290557,
        "name": "United Arab Emirates",
        "code3": "ARE",
        "currency": "AED",
        "currency_name": "Dirham",
        "currency_symbol": "د.إ",
        "phone": "971"
    }
};


export default function RootPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate a delay for loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      // Simulate fetching API and getting a response based on email
      const isAgencyUser = email.toLowerCase().includes('agency');
      const response: LoginResponse = isAgencyUser ? MOCK_AGENCY_RESPONSE : MOCK_TOWERCO_RESPONSE;

      toast({
        title: 'Login Successful',
        description: `Welcome, ${response.user.first_name}! Redirecting...`,
      });

      // Redirect based on whether the 'organization' object is present
      if (response.organization) {
        router.push('/towerco/home');
      } else {
        router.push('/agency/home');
      }

    } catch (error: any) {
       toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'An error occurred. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-4 my-8 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Left Column */}
        <div className="w-full md:w-2/5 bg-[#1e90ff] text-white p-8 sm:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white rounded-full p-2">
               <svg
                  className="w-10 h-10 text-[#1e90ff]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                    opacity="0.3"
                  />
                  <path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm0 2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm0 10.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5-4.5z" />
                  <path d="M7 12.5c0-.64.13-1.25.36-1.82-.55-.25-1.18-.38-1.86-.38-1.66 0-3 1.34-3 3s1.34 3 3 3c.68 0-1.31-.13-1.86-.38C7.13 13.75 7 13.14 7 12.5zm10 0c0-.64-.13-1.25-.36-1.82.55-.25 1.18-.38 1.86-.38 1.66 0 3 1.34 3 3s-1.34 3-3 3c-.68 0-1.31-.13-1.86-.38.23-.57.36-1.18.36-1.82z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold">Secure Buddy</h1>
          </div>
          <h2 className="text-2xl font-bold mb-6">WHY SIGN UP?</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center gap-3">
              <CheckIcon className="w-6 h-6" />
              <span className='font-medium'>It's Secure & Free</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="w-6 h-6" />
              <span className='font-medium'>One Platform For Everyone</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckIcon className="w-6 h-6" />
              <span className='font-medium'>Centralized Resource Management</span>
            </li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-3/5 bg-card text-card-foreground p-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">SIGN IN</TabsTrigger>
              <TabsTrigger value="signup">SIGN UP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-8">
              <Card className="border-0 shadow-none">
                <form onSubmit={handleSignIn}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your portal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-in">Email</Label>
                      <Input 
                        id="email-in" 
                        type="email" 
                        placeholder="your-email@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-in">Password</Label>
                      <Input 
                        id="password-in" 
                        type="password" 
                        placeholder="Enter your password"
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-[#1e90ff] hover:bg-[#1c86ee]" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-8">
               <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
                    <CardDescription>
                    Create an account to get started with Secure Buddy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-up">EMAIL ADDRESS <span className="text-destructive">*</span></Label>
                    <Input id="email-up" type="email" placeholder="Enter Email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname-up">FIRST NAME <span className="text-destructive">*</span></Label>
                    <Input id="firstname-up" type="text" placeholder="As Per Government Records" required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="middlename-up">MIDDLE NAME</Label>
                    <Input id="middlename-up" type="text" placeholder="As Per Government Records" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="lastname-up">LAST NAME <span className="text-destructive">*</span></Label>
                    <Input id="lastname-up" type="text" placeholder="As Per Government Records" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-up">PLATFORM ROLE <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger id="role-up">
                            <SelectValue placeholder="Choose An Option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="officer">Patrolling Officer</SelectItem>
                            <SelectItem value="guard">Security Guard</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up">PASSWORD <span className="text-destructive">*</span></Label>
                    <Input id="password-up" type="password" placeholder="Enter Password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password-up">CONFIRM PASSWORD <span className="text-destructive">*</span></Label>
                    <Input id="confirm-password-up" type="password" placeholder="Enter Password Again" required />
                  </div>
                   <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-600 hover:underline"
                        >
                            Terms & Conditions
                        </label>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#1e90ff] hover:bg-[#1c86ee] text-lg py-6">Create Account &rarr;</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
