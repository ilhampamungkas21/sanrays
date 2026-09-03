import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/db/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'sanrays-event-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'super_admin' | 'admin' | 'event_manager' | 'finance' | 'stakeholder';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Convert snake_case to camelCase
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    avatarUrl: data.avatar_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    role: data.role,
    avatarUrl: data.avatar_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Create user
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string = 'admin'
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role,
    })
    .select()
    .single();

  if (error || !data) throw new Error('Failed to create user: ' + (error?.message || 'Unknown error'));

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatarUrl: data.avatar_url || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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

  const user = await createUser(name, email, password, 'admin');

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

// Update user
export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'avatarUrl' | 'role'>>
): Promise<User | null> {
  const updates: Record<string, unknown> = {};

  if (data.name !== undefined) updates.name = data.name;
  if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;
  if (data.role !== undefined) updates.role = data.role;

  if (Object.keys(updates).length === 0) return getUserById(id);

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatarUrl: updated.avatar_url || undefined,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
}

// Get all users
export async function getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url || undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  return !error;
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
