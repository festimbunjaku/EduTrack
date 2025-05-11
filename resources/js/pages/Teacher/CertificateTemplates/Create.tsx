import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCertificateTemplate() {
  const { toast } = useToast();
  const { data, setData, post, errors, processing } = useForm({
    name: '',
    description: '',
    background_image: null as File | null,
    html_template: `<!DOCTYPE html>
<html>
<head>
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            text-align: center;
            margin: 0;
            padding: 0;
            background-size: cover;
            width: 100%;
            height: 100%;
        }
        .certificate {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
        }
        .title {
            font-size: 48px;
            margin-top: 100px;
            color: #1a3c6e;
        }
        .subtitle {
            font-size: 28px;
            margin: 20px 0;
        }
        .name {
            font-size: 36px;
            margin: 30px 0;
            font-weight: bold;
            color: #1a3c6e;
        }
        .course {
            font-size: 24px;
            margin: 20px 0;
        }
        .date {
            font-size: 20px;
            margin: 30px 0;
        }
        .signature-area {
            margin-top: 80px;
            display: flex;
            justify-content: center;
        }
        .signature {
            border-top: 1px solid #333;
            padding-top: 5px;
            width: 200px;
            margin: 0 20px;
            text-align: center;
        }
        .certificate-number {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="title">Certificate of Completion</div>
        <div class="subtitle">This certifies that</div>
        <div class="name">{{student_name}}</div>
        <div class="subtitle">has successfully completed the course</div>
        <div class="course">{{course_title}}</div>
        <div class="date">Completed on {{completion_date}}</div>
        
        <div class="signature-area">
            <div class="signature">
                <img src="{{signature_image}}" height="50" />
                <div>{{issuer_name}}</div>
                <div>Instructor</div>
            </div>
        </div>
        
        <div class="certificate-number">Certificate #{{certificate_number}}</div>
    </div>
</body>
</html>`,
    css_styles: '',
    is_active: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('editor');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('teacher.certificate-templates.store'), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Certificate template created successfully.",
        });
      },
    });
  }

  function handleBackgroundImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData('background_image', file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setData('background_image', null);
      setImagePreview(null);
    }
  }

  // Set HTML template with background image when available
  const previewHtml = imagePreview
    ? data.html_template.replace('</head>', `
        <style>
          body {
            background-image: url('${imagePreview}');
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
          }
        </style>
      </head>`)
    : data.html_template;

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Templates', href: route('teacher.certificate-templates.index') },
        { label: 'Create Template', href: '#' }
      ]}
    >
      <Head title="Create Certificate Template" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create Certificate Template</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Create a professional-looking certificate template for your courses.
                    </p>
                  </div>
                  <TabsList>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="editor" className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormItem>
                        <FormLabel htmlFor="name">Template Name</FormLabel>
                        <FormControl>
                          <Input 
                            id="name"
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g., Professional Certificate"
                            required
                          />
                        </FormControl>
                        {errors.name && <FormMessage>{errors.name}</FormMessage>}
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            id="description"
                            value={data.description || ''} 
                            onChange={e => setData('description', e.target.value)}
                            placeholder="A brief description of this certificate template"
                            rows={3}
                          />
                        </FormControl>
                        {errors.description && <FormMessage>{errors.description}</FormMessage>}
                      </FormItem>

                      <FormItem>
                        <FormLabel htmlFor="background_image">Background Image</FormLabel>
                        <FormControl>
                          <Input 
                            id="background_image"
                            type="file" 
                            onChange={handleBackgroundImageChange}
                            accept="image/*"
                            className="cursor-pointer"
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a background image for your certificate (max 2MB)
                        </FormDescription>
                        {errors.background_image && <FormMessage>{errors.background_image}</FormMessage>}
                      </FormItem>

                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-2">Background Preview:</p>
                          <div className="border rounded-md overflow-hidden">
                            <img 
                              src={imagePreview} 
                              alt="Background preview" 
                              className="max-w-full h-auto"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={data.is_active}
                          onCheckedChange={value => setData('is_active', value)}
                        />
                        <Label htmlFor="is_active">Active Template</Label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Tabs defaultValue="html" className="w-full">
                        <TabsList className="mb-2 w-full">
                          <TabsTrigger value="html" className="flex-1">HTML Template</TabsTrigger>
                          <TabsTrigger value="css" className="flex-1">CSS Styles</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="html">
                          <FormItem>
                            <FormLabel htmlFor="html_template">HTML Structure</FormLabel>
                            <FormControl>
                              <Textarea 
                                id="html_template"
                                value={data.html_template} 
                                onChange={e => setData('html_template', e.target.value)}
                                rows={15}
                                className="font-mono text-sm"
                                required
                              />
                            </FormControl>
                            <FormDescription>
                              Use variables like {{student_name}}, {{course_title}}, etc.
                            </FormDescription>
                            {errors.html_template && <FormMessage>{errors.html_template}</FormMessage>}
                          </FormItem>
                        </TabsContent>
                        
                        <TabsContent value="css">
                          <FormItem>
                            <FormLabel htmlFor="css_styles">Additional CSS Styles</FormLabel>
                            <FormControl>
                              <Textarea 
                                id="css_styles"
                                value={data.css_styles || ''} 
                                onChange={e => setData('css_styles', e.target.value)}
                                rows={15}
                                className="font-mono text-sm"
                                placeholder="Add additional CSS styles here..."
                              />
                            </FormControl>
                            {errors.css_styles && <FormMessage>{errors.css_styles}</FormMessage>}
                          </FormItem>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.visit(route('teacher.certificate-templates.index'))}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      Create Template
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Preview</CardTitle>
                    <CardDescription>
                      This is how your certificate will appear to students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden aspect-video">
                      <iframe
                        srcDoc={previewHtml}
                        title="Certificate Preview"
                        className="w-full h-full"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <p className="text-sm text-gray-500">
                      Note: This is a preview only. Some variables will be replaced with actual values when issued.
                    </p>
                    <Button
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab('editor')}
                    >
                      Back to Editor
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 