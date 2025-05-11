import { Head, useForm } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormEvent } from "react";

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

interface EditProps extends PageProps {
  room: Room;
}

export default function Edit({ auth, room }: EditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: room.name,
    location: room.location || "",
    capacity: room.capacity.toString(),
    is_active: room.is_active,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    put(route("admin.rooms.update", { room: room.id }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as any, value);
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Edit Room: ${room.name}`} />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Room</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
            <CardDescription>
              Update the room details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    placeholder="Room 101"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={data.location}
                    onChange={handleChange}
                    placeholder="Main Building, 1st Floor"
                  />
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    value={data.capacity}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    max="100"
                    required
                  />
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active" className="mb-2 block">Active Status</Label>
                  {typeof data.is_active === 'boolean' && (
                    <Toggle
                      id="is_active"
                      pressed={data.is_active}
                      onPressedChange={(pressed) => setData("is_active", pressed)}
                      aria-label="Toggle active status"
                    >
                      {data.is_active ? "Active" : "Inactive"}
                    </Toggle>
                  )}
                  {errors.is_active && <p className="text-sm text-red-500">{errors.is_active}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  {processing ? "Updating..." : "Update Room"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 