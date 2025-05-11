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
import { ArrowLeftIcon, CalendarIcon } from 'lucide-react';

interface Course {
  id: number;
  title: string;
}

interface CreateProps extends PageProps {
  course: Course;
}

export default function Create({ auth, course }: CreateProps) {
  const { data, setData, errors, post, processing, progress } = useForm({
    title: '',
    description: '',
    due_date: '',
    attachment: null as File | null,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teacher.courses.homework.store', course.id), {
      forceFormData: true,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('attachment', e.target.files[0]);
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head title="Assign New Homework" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center mb-6">
                <Link href={route('teacher.courses.homework.index', course.id)}>
                  <Button variant="outline" size="sm" className="mr-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Homework
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">Assign New Homework</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Create Homework Assignment for {course.title}</CardTitle>
                  <CardDescription>
                    Set up a new homework assignment for your students to complete.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Assignment Title</Label>
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
                        <Label htmlFor="description">Assignment Description</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          rows={4}
                          className={errors.description ? 'border-red-500' : ''}
                          placeholder="Provide detailed instructions for this assignment..."
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="due_date">Due Date</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="due_date"
                            type="datetime-local"
                            value={data.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                            className={`pl-10 ${errors.due_date ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.due_date && (
                          <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="attachment">Attachment (Optional)</Label>
                        <Input
                          id="attachment"
                          type="file"
                          onChange={handleFileChange}
                          className={errors.attachment ? 'border-red-500' : ''}
                        />
                        {errors.attachment && (
                          <p className="text-red-500 text-sm mt-1">{errors.attachment}</p>
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
                        <p className="text-gray-500 text-sm mt-1">
                          You can attach a document with additional information or resources.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('teacher.courses.homework.index', course.id)}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        Assign Homework
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