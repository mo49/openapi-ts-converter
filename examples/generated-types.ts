export type UserRole = /** Administrator with full access */
  | 'ADMIN' /** Regular user with limited access */
  | 'USER' /** Guest user with read-only access */
  | 'GUEST';

/** User address information */
export interface Address {
  /** Street address */
  street: string;
  /** City name */
  city: string;
  /** State or province */
  state?: string;
  /** Postal or ZIP code */
  postalCode?: string;
  /** Country name */
  country: string;
}

/**
 * Used in:
 * POST /users - Create a new user
 * GET /users/{id} - Get a user by ID
 */
/** User information */
export interface User {
  /** Unique identifier */
  id: string;
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
  role: UserRole;
  address?: Address;
  /** Account creation timestamp */
  createdAt?: string;
}

/**
 * Used in:
 * POST /users - Create a new user
 */
/** User creation input */
export interface UserInput {
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
  role: UserRole;
  address?: Address;
}

/**
 * Used in:
 * GET /users - Get all users
 */
/** List of users with pagination */
export interface UserList {
  data: User[];
  /** Total number of users */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
}