import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import Todo from '@/Components/Todo';
import FlashMessage from '@/Components/flash-message';

interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    todos: Todo[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ todos, flash }: Props) {
    const [newTodo, setNewTodo] = useState('');
    
    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newTodo.trim()) return;
        
        router.post(route('todos.store'), {
            title: newTodo,
            description: null,
            completed: false
        }, {
            onSuccess: () => setNewTodo('')
        });
    };
    
    return (
        <>
            <Head title="Todos" />
            
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && <FlashMessage message={flash.success} type="success" />}
                    {flash?.error && <FlashMessage message={flash.error} type="error" />}
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Todos</h1>
                                <Link
                                    href={route('todos.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    New Todo
                                </Link>
                            </div>
                            
                            <form onSubmit={handleAddTodo} className="mb-6">
                                <div className="flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        value={newTodo}
                                        onChange={e => setNewTodo(e.target.value)}
                                        placeholder="Add a new todo..."
                                        className="flex-1 block w-full rounded-l-md border-0 py-1.5 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                            
                            <div className="space-y-4">
                                {todos.length > 0 ? (
                                    todos.map(todo => (
                                        <Todo
                                            key={todo.id}
                                            id={todo.id}
                                            title={todo.title}
                                            description={todo.description}
                                            completed={todo.completed}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No todos yet. Add one to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 