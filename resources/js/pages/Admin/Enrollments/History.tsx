import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Enrollment, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronLeft, Calendar, User as UserIcon, Eye } from "lucide-react";
import Pagination from "@/components/Pagination";

interface EnrollmentHistoryItem extends Enrollment {
  user: User;
  course_title: string;
  action: string;
  action_date: string;
  action_by: User;
}

interface HistoryData {
  data: EnrollmentHistoryItem[];
  links: any[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

interface HistoryProps extends PageProps {
  history: HistoryData;
  filters: {
    search: string;
    status: string;
    action: string;
    date_from: string;
    date_to: string;
    sort_field: string;
    sort_direction: string;
  };
  statuses: Record<string, string>;
  actions: Record<string, string>;
}

export default function History({
  auth,
  history,
  filters,
  statuses,
  actions,
}: HistoryProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [dateFrom, setDateFrom] = useState(filters.date_from || "");
  const [dateTo, setDateTo] = useState(filters.date_to || "");
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "waitlisted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "waitlisted":
        return "bg-indigo-100 text-indigo-800";
      case "position_changed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleStatusChange = (status: string) => {
    applyFilters({ status: status === "all" ? "" : status });
  };

  const handleActionChange = (action: string) => {
    applyFilters({ action: action === "all" ? "" : action });
  };

  const handleDateChange = () => {
    applyFilters({ date_from: dateFrom, date_to: dateTo });
  };

  const handleSort = (field: string) => {
    const direction =
      filters.sort_field === field && filters.sort_direction === "asc"
        ? "desc"
        : "asc";
    applyFilters({ sort_field: field, sort_direction: direction });
  };

  const applyFilters = (newFilters: Record<string, any>) => {
    router.get(
      route("admin.enrollments.history"),
      { ...filters, ...newFilters },
      { preserveState: true, replace: true }
    );
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Enrollment History" />

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('admin.enrollments.index')}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Enrollments
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Enrollment History</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Activity Log</CardTitle>
            <CardDescription>
              Track all enrollment-related activities and status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search by student or course..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">Search</Button>
                  </form>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={filters.status ? filters.status : "all"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(statuses).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.action ? filters.action : "all"}
                    onValueChange={handleActionChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {Object.entries(actions).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date-from" className="block text-sm font-medium mb-1">
                      Date From
                    </label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="date-to" className="block text-sm font-medium mb-1">
                      Date To
                    </label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleDateChange}
                  variant="outline"
                  className="mb-0.5"
                >
                  Apply Date Filter
                </Button>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("action_date")}
                      >
                        Date & Time
                        {filters.sort_field === "action_date" && (
                          <span className="ml-1">
                            {filters.sort_direction === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data.length > 0 ? (
                      history.data.map((item) => (
                        <TableRow key={`${item.id}-${item.action_date}`}>
                          <TableCell>
                            {format(new Date(item.action_date), "MMM d, yyyy h:mm a")}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                              {item.user.name}
                            </div>
                          </TableCell>
                          <TableCell>{item.course_title}</TableCell>
                          <TableCell>
                            <Badge
                              className={getActionBadgeColor(item.action)}
                              variant="outline"
                            >
                              {actions[item.action]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(item.status)}
                              variant="outline"
                            >
                              {statuses[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                              {item.action_by.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={route("admin.enrollments.show", item.id)}>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="View enrollment details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No enrollment history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <Pagination links={history.links} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 