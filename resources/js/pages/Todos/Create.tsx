import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import FlashMessage from '@/Components/flash-message';

interface Props {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Create({ flash }: Props) {
    const { data, setData, post, errors, processing, reset } = useForm({
        title: '',
        description: '',
        completed: false,
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('todos.store'), {
            onSuccess: () => reset(),
        });
    };
    
    return (
        <>
            <Head title="Create Todo" />
            
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && <FlashMessage message={flash.success} type="success" />}
                    {flash?.error && <FlashMessage message={flash.error} type="error" />}
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <a 
                                    href={route('todos.index')}
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to todos
                                </a>
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Todo</h1>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label 
                                        htmlFor="title" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white"
                                        required
                                        autoFocus
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label 
                                        htmlFor="description" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-800 dark:text-white"
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                    )}
                                </div>
                                
                                <div className="mb-6">
                                    <div className="flex items-center">
                                        <input
                                            id="completed"
                                            type="checkbox"
                                            checked={data.completed}
                                            onChange={e => setData('completed', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label 
                                            htmlFor="completed" 
                                            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            Completed
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <a
                                        href={route('todos.index')}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                                    >
                                        Cancel
                                    </a>
                                    
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {processing ? 'Creating...' : 'Create Todo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 