
import { PrismaClient } from '@prisma/client';

// Create a singleton instance
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export class UserDAL {
  static async findMany(options = {}) {
    const { 
      skip = 0, 
      take = 10, 
      sortField = 'createdAt',
      sortOrder = -1,
      filters = {} 
    } = options;
    
    try {
      const orderBy = {};
      orderBy[sortField] = sortOrder === 1 ? 'asc' : 'desc';

      const where = {};
      
      // Apply filters - using role_id to match your schema
      if (filters.role) {
        where.role_id = filters.role;
      }
      
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { username: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const users = await prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          mobile: true,
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return users;
    } catch (error) {
      console.error('Database error in findMany:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  static async count(filters = {}) {
    try {
      const where = {};
      
      if (filters.role) {
        where.role_id = filters.role;
      }
      
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { username: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      return await prisma.user.count({ where });
    } catch (error) {
      console.error('Database error in count:', error);
      throw new Error(`Failed to count users: ${error.message}`);
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
          mobile: true,
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error('Database error in findById:', error);
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  static async findByUsername(username) {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      console.error('Database error in findByUsername:', error);
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  static async findByMobile(mobile) {
    try {
      return await prisma.user.findUnique({
        where: { mobile }
      });
    } catch (error) {
      console.error('Database error in findByMobile:', error);
      throw new Error(`Failed to find user by mobile: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          mobile: true,
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      return user;
    } catch (error) {
      console.error('Database error in create:', error);
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new Error(`User with this ${field} already exists`);
      }
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
          mobile: true,
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error('Database error in update:', error);
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new Error(`User with this ${field} already exists`);
      }
      if (error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Database error in delete:', error);
      if (error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async findProviders(options = {}) {
    return this.findMany({
      ...options,
      where: {
        ...options.where,
        role_id: 'provider',
      },
    });
  }
}
