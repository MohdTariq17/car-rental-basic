
import { PrismaClient } from '../../generated/prisma-client';

const prisma = new PrismaClient();

export class ProviderDAL {
  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      throw new Error(`Failed to find provider by email: ${error.message}`);
    }
  }

  static async findByMobile(mobile) {
    try {
      return await prisma.user.findFirst({
        where: { mobile }
      });
    } catch (error) {
      throw new Error(`Failed to find provider by mobile: ${error.message}`);
    }
  }

  static async findByAlternateMobile(alternateMobile) {
    try {
      return await prisma.user.findFirst({
        where: { 
          OR: [
            { mobile: alternateMobile },
            { alternate_mobile: alternateMobile }
          ]
        }
      });
    } catch (error) {
      throw new Error(`Failed to find provider by alternate mobile: ${error.message}`);
    }
  }

  static async createProvider(providerData) {
    try {
      return await prisma.user.create({
        data: providerData,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          alternate_mobile: true,
          address: true,
          cityId: true,
          stateId: true,
          zipcode: true,
          role_id: true,
          registration_status: true,
          is_active: true,
          createdAt: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }
  }

  static async findCityById(cityId) {
    try {
      return await prisma.city.findUnique({
        where: { id: cityId },
        include: { state: true }
      });
    } catch (error) {
      throw new Error(`Failed to find city: ${error.message}`);
    }
  }

  static async findStateById(stateId) {
    try {
      return await prisma.state.findUnique({
        where: { id: stateId }
      });
    } catch (error) {
      throw new Error(`Failed to find state: ${error.message}`);
    }
  }
}