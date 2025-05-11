import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
  schedules_count: number;
  created_at: string;
}

interface RoomsData {
  data: Room[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface IndexProps extends PageProps {
  rooms: RoomsData;
}

export default function Index({ auth, rooms }: IndexProps) {
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this room?")) {
      router.delete(route("admin.rooms.destroy", { room: id }));
    }
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Rooms Management" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rooms Management</h1>
          <div className="flex gap-2">
            <Link href={route("admin.rooms.timetable")}>
              <Button variant="outline">View Timetable</Button>
            </Link>
            <Link href={route("admin.rooms.create")}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Room
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>
              Manage the rooms used for courses and scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedules</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.data.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.location}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={room.is_active ? "default" : "secondary"}>
                          {room.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.schedules_count}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 focus-visible:ring-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={route("admin.rooms.show", {
                                  room: room.id,
                                })}
                              >
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={route("admin.rooms.edit", {
                                  room: room.id,
                                })}
                              >
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(room.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {rooms.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={rooms.current_page}
                  lastPage={rooms.last_page}
                  perPage={rooms.per_page}
                  total={rooms.total}
                  onPageChange={(page) =>
                    router.get(
                      route("admin.rooms.index", {
                        page,
                      })
                    )
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 