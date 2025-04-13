"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dbQaCategoryTypes } from "@/lib/db/schema";
import { Label } from "@/components/ui/label";

interface CategoryFilterProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ currentCategory, onCategoryChange }: CategoryFilterProps) {
  // Convert category from API format (snake_case) to display format (Title Case)
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="category-select">Filter by Category</Label>
      <Select
        value={currentCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger id="category-select" className="w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {dbQaCategoryTypes.map((category) => (
            <SelectItem key={category} value={category}>
              {formatCategoryName(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}