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
import { ArrowLeftIcon, FileIcon, LinkIcon, VideoIcon } from 'lucide-react';

interface Course {
  id: number;
  title: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  file_path?: string;
  url?: string;
  created_at: string;
}

interface EditProps extends PageProps {
  course: Course;
  material: Material;
}

export default function Edit({ auth, course, material }: EditProps) {
  const { data, setData, errors, post, processing, progress } = useForm({
    title: material.title,
    description: material.description,
    type: material.type,
    file: null as File | null,
    url: material.url || '',
    _method: 'PUT'
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teacher.courses.materials.update', [course.id, material.id]), {
      forceFormData: true,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('file', e.target.files[0]);
    }
  };

  // Get the filename from the file path
  const getFileName = (filePath: string) => {
    if (!filePath) return '';
    return filePath.split('/').pop() || '';
  };

  return (
    <AppLayout user={auth.user}>
      <Head title={`Edit ${material.title}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center mb-6">
                <Link href={route('teacher.courses.materials.show', [course.id, material.id])}>
                  <Button variant="outline" size="sm" className="mr-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Material
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">Edit Material</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Material for {course.title}</CardTitle>
                  <CardDescription>
                    Update the details of your learning material.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Material Title</Label>
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
                        <Label htmlFor="description">Description</Label>
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
                        <Label htmlFor="type">Material Type</Label>
                        <Select
                          value={data.type}
                          onValueChange={(value) => setData('type', value)}
                        >
                          <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">
                              <div className="flex items-center">
                                <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                                Document
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center">
                                <VideoIcon className="h-4 w-4 mr-2 text-purple-500" />
                                Video
                              </div>
                            </SelectItem>
                            <SelectItem value="link">
                              <div className="flex items-center">
                                <LinkIcon className="h-4 w-4 mr-2 text-green-500" />
                                External Link
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                        )}
                      </div>

                      {(data.type === 'document' || data.type === 'video') && (
                        <div>
                          <Label htmlFor="file">Upload File</Label>
                          <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            className={errors.file ? 'border-red-500' : ''}
                          />
                          {errors.file && (
                            <p className="text-red-500 text-sm mt-1">{errors.file}</p>
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
                          {material.file_path && (
                            <p className="text-gray-500 text-sm mt-1">
                              Current file: {getFileName(material.file_path)}
                              <br />
                              {data.file ? 'This file will be replaced.' : 'Leave empty to keep the current file.'}
                            </p>
                          )}
                        </div>
                      )}

                      {data.type === 'link' && (
                        <div>
                          <Label htmlFor="url">URL</Label>
                          <Input
                            id="url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://example.com"
                            className={errors.url ? 'border-red-500' : ''}
                          />
                          {errors.url && (
                            <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('teacher.courses.materials.show', [course.id, material.id])}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        Update Material
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