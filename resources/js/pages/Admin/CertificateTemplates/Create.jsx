import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle, 
} from '@/Components/ui/card';
import { 
    Form, 
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

export default function Create({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        background_image: null,
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
        preview: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.certificate-templates.store'));
    }

    function handleBackgroundImageChange(e) {
        const file = e.target.files[0];
        setData('background_image', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    }

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Certificate Template</h2>}
        >
            <Head title="Create Certificate Template" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Certificate Template</CardTitle>
                            <CardDescription>
                                Create a new template for student certificates. Define the HTML structure and styles.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <FormItem className="mb-4">
                                            <FormLabel htmlFor="name">Template Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    id="name"
                                                    value={data.name} 
                                                    onChange={e => setData('name', e.target.value)}
                                                    placeholder="e.g., Standard Certificate"
                                                />
                                            </FormControl>
                                            {errors.name && <FormMessage>{errors.name}</FormMessage>}
                                        </FormItem>

                                        <FormItem className="mb-4">
                                            <FormLabel htmlFor="description">Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    id="description"
                                                    value={data.description || ''} 
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Briefly describe this template"
                                                    rows={3}
                                                />
                                            </FormControl>
                                            {errors.description && <FormMessage>{errors.description}</FormMessage>}
                                        </FormItem>

                                        <FormItem className="mb-4">
                                            <FormLabel htmlFor="background_image">Background Image</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    id="background_image"
                                                    type="file" 
                                                    onChange={handleBackgroundImageChange}
                                                    accept="image/*"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Optional. Upload a background image for the certificate (max 2MB).
                                            </FormDescription>
                                            {errors.background_image && <FormMessage>{errors.background_image}</FormMessage>}
                                        </FormItem>

                                        {imagePreview && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium mb-2">Background Preview:</p>
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Background preview" 
                                                    className="max-w-full h-auto border rounded"
                                                    style={{ maxHeight: '200px' }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 mb-4">
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={value => setData('is_active', value)}
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Tabs defaultValue="html">
                                            <TabsList className="mb-2">
                                                <TabsTrigger value="html">HTML Template</TabsTrigger>
                                                <TabsTrigger value="css">CSS Styles</TabsTrigger>
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
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Use variables like {{student_name}}, {{course_title}}, {{completion_date}}, etc.
                                                    </FormDescription>
                                                    {errors.html_template && <FormMessage>{errors.html_template}</FormMessage>}
                                                </FormItem>
                                            </TabsContent>
                                            
                                            <TabsContent value="css">
                                                <FormItem>
                                                    <FormLabel htmlFor="css_styles">Additional CSS</FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            id="css_styles"
                                                            value={data.css_styles || ''} 
                                                            onChange={e => setData('css_styles', e.target.value)}
                                                            rows={15}
                                                            className="font-mono text-sm"
                                                            placeholder="Additional CSS styles to apply to the certificate"
                                                        />
                                                    </FormControl>
                                                    {errors.css_styles && <FormMessage>{errors.css_styles}</FormMessage>}
                                                </FormItem>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Template
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
} 