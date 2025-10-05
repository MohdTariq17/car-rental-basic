
import { prisma } from '../lib/prisma';

export class UserDAL {
  static async findMany(options = {}) {
    const { skip = 0, take = 10, where = {}, orderBy = {} } = options;
    
    try {
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy,
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, totalCount };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  static async findByUsername(username) {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      return await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async update(id, userData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async findProviders(options = {}) {
    return this.findMany({
      ...options,
      where: {
        ...options.where,
        role: 'PROVIDER',
      },
    });
  }
}

import bcrypt from 'bcryptjs';

export class UserService {
  static async getAllUsers(options = {}) {
    return await UserDAL.findMany(options);
  }

  static async getUserById(id) {
    return await UserDAL.findById(id);
  }

  static async getUserByEmail(email) {
    return await UserDAL.findByEmail(email);
  }

  static async getUserByUsername(username) {
    return await UserDAL.findByUsername(username);
  }

  static async createUser(userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    return await UserDAL.create(userData);
  }

  static async updateUser(id, userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    return await UserDAL.update(id, userData);
  }

  static async deleteUser(id) {
    return await UserDAL.delete(id);
  }

  static async getProviders(options = {}) {
    return await UserDAL.findProviders(options);
  }

  static async validateUserCredentials(email, password) {
    const user = await UserDAL.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

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
