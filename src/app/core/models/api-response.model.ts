import { AuthTokens } from './token.model';
import { User } from './user.model';

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
