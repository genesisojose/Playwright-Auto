import type { Page, Request, Response } from '@playwright/test';

export interface InterceptedData<TRequest = unknown, TResponse = unknown> {
  url: string;
  method: string;
  status: number;
  requestBody: TRequest;
  responseBody: TResponse;
  request: Request;
  response: Response;
}

export interface InterceptResponseArgs {
  /** URL pattern to match (string glob or RegExp) */
  urlPattern: string | RegExp;
  /** Async function that triggers the request (e.g., button click) */
  action: () => Promise<void>;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to attach request/response to Allure (default: true) */
  attachToAllure?: boolean;
}

function matchesUrlPattern(url: string, pattern: string | RegExp): boolean {
  return typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url);
}

export async function interceptResponse<TRequest = unknown, TResponse = unknown>(
  page: Page,
  args: InterceptResponseArgs,
): Promise<InterceptedData<TRequest, TResponse>> {
  const timeout = args.timeout ?? 30000;

  const responsePromise = page.waitForResponse(
    (response) =>
      matchesUrlPattern(response.url(), args.urlPattern) && response.ok(),
    { timeout },
  );

  await args.action();

  const response = await responsePromise;
  const request = response.request();
  const postData = request.postData();

  return {
    url: response.url(),
    method: request.method(),
    status: response.status(),
    requestBody: postData ? (JSON.parse(postData) as TRequest) : (undefined as TRequest),
    responseBody: (await response.json()) as TResponse,
    request,
    response,
  };
}
