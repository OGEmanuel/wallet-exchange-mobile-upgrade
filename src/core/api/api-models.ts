export interface ApiResponse<T> {
  data: T | null;
  message: string | null;
  status: boolean | null;
  responseCode: number | null;
}

export interface ApiRequest<B, P = unknown, Q = unknown> {
  body: B | null;
  params: P | null;
  query: Q | null;
}