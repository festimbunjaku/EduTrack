import React from 'react';
import { router } from '@inertiajs/react';
import { Trash, CheckCircle2, Circle, Pencil, Eye } from 'lucide-react';

interface TodoProps {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
}

export default function Todo({ id, title, description, completed }: TodoProps) {
    const handleToggle = () => {
        router.post(route('todos.toggle', id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this todo?')) {
            router.delete(route('todos.destroy', id));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <button
                        onClick={handleToggle}
                        className="mt-1 text-gray-500 hover:text-primary focus:outline-none flex-shrink-0"
                        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                        {completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5" />
                        )}
                    </button>
                    
                    <div className="flex-1">
                        <h3 className={`text-lg font-medium ${completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                            {title}
                        </h3>
                        {description && (
                            <p className={`mt-1 text-sm ${completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex space-x-2">
                    <a
                        href={route('todos.show', id)}
                        className="text-gray-500 hover:text-purple-500 dark:hover:text-purple-400"
                        aria-label="View todo details"
                    >
                        <Eye className="w-5 h-5" />
                    </a>
                    <a
                        href={route('todos.edit', id)}
                        className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                        aria-label="Edit todo"
                    >
                        <Pencil className="w-5 h-5" />
                    </a>
                    <button
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                        aria-label="Delete todo"
                    >
                        <Trash className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}