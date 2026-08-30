//تحديد الأدوار المتاحة
export type Role = 'admin' | 'pharmacist';

//بيانات المستخدم
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  permissions: string[];
  phone?: string;
  avatarUrl?: string;
}

//رموز التحقق والجلسة
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
//البيانات الي راجعه من السيرفر
export interface LoginResponse extends AuthTokens {
  user: User;
}