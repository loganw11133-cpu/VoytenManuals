import { generateCsrfResponse } from '@/lib/csrf';

export async function GET() {
  return generateCsrfResponse();
}
