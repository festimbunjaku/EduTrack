import { Head, Link, router } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { PageProps, Course, Homework } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse, addDays, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  ChevronLeft, 
  Upload, 
  File, 
  X, 
  Download,
  AlertCircle
} from "lucide-react";
import { useState, FormEvent, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditProps extends PageProps {
  homework: Homework;
  course: Course;
}

// Error boundary component to catch rendering errors
class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error in component:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

// Fallback component when main component fails
function EditFallback({ auth, homework, course }: EditProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const [formData, setFormData] = useState({
    title: homework?.title || "Untitled Homework",
    description: homework?.description || "",
    deadline: nextWeek,
    max_score: "100",
  });
  
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.error("Please refresh the page and try again");
  };
  
  return (
    <AppSidebarLayout user={auth.user}>
      <Head title="Edit Homework" />
      
      <div className="p-6 space-y-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading the homework data. Some features may be limited.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.all.homework.index")}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to All Homework
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Homework</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Homework Assignment</CardTitle>
            <CardDescription>
              Please refresh the page if you encounter any issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Basic form fields */}
              <Button type="button" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
}

export default function Edit(props: EditProps) {
  return (
    <ErrorBoundary fallback={<EditFallback {...props} />}>
      <EditContent {...props} />
    </ErrorBoundary>
  );
}

function EditContent({ auth, homework, course }: EditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDateValid, setIsDateValid] = useState(true);
  
  // Simple helper to check if a value is a valid date
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    if (date instanceof Date) return isValid(date);
    return false;
  };
  
  // Safely parse the deadline with a fallback to current date + 7 days
  const getInitialDeadline = () => {
    try {
      // Check if deadline is null, undefined, or empty
      if (!homework?.deadline) {
        console.info("No deadline provided, using default");
        return addDays(new Date(), 7);
      }
      
      console.log("Raw deadline value:", homework.deadline);
      
      // For ISO format strings (which is what we're getting), use the Date constructor directly
      if (typeof homework.deadline === 'string' && homework.deadline.includes('T')) {
        // This is likely an ISO format date
        const isoDate = new Date(homework.deadline);
        
        // Check if valid
        if (!isNaN(isoDate.getTime())) {
          console.log("Successfully parsed ISO date:", isoDate);
          return isoDate;
        }
        
        console.error("ISO date parsing resulted in an invalid date");
      }
      
      // If not ISO or ISO parsing failed, try our format
      let parsedDate = new Date();
      
      try {
        parsedDate = parse(
          homework.deadline,
          "yyyy-MM-dd HH:mm:ss",
          new Date()
        );
      } catch (parseError) {
        console.error("Parse error with standard format:", parseError);
        
        // Last resort - just pass to Date constructor
        try {
          parsedDate = new Date(homework.deadline);
        } catch (altError) {
          console.error("Alternative date parsing failed:", altError);
          throw new Error("Could not parse date in any format");
        }
      }
      
      // Verify if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        console.error("Parsed date is not valid (NaN)");
        throw new Error("Invalid date after parsing");
      }
      
      return parsedDate;
    } catch (error) {
      console.error("Error parsing deadline:", error);
      // Fallback to current date + 7 days
      const fallbackDate = addDays(new Date(), 7);
      console.log("Using fallback date:", fallbackDate);
      setIsDateValid(false);
      return fallbackDate;
    }
  };
  
  // Create the form data after ensuring we have a valid deadline
  const [formData, setFormData] = useState(() => {
    const deadline = getInitialDeadline();
    return {
      title: homework?.title || "",
      description: homework?.description || "",
      deadline: deadline,
      max_score: homework?.max_score?.toString() || "100",
    };
  });
  
  // Set a default date if we detect an issue with the date after mounting
  useEffect(() => {
    if (!isValidDate(formData.deadline)) {
      console.log("Invalid date detected in effect, setting fallback");
      setFormData(prev => ({
        ...prev,
        deadline: addDays(new Date(), 7)
      }));
      setIsDateValid(false);
    }
  }, []);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format the data for submission
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description || "");
      
      // Safely format the deadline
      let formattedDeadline;
      try {
        if (isValidDate(formData.deadline)) {
          formattedDeadline = format(formData.deadline, "yyyy-MM-dd HH:mm:ss");
        } else {
          // If deadline is invalid, use current date + 7 days
          formattedDeadline = format(addDays(new Date(), 7), "yyyy-MM-dd HH:mm:ss");
        }
      } catch (error) {
        // If formatting fails, use current date + 7 days
        formattedDeadline = format(addDays(new Date(), 7), "yyyy-MM-dd HH:mm:ss");
      }
      
      data.append("deadline", formattedDeadline);
      data.append("max_score", formData.max_score);
      data.append("_method", "PUT");
      
      if (selectedFile) {
        data.append("attachment", selectedFile);
      }

      router.post(
        route("admin.all.homework.update", homework.id),
        data,
        {
          onSuccess: () => {
            toast.success("Homework updated successfully");
            router.visit(route("admin.all.homework.show", homework.id));
          },
          onError: (errors) => {
            setIsSubmitting(false);
            toast.error("Failed to update homework");
            console.error(errors);
          },
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      toast.error("An error occurred while submitting the form");
      console.error("Form submission error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveAttachment = () => {
    setSelectedFile(null);
  };

  return (
    <AppSidebarLayout user={auth.user}>
      <Head title={`Edit Homework - ${homework?.title || "Homework"}`} />

      <div className="p-6 space-y-6">
        {!isDateValid && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              There was an issue with the deadline date. A default deadline (7 days from now) has been set.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route("admin.all.homework.show", homework.id)}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Homework Details
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Homework</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Homework Assignment</CardTitle>
            <CardDescription>
              Update homework details for {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter homework title"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    A clear, descriptive title for the homework assignment
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter detailed instructions for the homework"
                    rows={6}
                    className="min-h-32"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide clear instructions, requirements, and any resources needed
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">Submission Deadline</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="deadline"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formData.deadline && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {isValidDate(formData.deadline) ? (
                          format(formData.deadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={isValidDate(formData.deadline) ? formData.deadline : undefined}
                        onSelect={(date) => date && handleInputChange("deadline", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Set the date when students must submit their work
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_score" className="text-sm font-medium">Maximum Score</label>
                  <Input
                    id="max_score"
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => handleInputChange("max_score", e.target.value)}
                    placeholder="100"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    The maximum points possible for this assignment
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="attachment" className="text-sm font-medium">Attachment</label>
                  <div className="grid w-full items-center gap-1.5">
                    {homework.attachment_path && !selectedFile ? (
                      <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                        <File className="h-5 w-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">
                            {homework.attachment_path.split('/').pop()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={route("admin.all.homework.download", homework.id)}
                            className="shrink-0"
                          >
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Remove attachment"
                            onClick={handleRemoveAttachment}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="attachment"
                          className="relative cursor-pointer border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium">
                            {selectedFile
                              ? `Selected: ${selectedFile.name}`
                              : "Click to upload a file"}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PDF, DOC, DOCX, TXT, ZIP, etc. (10 MB max)
                          </span>
                          <Input
                            id="attachment"
                            type="file"
                            onChange={handleFileChange}
                            className="sr-only"
                            disabled={isSubmitting}
                          />
                        </label>
                        {selectedFile && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={handleRemoveAttachment}
                              type="button"
                            >
                              Remove file
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Link href={route("admin.all.homework.show", homework.id)}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Homework"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppSidebarLayout>
  );
} 