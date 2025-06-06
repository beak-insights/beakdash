import React, { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WidgetHeaderProps {
  name: string;
  description?: string;
}

export function WidgetHeader({ name, description }: WidgetHeaderProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-semibold text-foreground font-roboto uppercase">{name}</h2>
      {description && (
        <TooltipProvider>
          <Tooltip>
            {/* <TooltipTrigger asChild>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Show widget description"
                aria-label="Show widget description"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger> */}
            <TooltipContent>
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 