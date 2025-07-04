
import { guards, supervisors } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuardUploader } from './_components/guard-uploader';

export default function AgencyGuardsPage() {
    const getSupervisorById = (id?: string) => supervisors.find((s) => s.id === id);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Guard Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage guard profiles and their assignments.
                </p>
            </div>

            <GuardUploader />

            <Card>
                <CardHeader>
                    <CardTitle>All Security Guards</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guard</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Perimeter Accuracy</TableHead>
                                <TableHead>Leave Days</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guards.map((guard) => {
                                const supervisor = getSupervisorById(guard.supervisorId);
                                return (
                                    <TableRow key={guard.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={guard.avatar} alt={guard.name} />
                                                    <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{guard.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ID: {guard.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{guard.site}</TableCell>
                                        <TableCell>{supervisor?.name || 'Unassigned'}</TableCell>
                                        <TableCell>{guard.phone}</TableCell>
                                        <TableCell>{guard.performance?.perimeterAccuracy}%</TableCell>
                                        <TableCell>{guard.performance?.leaveDays}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
