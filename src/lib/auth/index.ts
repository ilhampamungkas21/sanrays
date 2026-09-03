// Auth exports - using Supabase
export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getUserById,
  getUserByEmail,
  createUser,
  loginUser,
  registerUser,
  updateUser,
  getAllUsers,
  deleteUser,
  getAuthUser,
  type User,
  type JWTPayload,
  type AuthResult,
} from './supabase-auth';
