import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddIcon, DeleteIcon } from "@/components/ui/icons";

const Container2 = () => {
    const [input, setInput] = useState("");
    const [items, setItems] = useState([]);

    const handleAdd = () => {
        if (input.trim()) {
            setItems([input, ...items]);
            setInput("");
        }
    };

    const handleDelete = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4" id="container2">
            <div className="flex gap-2 items-center">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type something..."
                    className="flex-1"
                />
                <Button variant="outline" onClick={handleAdd} aria-label="Add">
                    <AddIcon />
                </Button>
            </div>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-row items-center justify-between px-4 py-2 border rounded-lg shadow-none">
                        <div className="p-0 flex-1">{item}</div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(idx)} aria-label="Delete">
                            <DeleteIcon />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Container2;
