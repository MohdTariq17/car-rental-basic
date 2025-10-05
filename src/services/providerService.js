// src/services/providerService.js

// Import Prisma singleton instance (edit path if needed)
import { prisma } from '../../lib/prisma';

// Provider Service Class
export class ProviderService {
  static async getAllProviders() {
    try {
      return await prisma.provider.findMany({
        include: { city: true, state: true }
      });
    } catch (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }
  }

  static async getProviderById(id) {
    try {
      return await prisma.provider.findUnique({
        where: { id },
        include: { city: true, state: true }
      });
    } catch (error) {
      throw new Error(`Failed to find provider: ${error.message}`);
    }
  }

  static async createProvider(data) {
    try {
      return await prisma.provider.create({
        data,
        include: { city: true, state: true }
      });
    } catch (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }
  }

  static async updateProvider(id, data) {
    try {
      return await prisma.provider.update({
        where: { id },
        data,
        include: { city: true, state: true }
      });
    } catch (error) {
      throw new Error(`Failed to update provider: ${error.message}`);
    }
  }

  static async deleteProvider(id) {
    try {
      return await prisma.provider.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to delete provider: ${error.message}`);
    }
  }

  static async registerProvider(data) {
    try {
      const providerData = {
        ...data,
        registration_status: 'Pending_Approval'
      };
      return await prisma.provider.create({
        data: providerData,
        include: { city: true, state: true }
      });
    } catch (error) {
      throw new Error(`Failed to register provider: ${error.message}`);
    }
  }
}

// For backward compatibility
export const providerService = ProviderService;



// src/services/userDAL.js

// Import Prisma singleton instance (edit path if needed)
import { prisma } from '../../../../lib/prisma';

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
            role_id: true,
            is_active: true,
            createdAt: true,
            updatedAt: true,
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
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
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
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
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
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
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
        role_id: 'provider',
      },
    });
  }
}

