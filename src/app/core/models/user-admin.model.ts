export interface UserQueryParams {
  page: number;
  limit: number;
  name?: string;
  role?: 'admin' | 'user' | '';
  sortBy?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}
