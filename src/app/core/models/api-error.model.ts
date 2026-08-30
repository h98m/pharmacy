//هيكل الخطأ الراجع من السيرفر
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}