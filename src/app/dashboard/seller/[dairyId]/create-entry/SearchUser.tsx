"use client";

import { Input } from '@/components/ui/input';
import { User } from '@prisma/client';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    sellers: User[];
    handleUser: (id: number) => void;
}

function SearchUser({ sellers, handleUser }: Props) {
    const [items, setItems] = useState<User[]>([]);
    const [search, setSearch] = useState("");

    const find = (val: string) => {
        setSearch(val);

        if (!val.trim()) {
            setItems([]);
            return;
        }

        const lower = val.toLowerCase();

        setItems(
            sellers.filter(s =>
                s.firstName.toLowerCase().includes(lower) ||
                s.lastName?.toLowerCase().includes(lower) ||
                s.phone?.includes(val)
            )
        );
    };

    const clearSearch = () => {
        setSearch("");
        setItems([]);
    };

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm border">
                <Input
                    value={search}
                    placeholder="Search seller..."
                    onChange={(e) => find(e.target.value)}
                    className="flex-1 border-none focus-visible:ring-0"
                />

                {search && (
                    <X
                        className="cursor-pointer text-gray-500 hover:text-red-500 transition"
                        onClick={clearSearch}
                        size={20}
                    />
                )}
            </div>

            {/* Search Results */}
            {items.length > 0 && (
                <div className="max-h-56 overflow-y-auto border rounded-lg shadow-sm divide-y bg-white dark:bg-gray-800">
                    {items.map((item: User) => (
                        <div
                            key={item.id}
                            className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition grid grid-cols-1 md:grid-cols-2 gap-2"
                            onClick={() => {
                                handleUser(item.id)
                                clearSearch()
                            }}
                        >
                            <span className="font-medium">
                                {item.firstName} {item.lastName}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.phone}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchUser;
