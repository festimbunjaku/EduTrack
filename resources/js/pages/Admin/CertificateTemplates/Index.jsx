import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import { DotsHorizontalIcon, PlusIcon } from '@radix-ui/react-icons';
import AlertModal from '@/Components/AlertModal';

export default function Index({ templates, auth }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const confirmDelete = (template) => {
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.certificate-templates.destroy', templateToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setTemplateToDelete(null);
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Certificate Templates</h2>
                    <Button asChild>
                        <Link href={route('admin.certificate-templates.create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Template
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Certificate Templates" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.length > 0 ? (
                                        templates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">{template.name}</TableCell>
                                                <TableCell>{template.description || 'No description'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={template.is_active ? "success" : "secondary"}>
                                                        {template.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <DotsHorizontalIcon className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.certificate-templates.show', template.id)}>
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.certificate-templates.edit', template.id)}>
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                className="text-red-600"
                                                                onClick={() => confirmDelete(template)}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No certificate templates found. <Link href={route('admin.certificate-templates.create')} className="text-primary">Create one</Link>.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Certificate Template"
                description={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </AdminLayout>
    );
} 