
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download detailed reports for your assets.
        </p>
      </div>

      <Tabs defaultValue="agency">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="agency">Agency Reports</TabsTrigger>
          <TabsTrigger value="site">Site Reports</TabsTrigger>
          <TabsTrigger value="guard">Guard Reports</TabsTrigger>
          <TabsTrigger value="supervisor">Supervisor Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="agency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Performance Reports</CardTitle>
              <CardDescription>
                Generate reports on security agency performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select parameters and generate a comprehensive report.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Agency Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Activity Reports</CardTitle>
              <CardDescription>
                Generate reports on individual site activity and incidents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Choose a site and a date range to generate a report.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Site Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guard Performance Reports</CardTitle>
              <CardDescription>
                Generate reports on individual guard performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a guard and date range for a detailed report.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Guard Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supervisor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supervisor Activity Reports</CardTitle>
              <CardDescription>
                Generate reports summarizing supervisor activities and team
                performance.
              </-CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a supervisor for an overview of their managed assets.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Supervisor Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
