import { alerts, guards } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CameraOff, LogOut, Phone } from 'lucide-react';
import type { Alert } from '@/types';

export default function AlertsPage() {
  const emergencyAlerts = alerts.filter((alert) => alert.type === 'Emergency');
  const otherAlerts = alerts.filter((alert) => alert.type !== 'Emergency');

  const getGuardByName = (name: string) => guards.find((g) => g.name === name);

  const alertTypeDisplay = (type: Alert['type']) => {
    switch (type) {
      case 'Emergency':
        return (
          <div className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency</span>
          </div>
        );
      case 'Missed Selfie':
        return (
          <div className="flex items-center gap-2">
            <CameraOff className="h-4 w-4 text-muted-foreground" />
            <span>Missed Selfie</span>
          </div>
        );
      case 'Guard Out of Premises':
        return (
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>Guard Out of Premises</span>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts Log</h1>
        <p className="text-muted-foreground">
          A historical record of all system alerts.
        </p>
      </div>

      {emergencyAlerts.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Emergency Alerts
            </CardTitle>
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
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emergencyAlerts.map((alert) => {
                  const guardDetails = getGuardByName(alert.guard);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.id}</TableCell>
                      <TableCell>{alertTypeDisplay(alert.type)}</TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>{alert.site}</TableCell>
                      <TableCell>{alert.guard}</TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="destructive" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone />
                              Contact Guard
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Guard Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {otherAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherAlerts.map((alert) => {
                  const guardDetails = getGuardByName(alert.guard);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.id}</TableCell>
                      <TableCell>{alertTypeDisplay(alert.type)}</TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>{alert.site}</TableCell>
                      <TableCell>{alert.guard}</TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone />
                              Contact Guard
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              No general alerts found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
