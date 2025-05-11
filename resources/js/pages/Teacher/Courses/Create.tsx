import React from 'react';
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
import { ArrowLeftIcon } from 'lucide-react';

export default function Create({ auth }: PageProps) {
  const { data, setData, errors, post, processing } = useForm({
    title: '',
    description: '',
    status: 'draft',
    thumbnail: null as File | null,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teacher.courses.store'), {
      forceFormData: true,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('thumbnail', e.target.files[0]);
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Create New Course" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center mb-6">
                <Link href={route('teacher.courses.index')}>
                  <Button variant="outline" size="sm" className="mr-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Courses
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">Create New Course</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>
                    Create a new course for your students.
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
                          placeholder="e.g., Introduction to Mathematics"
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
                          placeholder="Provide a detailed description of what students will learn in this course..."
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
                        <Label htmlFor="thumbnail">Course Thumbnail (Optional)</Label>
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={errors.thumbnail ? 'border-red-500' : ''}
                        />
                        {errors.thumbnail && (
                          <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                          Upload an image to represent your course. Recommended size: 1280x720px.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('teacher.courses.index')}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        Create Course
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