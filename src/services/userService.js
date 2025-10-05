
import { UserDAL } from '../dal/userDAL.js';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getUsers(options = {}) {
    try {
      const users = await UserDAL.findMany(options);
      const totalCount = await UserDAL.count(options.filters || {});
      
      return {
        users: users.map(user => ({
          ...user,
          role: user.role_id // Map role_id to role for frontend compatibility
        })),
        totalCount
      };
    } catch (error) {
      console.error('Error in UserService.getUsers:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const user = await UserDAL.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Return user with role mapped for frontend
      return {
        ...user,
        role: user.role_id
      };
    } catch (error) {
      console.error('Error in UserService.getUserById:', error);
      throw error;
    }
  }

  static async createUser(userData) {
    try {
      const { name, email, mobile, username, password, role } = userData;

      // Validation
      if (!name || !email || !mobile || !username || !password || !role) {
        throw new Error('All fields are required: name, email, mobile, username, password, role');
      }

      // Check for existing user
      const existingEmail = await UserDAL.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      const existingUsername = await UserDAL.findByUsername(username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      const existingMobile = await UserDAL.findByMobile(mobile);
      if (existingMobile) {
        throw new Error('Mobile number already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with role_id instead of role
      const newUser = await UserDAL.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role_id: role, // Use role_id to match schema
        is_active: true
      });

      // Return user with role mapped for frontend
      return {
        ...newUser,
        role: newUser.role_id
      };
    } catch (error) {
      console.error('Error in UserService.createUser:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const { name, email, mobile, username, role, password } = userData;

      const updateData = {
        name: name?.trim(),
        email: email?.toLowerCase().trim(),
        mobile: mobile?.trim(),
        username: username?.toLowerCase().trim(),
        role_id: role // Use role_id to match schema
      };

      // Only hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const updatedUser = await UserDAL.update(id, updateData);
      
      // Return user with role mapped for frontend
      return {
        ...updatedUser,
        role: updatedUser.role_id
      };
    } catch (error) {
      console.error('Error in UserService.updateUser:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      return await UserDAL.delete(id);
    } catch (error) {
      console.error('Error in UserService.deleteUser:', error);
      throw error;
    }
  }

  static async authenticateUser(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await UserDAL.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getProviders(options = {}) {
    return await UserDAL.findProviders(options);
  }
}
