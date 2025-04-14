"use client";

import React, { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dbQaCategoryTypes } from "@/lib/db/schema";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface CategoryFilterProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  currentCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  // Check if screen is small
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [useDropdown, setUseDropdown] = useState(false);
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  // Check if we need to use dropdown (on small screens or if too many categories)
  useEffect(() => {
    const shouldUseDropdown = isSmallScreen || dbQaCategoryTypes.length > 5;
    setUseDropdown(shouldUseDropdown);
  }, [isSmallScreen]);

  if (useDropdown) {
    return (
      <div className="mb-6 w-full max-w-xs">
        <Select value={currentCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {dbQaCategoryTypes.map((category) => (
                <SelectItem key={category} value={category}>
                  {formatCategoryName(category)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Tabs value={currentCategory} onValueChange={onCategoryChange}>
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