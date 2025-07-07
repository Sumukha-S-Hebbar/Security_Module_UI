'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';

const formSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

export function GuardUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // In a real application, you would process the CSV file here.
    // For this prototype, we'll just simulate a delay and show a success message.
    console.log('Uploaded file:', values.csvFile[0]);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'Upload Successful',
      description: `File "${values.csvFile[0].name}" has been uploaded. Guard profiles would be processed.`,
    });

    form.reset({ csvFile: undefined });
    // This is a workaround to clear the file input visually since form.reset() doesn't do it for file inputs.
    const fileInput = document.getElementById('csvFile-guard-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Guard Profiles</CardTitle>
        <CardDescription>
          Upload a CSV file to add multiple security guard profiles at once.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="csvFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guard CSV File</FormLabel>
                  <FormControl>
                    <Input
                      id="csvFile-guard-input"
                      type="file"
                      accept=".csv"
                      disabled={isLoading}
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    The CSV should contain columns: name, phone, site, patrollingOfficerId.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
