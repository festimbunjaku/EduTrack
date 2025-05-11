import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, ImageIcon } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
  thumbnail_url: string | null;
}

interface EditProps extends PageProps {
  course: Course;
}

export default function Edit({ auth, course }: EditProps) {
  const { data, setData, errors, post, processing, progress } = useForm({
    _method: 'PUT',
    title: course.title,
    description: course.description,
    status: course.status,
    thumbnail: null as File | null,
    remove_thumbnail: false,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teacher.courses.update', course.id), {
      forceFormData: true,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('thumbnail', e.target.files[0]);
    }
  };

  // Handle removing the current thumbnail
  const handleRemoveThumbnail = () => {
    setData('remove_thumbnail', true);
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Edit Course" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center mb-6">
                <Link href={route('teacher.courses.show', course.id)}>
                  <Button variant="outline" size="sm" className="mr-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">Edit Course</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Update the information for {course.title}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          value={data.title}
                          onChange={(e) => setData('title', e.target.value)}
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Course Description</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          rows={4}
                          className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={data.status} 
                          onValueChange={(value) => setData('status', value)}
                        >
                          <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select course status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.status && (
                          <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                          Draft courses are only visible to you. Published courses are visible to enrolled students.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="thumbnail">Course Thumbnail</Label>
                        
                        {course.thumbnail_url && !data.remove_thumbnail && (
                          <div className="mb-4">
                            <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                              <div className="mb-2 sm:mb-0 sm:mr-4">
                                <img 
                                  src={course.thumbnail_url} 
                                  alt={course.title} 
                                  className="w-40 h-auto rounded border border-gray-200"
                                />
                              </div>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={handleRemoveThumbnail}
                              >
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {(!course.thumbnail_url || data.remove_thumbnail) && (
                          <>
                            <Input
                              id="thumbnail"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className={errors.thumbnail ? 'border-red-500' : ''}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                              Upload an image to represent your course. Recommended size: 1280x720px.
                            </p>
                          </>
                        )}
                        
                        {errors.thumbnail && (
                          <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
                        )}
                        
                        {progress && (
                          <div className="mt-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('teacher.courses.show', course.id)}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        Update Course
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 