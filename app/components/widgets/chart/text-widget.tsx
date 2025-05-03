import React from "react";
import { cn } from "@/lib/utils";

interface TextWidgetProps {
  data?: Record<string, any>[];
  config: Record<string, any>;
  className?: string;
}

export default function TextWidget({ config, className }: TextWidgetProps) {
  const {
    textContent = "Add some text content here...",
    textAlign = "left",
    fontSize = "medium",
    fontWeight = "normal",
    textColor,
    backgroundColor,
  } = config;

  // Mapping for font sizes
  const fontSizeMap: Record<string, string> = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
    "2xlarge": "text-2xl",
    "3xlarge": "text-3xl",
    "4xlarge": "text-4xl",
  };

  // Mapping for font weights
  const fontWeightMap: Record<string, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  // Mapping for text alignment
  const textAlignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  // Generate the styles for the text widget
  const style: React.CSSProperties = {
    ...(textColor ? { color: textColor } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
  };

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col p-3 overflow-auto",
        textAlignMap[textAlign] || "text-left",
        fontSizeMap[fontSize] || "text-base",
        fontWeightMap[fontWeight] || "font-normal",
        className
      )}
      style={style}
    >
      <div className="whitespace-pre-wrap">{textContent}</div>
    </div>
  );
}