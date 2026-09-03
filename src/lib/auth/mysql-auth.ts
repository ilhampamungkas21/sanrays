import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, toCamelCase, toCamelCaseArray, generateId } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';

const JWT_SECRET = process.env.JWT_SECRET || 'sanrays-event-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'super_admin' | 'admin' | 'event_manager' | 'finance' | 'stakeholder';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  interface UserRow extends RowDataPacket {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  }

  const rows = await query<UserRow[]>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  if (rows.length === 0) return null;

  const user = toCamelCase<User & { passwordHash: string }>(rows[0] as unknown as Record<string, unknown>);
  (user as User & { passwordHash: string }).passwordHash = rows[0].password_hash;
  return user as unknown as User;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  interface UserRow extends RowDataPacket {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  }

  const rows = await query<UserRow[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) return null;

  const user = toCamelCase<User & { passwordHash: string }>(rows[0] as unknown as Record<string, unknown>);
  (user as User & { passwordHash: string }).passwordHash = rows[0].password_hash;
  return user as unknown as User;
}

// Create user
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string = 'admin'
): Promise<User> {
  const id = generateId();
  const passwordHash = await hashPassword(password);

  await query(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, passwordHash, role]
  );

  const user = await getUserById(id);
  if (!user) throw new Error('Failed to create user');
  return user;
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) return null;

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) return null;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

// Register user
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  await query(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, passwordHash, 'admin']
  );

  const user = await getUserById(id);
  if (!user) throw new Error('Failed to create user');

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

// Update user
export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'avatarUrl' | 'role'>>
): Promise<User | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    values.push(data.avatarUrl);
  }
  if (data.role !== undefined) {
    updates.push('role = ?');
    values.push(data.role);
  }

  if (updates.length === 0) return getUserById(id);

  values.push(id);
  await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getUserById(id);
}

// Get all users
export async function getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  interface UserRow extends RowDataPacket {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  }

  const rows = await query<UserRow[]>(
    'SELECT id, name, email, role, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC'
  );

  return toCamelCaseArray<Omit<User, 'passwordHash'>>(
    rows as unknown as Record<string, unknown>[]
  );
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return (result as { affectedRows: number }).affectedRows > 0;
}

// Get authenticated user from request
export function getAuthUser(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
