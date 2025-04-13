'use client';

import { useToast as useToastUI } from "@/components/ui/use-toast";

// Just a simple re-export to maintain consistency with import patterns
export const useToast = useToastUI;

// Export toast from the ui component for convenience
export { toast } from "@/components/ui/use-toast";