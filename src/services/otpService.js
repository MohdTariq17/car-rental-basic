
import { prisma } from "../../../../lib/prisma";

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

import { prisma } from '../lib/prisma';

export class OtpService {
  static async generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async saveOTP(mobile, email, otp, type) {
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      return await prisma.otp.create({
        data: {
          mobile: type === 'mobile' ? mobile : null,
          email: type === 'email' ? email : null,
          otp,
          type,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      throw new Error(`Failed to save OTP: ${error.message}`);
    }
  }

  static async verifyOTP(identifier, otp, type) {
    try {
      const where = type === 'mobile' 
        ? { mobile: identifier, type: 'mobile' }
        : { email: identifier, type: 'email' };

      const otpRecord = await prisma.otp.findFirst({
        where: {
          ...where,
          otp,
          is_used: false,
          expires_at: {
            gt: new Date()
          }
        }
      });

      if (!otpRecord) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as used
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          is_used: true,
          verified_at: new Date()
        }
      });

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
  }

  static async cleanupExpiredOTPs() {
    try {
      await prisma.otp.deleteMany({
        where: {
          expires_at: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup expired OTPs:', error);
    }
  }
}
