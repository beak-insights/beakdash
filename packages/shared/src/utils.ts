import { ApiError } from './types';

export const DEFAULT_API_URL = 'https://api.beakdash.com/v1';
export const DEFAULT_APP_URL = 'https://app.beakdash.com';

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function formatEmbedUrl(
  baseUrl: string,
  dashboardId: string,
  token: string,
  params: Record<string, string | number | boolean> = {}
): string {
  const url = new URL(`${baseUrl}/embed/${dashboardId}`);
  url.searchParams.append('token', token);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}

export function generateEmbedHtml(
  url: string,
  height: string | number = '600px',
  width: string | number = '100%'
): string {
  return `
    <iframe
      src="${url}"
      width="${width}"
      height="${height}"
      frameborder="0"
      allowfullscreen
      style="border: none;"
    ></iframe>
  `.trim();
}

export function parseApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  };
} 