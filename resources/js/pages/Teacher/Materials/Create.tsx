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
import { ArrowLeftIcon, FileIcon, LinkIcon, VideoIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    type: 'document',
    content: '',
    file: null as File | null,
    is_downloadable: true,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('teacher.courses.materials.store', course.id), {
      forceFormData: true,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('file', e.target.files[0]);
    }
  };

  // Determine if we should show file upload based on type
  const shouldShowFileUpload = data.type === 'document' || data.type === 'video' || data.type === 'presentation';
  
  // Determine if we should show content field based on type
  const shouldShowContentField = data.type === 'text' || data.type === 'link';

  return (
    <AppLayout user={auth.user}>
      <Head title="Add Course Material" />

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
                <h1 className="text-2xl font-semibold text-gray-800">Add Course Material</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Add Material to {course.title}</CardTitle>
                  <CardDescription>
                    Upload files or create content for your students.
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
                          placeholder="e.g., Week 1 Lecture Slides"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          rows={3}
                          className={errors.description ? 'border-red-500' : ''}
                          placeholder="Provide a brief description of this material..."
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
                                <FileIcon className="h-4 w-4 mr-2" />
                                <span>Document</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center">
                                <VideoIcon className="h-4 w-4 mr-2" />
                                <span>Video</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="presentation">
                              <div className="flex items-center">
                                <FileIcon className="h-4 w-4 mr-2" />
                                <span>Presentation</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="link">
                              <div className="flex items-center">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                <span>External Link</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="text">
                              <div className="flex items-center">
                                <FileIcon className="h-4 w-4 mr-2" />
                                <span>Text Content</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                        )}
                      </div>

                      {shouldShowFileUpload && (
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
                        </div>
                      )}

                      {shouldShowContentField && (
                        <div>
                          <Label htmlFor="content">
                            {data.type === 'link' ? 'URL' : 'Content'}
                          </Label>
                          <Textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={data.type === 'link' ? 1 : 6}
                            className={errors.content ? 'border-red-500' : ''}
                            placeholder={
                              data.type === 'link'
                                ? 'https://example.com/resource'
                                : 'Enter your content here...'
                            }
                          />
                          {errors.content && (
                            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                          )}
                        </div>
                      )}

                      {shouldShowFileUpload && (
                        <div>
                          <Label>Download Options</Label>
                          <RadioGroup
                            value={data.is_downloadable ? 'true' : 'false'}
                            onValueChange={(value) => setData('is_downloadable', value === 'true')}
                            className="mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="downloadable-yes" />
                              <Label htmlFor="downloadable-yes" className="cursor-pointer">
                                Allow students to download this file
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="downloadable-no" />
                              <Label htmlFor="downloadable-no" className="cursor-pointer">
                                Students can only view online
                              </Label>
                            </div>
                          </RadioGroup>
                          {errors.is_downloadable && (
                            <p className="text-red-500 text-sm mt-1">{errors.is_downloadable}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('teacher.courses.show', course.id)}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        Add Material
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