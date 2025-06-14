export interface AuthResponse {
  access_token: string;
  user: UserPayload;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: 'admin' | 'user';
}

export interface SignInUserDto {
  email: string;
  password: string;
}

export interface UserPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}
