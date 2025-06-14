export type userRole = 'admin' | 'user';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: userRole;
  phoneNumber: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}
