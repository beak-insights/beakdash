import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random ID with optional prefix
 */
export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Formats numbers with commas for thousands separators
 */
export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-US", options).format(value)
}

/**
 * Formats date to a string using the specified format options
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(dateObj)
}

/**
 * Truncates a string to the specified length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

/**
 * Converts snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  )
}

/**
 * Converts camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Gets a random color from a predefined palette
 */
export function getRandomColor(index?: number): string {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#EF4444", // Red
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#06B6D4", // Cyan
  ]
  
  if (typeof index === "number") {
    return colors[index % colors.length]
  }
  
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Validates if the provided value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Downloads data as a file
 */
export function downloadFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  
  link.download = filename
  link.href = url
  link.click()
  
  URL.revokeObjectURL(url)
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    return fallback
  }
}

/**
 * Extracts column names from data array
 * Ensures numeric columns (including numeric strings) come last
 */
export function extractColumns(data: Record<string, any>[]): { string: string[], numeric: string[], all: string[] } {
  if (!data.length) return { string: [], numeric: [], all: [] }

  const keys = Object.keys(data[0])
  const isNumericLike = (value: any) => !isNaN(Number(value))

  const nonNumericKeys: string[] = []
  const numericKeys: string[] = []

  for (const key of keys) {
    const value = data[0][key]
    if (isNumericLike(value)) {
      numericKeys.push(key)
    } else {
      nonNumericKeys.push(key)
    }
  }

  return {
    "string": nonNumericKeys,
    "numeric": numericKeys,
    "all": [...nonNumericKeys, ...numericKeys]
  }
}

/**
 * Converts numeric strings to numbers
 */
export function makesureNumeric(data: Record<string, any>[]): Record<string, any>[] {
  const columns = extractColumns(data);
  return data?.map((row) => {
    columns.numeric?.forEach((key) => {
      row[key] = Number(row[key]);
    });
    return row;
  });
}