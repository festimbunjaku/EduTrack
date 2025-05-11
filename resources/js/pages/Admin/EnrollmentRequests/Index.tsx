import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';

interface EnrollmentRequest {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  status: string;
  created_at: string;
}

interface Props extends PageProps {
  requests: EnrollmentRequest[];
  filters: {
    search: string;
  };
}

export default function Index({ auth, requests, filters }: Props) {
  const [searchParams, setSearchParams] = useState(filters);

  const updateSearch = (value: string) => {
    const newParams = { ...searchParams, search: value };
    setSearchParams(newParams);
    router.get(route('admin.enrollment-requests.index'), newParams, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleApprove = (requestId: number) => {
    router.post(route('admin.enrollment-requests.approve', requestId), {}, {
      preserveScroll: true,
    });
  };

  const handleDeny = (requestId: number) => {
    router.post(route('admin.enrollment-requests.deny', requestId), {}, {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Enrollment Requests</h2>}
    >
      <Head title="Enrollment Requests" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 max-w-sm">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    type="text"
                    value={searchParams.search || ''}
                    onChange={(e) => updateSearch(e.target.value)}
                    placeholder="Search by student name or email..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => router.visit(route('admin.enrollment-requests.history'))}
                  >
                    View History
                  </Button>
                </div>
              </div>

              {/* Requests Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.user.name}</TableCell>
                        <TableCell>{request.user.email}</TableCell>
                        <TableCell>{request.course.title}</TableCell>
                        <TableCell>{request.course.teacher.name}</TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeny(request.id)}
                            >
                              Deny
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No pending enrollment requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 