import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  BookOpenIcon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  LinkIcon,
  SearchIcon,
  BookOpen,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Material {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | string;
  file_path: string | null;
  created_at: string;
  course: {
    id: number;
    title: string;
    image: string | null;
  };
}

interface CourseGroup {
  course_id: number;
  course_title: string;
  course_image: string | null;
  materials_count: number;
  materials: Material[];
}

interface IndexProps extends PageProps {
  materials: Material[];
  recent_materials: Material[];
  course_groups: CourseGroup[];
  total_count: number;
  type_stats: {
    document: number;
    video: number;
    link: number;
    other: number;
  };
}

export default function Index({ 
  auth, 
  materials, 
  recent_materials, 
  course_groups, 
  total_count, 
  type_stats 
}: IndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get material type icon
  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <FileTextIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <FilmIcon className="h-5 w-5 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FolderIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get unique courses for filter
  const courses = [...new Set(materials.map(material => material.course.title))];

  // Apply filters to materials
  const filteredMaterials = materials.filter(material => {
    // Search term filter
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Course filter
    const matchesCourse = courseFilter === 'all' || material.course.title === courseFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || material.type === typeFilter;
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'documents') matchesTab = material.type === 'document';
    else if (activeTab === 'videos') matchesTab = material.type === 'video';
    else if (activeTab === 'links') matchesTab = material.type === 'link';
    
    return matchesSearch && matchesCourse && matchesType && matchesTab;
  });

  return (
    <AppLayout user={auth.user}>
      <Head title="My Learning Materials" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Learning Materials</h1>
            <p className="text-gray-600">Access all learning resources from your courses</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-4">
                    <FileTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documents</p>
                    <p className="text-2xl font-bold">{type_stats.document}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 mr-4">
                    <FilmIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Videos</p>
                    <p className="text-2xl font-bold">{type_stats.video}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-4">
                    <LinkIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Links</p>
                    <p className="text-2xl font-bold">{type_stats.link}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-4">
                    <FolderIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">All Materials</p>
                    <p className="text-2xl font-bold">{total_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {recent_materials.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recently Added Materials</CardTitle>
                <CardDescription>Access your most recently added learning resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recent_materials.map((material) => (
                    <Card key={material.id} className="overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getMaterialIcon(material.type)}
                          </div>
                          <div>
                            <Link href={route('student.materials.show', material.id)}>
                              <h3 className="font-medium text-blue-600 hover:text-blue-800 truncate">
                                {material.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">
                              {material.course.title} • {formatDate(material.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filter Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Search</label>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search material..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Course</label>
                      <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          {courses.map((course, index) => (
                            <SelectItem key={index} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Material Type</label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="document">Documents</SelectItem>
                          <SelectItem value="video">Videos</SelectItem>
                          <SelectItem value="link">Links</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Materials by Course</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {course_groups.map((group) => (
                      <div key={group.course_id} className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {group.course_image ? (
                              <img 
                                src={`/storage/${group.course_image}`} 
                                alt={group.course_title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpenIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <Link href={route('student.courses.show', group.course_id)}>
                            <span className="font-medium hover:text-blue-600">{group.course_title}</span>
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.materials_count} material{group.materials_count !== 1 && 's'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Materials</CardTitle>
                  <CardDescription>
                    {filteredMaterials.length} material{filteredMaterials.length !== 1 && 's'} found
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {filteredMaterials.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No materials found</h3>
                      <p className="text-gray-500">
                        {searchTerm || courseFilter !== 'all' || typeFilter !== 'all'
                          ? 'Try adjusting your filters to see more results'
                          : 'There are no materials available in your courses yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Date Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                          {filteredMaterials.map((material) => (
                            <TableRow key={material.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  {getMaterialIcon(material.type)}
                                  <span>{material.title}</span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <span className="capitalize">{material.type}</span>
                              </TableCell>
                              
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                                    {material.course.image ? (
                                      <img 
                                        src={`/storage/${material.course.image}`}
                                        alt={material.course.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = '/images/course-placeholder.png';
                                        }}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm">{material.course.title}</span>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <span className="text-sm text-gray-500">
                                  {formatDate(material.created_at)}
                                </span>
                              </TableCell>
                              
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Link href={route('student.materials.show', material.id)}>
                                    <Button size="sm" variant="outline">View</Button>
                                  </Link>
                                  
                                  {material.file_path && (
                                    <Link href={route('student.materials.download', material.id)}>
                                      <Button size="sm" variant="outline">Download</Button>
                                    </Link>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 