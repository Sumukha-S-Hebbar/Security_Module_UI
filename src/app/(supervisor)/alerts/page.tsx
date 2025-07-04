import { alerts } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts Log</h1>
        <p className="text-muted-foreground">
          A historical record of all system alerts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.id}</TableCell>
                  <TableCell>{alert.type}</TableCell>
                  <TableCell>{alert.date}</TableCell>
                  <TableCell>{alert.site}</TableCell>
                  <TableCell>{alert.guard}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn({
                        'bg-red-500 hover:bg-red-600': alert.status === 'Active',
                        'bg-blue-500 hover:bg-blue-600': alert.status === 'Investigating',
                        'bg-green-500 hover:bg-green-600': alert.status === 'Resolved',
                      })}
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
