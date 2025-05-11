import React from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Circle, Pencil, Trash } from 'lucide-react';
import FlashMessage from '@/Components/flash-message';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    todo: Todo;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Show({ todo, flash }: Props) {
    const handleToggle = () => {
        router.post(route('todos.toggle', todo.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this todo?')) {
            router.delete(route('todos.destroy', todo.id));
        }
    };
    
    const formattedDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        <>
            <Head title={`Todo: ${todo.title}`} />
            
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
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Todo Details</h1>
                            </div>
                            
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <button
                                            onClick={handleToggle}
                                            className="mr-3 text-gray-500 hover:text-primary focus:outline-none"
                                            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                                        >
                                            {todo.completed ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Circle className="w-6 h-6" />
                                            )}
                                        </button>
                                        <h2 className={`text-xl font-bold ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                            {todo.title}
                                        </h2>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <a 
                                            href={route('todos.edit', todo.id)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            aria-label="Edit todo"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </a>
                                        <button
                                            onClick={handleDelete}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            aria-label="Delete todo"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {todo.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {todo.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {todo.completed ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                Pending
                                            </span>
                                        )}
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Created</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formattedDate(todo.created_at)}
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Updated</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formattedDate(todo.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 