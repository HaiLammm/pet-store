"use client";

import { useState } from "react";

type FilterBarProps = {
  onSearch?: (q: string) => void;
  onChange?: (filters: Record<string, string>) => void;
};

export default function FilterBar({ onSearch, onChange }: FilterBarProps) {
  const [q, setQ] = useState("");
  const [color, setColor] = useState("");

  function emit() {
    onChange?.({ color });
  }

  return (
    <div className="container mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <select
          aria-label="Filter by color"
          className="border border-[#e5e7eb] rounded-md px-3 py-2 bg-white"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            emit();
          }}
        >
          <option value="">All Colors</option>
          <option value="blue">Blue</option>
          <option value="red">Red</option>
          <option value="black">Black</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          aria-label="Search by name"
          className="border border-[#e5e7eb] rounded-md px-3 py-2 w-64"
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="border border-[#fca5a5] text-[#b91c1c] hover:bg-[#fca5a5] hover:text-[#b91c1c] rounded-md px-4 py-2"
          onClick={() => onSearch?.(q)}
        >
          Search
        </button>
      </div>
    </div>
  );
}
