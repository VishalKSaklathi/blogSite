import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function SearchBar({ data, onSearch, onQueryChange }) {
    const [query, setQuery] = useState("");

    // Handle typing
    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onQueryChange(value);

        // If input becomes empty → return full list
        if (value.trim() === "") {
            onSearch(data);
        }
    };

    const handleSearch = () => {
        if (!query.trim()) {
            onSearch(data);
            return;
        }
        const filtered = data.filter((blog) =>
            blog.title.toLowerCase().includes(query.toLowerCase())
        )
        onSearch(filtered);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };
    return (
        <div className='flex flex-row space-x-2 mb-4'>
            <Input
                type='text'
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder='Search anything...'
            />
            <Button variant="outline" onClick={handleSearch}>
                Search
            </Button>
        </div>
    )
}

export default SearchBar