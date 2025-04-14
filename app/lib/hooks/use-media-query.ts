"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to check if a media query matches
 * 
 * @param query The media query to check against
 * @returns A boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with a default (desktop) value to avoid hydration mismatch
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      
      // Update the state with the current value
      setMatches(media.matches);
      
      // Set up a listener for changes
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      
      // Clean up
      return () => media.removeEventListener("change", listener);
    }
    
    return undefined;
  }, [query]);

  return matches;
}