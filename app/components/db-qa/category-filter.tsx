"use client";

import React from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { dbQaCategoryTypes } from "@/lib/db/schema";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="mb-6">
      <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
        <TabsList className="w-full overflow-x-auto flex-wrap">
          <TabsTrigger value="all" className="flex-shrink-0">
            All Categories
          </TabsTrigger>
          
          {dbQaCategoryTypes.map((category) => (
            <TabsTrigger key={category} value={category} className="flex-shrink-0">
              {formatCategoryName(category)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}