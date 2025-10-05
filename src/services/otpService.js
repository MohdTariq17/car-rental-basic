
import { prisma } from "../lib/prisma";

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

export class OtpService {
  static async generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(data) {
    try {
      const { mobile, email, type } = data;
      const otp = await this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      return await prisma.otp.create({
        data: {
          mobile: type === 'mobile' ? mobile : null,
          email: type === 'email' ? email : null,
          otp,
          type,
          expires_at: expiresAt,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create OTP: ${error.message}`);
    }
  }

  static async verifyOTP(data) {
    try {
      const { mobile, email, otp, type } = data;
      
      const whereClause = {
        otp,
        type,
        is_used: false,
        expires_at: {
          gte: new Date(),
        },
      };

      if (type === 'mobile') {
        whereClause.mobile = mobile;
      } else if (type === 'email') {
        whereClause.email = email;
      }

      const otpRecord = await prisma.otp.findFirst({
        where: whereClause,
      });

      if (!otpRecord) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as used
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          is_used: true,
          verified_at: new Date(),
        },
      });

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }
  }

  static async resendOTP(data) {
    try {
      const { mobile, email, type } = data;
      
      // Mark previous OTPs as used
      const whereClause = {
        type,
        is_used: false,
      };

      if (type === 'mobile') {
        whereClause.mobile = mobile;
      } else if (type === 'email') {
        whereClause.email = email;
      }

      await prisma.otp.updateMany({
        where: whereClause,
        data: { is_used: true },
      });

      // Create new OTP
      return await this.createOTP(data);
    } catch (error) {
      throw new Error(`Failed to resend OTP: ${error.message}`);
    }
  }

  static async cleanupExpiredOTPs() {
    try {
      const result = await prisma.otp.deleteMany({
        where: {
          expires_at: {
            lt: new Date(),
          },
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to cleanup expired OTPs: ${error.message}`);
    }
  }

  static async sendMobileOTP(mobile) {
    try {
      const otpData = await this.createOTP({
        mobile,
        type: 'mobile',
      });

      // Here you would integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`SMS OTP ${otpData.otp} sent to ${mobile}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otpData.id,
      };
    } catch (error) {
      throw new Error(`Failed to send mobile OTP: ${error.message}`);
    }
  }

  static async sendEmailOTP(email) {
    try {
      const otpData = await this.createOTP({
        email,
        type: 'email',
      });

      // Here you would integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`Email OTP ${otpData.otp} sent to ${email}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otpData.id,
      };
    } catch (error) {
      throw new Error(`Failed to send email OTP: ${error.message}`);
    }
  }
}

// For backward compatibility
export const otpService = OtpService;
