import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Enrollment, User, Course } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardList,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ShowProps extends PageProps {
  enrollment: Enrollment & {
    user: User;
    course: Course;
    notes: string | null;
  };
  statuses: Record<string, string>;
  waitlistCount: number;
}

export default function Show({ auth, enrollment, statuses, waitlistCount }: ShowProps) {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "deny" | null>(null);
  const [notes, setNotes] = useState(enrollment.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState(enrollment.waitlist_position?.toString() || "");
  
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

  const openActionDialog = (action: "approve" | "deny") => {
    setActionType(action);
    setNotes(enrollment.notes || "");
    setIsActionDialogOpen(true);
  };

  const closeActionDialog = () => {
    setActionType(null);
    setNotes(enrollment.notes || "");
    setIsActionDialogOpen(false);
    setIsSubmitting(false);
  };

  const handleAction = () => {
    if (!actionType) return;
    
    setIsSubmitting(true);
    router.post(route(`admin.enrollments.${actionType}`, enrollment.id), {
      notes: notes,
    }, {
      onSuccess: () => {
        closeActionDialog();
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const getActionTitle = () => {
    if (actionType === "approve") {
      return "Approve Enrollment";
    } else if (actionType === "deny") {
      return "Deny Enrollment";
    }
    return "";
  };

  const getActionDescription = () => {
    const studentName = enrollment.user?.name || "this student";
    const courseName = enrollment.course?.title || "this course";

    if (actionType === "approve") {
      return `Are you sure you want to approve ${studentName}'s enrollment in ${courseName}?`;
    } else if (actionType === "deny") {
      return `Are you sure you want to deny ${studentName}'s enrollment in ${courseName}?`;
    }
    return "";
  };

  const handleWaitlistPosition = () => {
    if (!newPosition) return;
    
    setIsSubmitting(true);
    router.post(route("admin.enrollments.updateWaitlist", enrollment.id), {
      position: parseInt(newPosition),
    }, {
      onSuccess: () => {
        setIsWaitlistDialogOpen(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const moveWaitlistPosition = (direction: "up" | "down") => {
    if (!enrollment.waitlist_position) return;
    
    const newPos = direction === "up" 
      ? Math.max(1, enrollment.waitlist_position - 1)
      : Math.min(waitlistCount, enrollment.waitlist_position + 1);
    
    if (newPos === enrollment.waitlist_position) return;
    
    router.post(route("admin.enrollments.updateWaitlist", enrollment.id), {
      position: newPos,
    });
  };

  const userInitials = enrollment.user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Enrollment: ${enrollment.user.name}`} />

      <Dialog open={isActionDialogOpen} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {getActionTitle()}
            </DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this enrollment decision..."
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeActionDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : actionType === "approve" ? 'Approve' : 'Deny'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWaitlistDialogOpen} onOpenChange={setIsWaitlistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Waitlist Position</DialogTitle>
            <DialogDescription>
              Enter a new waitlist position for {enrollment.user.name}. Current position: {enrollment.waitlist_position}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="number"
              min="1"
              max={waitlistCount}
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Enter position number"
            />
            <p className="text-xs text-gray-500 mt-1">Position must be between 1 and {waitlistCount}</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsWaitlistDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWaitlistPosition}
              disabled={isSubmitting || !newPosition}
            >
              {isSubmitting ? 'Updating...' : 'Update Position'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('admin.enrollments.index')}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Enrollments
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Enrollment Details</h1>
            <Badge
              className={getStatusBadgeColor(enrollment.status)}
              variant="outline"
            >
              {statuses[enrollment.status]}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {enrollment.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-green-600"
                  onClick={() => openActionDialog("approve")}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-red-600"
                  onClick={() => openActionDialog("deny")}
                >
                  <XCircle className="h-4 w-4" />
                  Deny
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={enrollment.user.avatar} alt={enrollment.user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{enrollment.user.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{enrollment.user.email}</span>
                    </div>
                    {enrollment.user.phone && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{enrollment.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{enrollment.course.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(enrollment.course.start_date), "MMM d, yyyy")} - {format(new Date(enrollment.course.end_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{enrollment.course.location}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Schedule</h4>
                    <div className="space-y-2">
                      {Object.entries(enrollment.course.schedule).map(([day, times]) => (
                        <div key={day} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="capitalize">{day}: {times}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-gray-50">
                <div className="w-full flex justify-end">
                  <Link href={route('admin.courses.show', enrollment.course.id)}>
                    <Button variant="outline" size="sm">
                      View Full Course Details
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>

            {enrollment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{enrollment.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Status</p>
                    <Badge
                      className={getStatusBadgeColor(enrollment.status)}
                      variant="outline"
                    >
                      {statuses[enrollment.status]}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Request Date</p>
                    <p>{format(new Date(enrollment.created_at), "MMMM d, yyyy")}</p>
                  </div>

                  {enrollment.updated_at !== enrollment.created_at && (
                    <div>
                      <p className="text-sm font-medium mb-1">Last Updated</p>
                      <p>{format(new Date(enrollment.updated_at), "MMMM d, yyyy")}</p>
                    </div>
                  )}

                  {enrollment.status === 'waitlisted' && enrollment.waitlist_position && (
                    <div>
                      <p className="text-sm font-medium mb-1">Waitlist Position</p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-blue-50">
                          #{enrollment.waitlist_position} of {waitlistCount}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => moveWaitlistPosition("up")}
                            disabled={enrollment.waitlist_position <= 1}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => moveWaitlistPosition("down")}
                            disabled={enrollment.waitlist_position >= waitlistCount}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setNewPosition(enrollment.waitlist_position?.toString() || "");
                          setIsWaitlistDialogOpen(true);
                        }}
                      >
                        Set Specific Position
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enrollment.status === 'pending' && (
                  <>
                    <Button 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => openActionDialog("approve")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Enrollment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 text-red-600"
                      onClick={() => openActionDialog("deny")}
                    >
                      <XCircle className="h-4 w-4" />
                      Deny Enrollment
                    </Button>
                  </>
                )}
                
                {enrollment.status === 'approved' && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 text-red-600"
                    onClick={() => openActionDialog("deny")}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Enrollment
                  </Button>
                )}
                
                {enrollment.status === 'denied' && (
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => openActionDialog("approve")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Enrollment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
} 