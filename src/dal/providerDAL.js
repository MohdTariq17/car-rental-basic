
import { prisma } from '../lib/prisma';

export class ProviderDAL {
  static async findMany(options = {}) {
    const { skip = 0, take = 10, where = {}, orderBy = {} } = options;
    
    try {
      const [providers, totalCount] = await Promise.all([
        prisma.provider.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            city: true,
            state: true
          }
        }),
        prisma.provider.count({ where })
      ]);

      return { providers, totalCount };
    } catch (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await prisma.provider.findUnique({
        where: { id },
        include: {
          city: true,
          state: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to find provider: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.provider.findUnique({
        where: { email },
        include: {
          city: true,
          state: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to find provider by email: ${error.message}`);
    }
  }

  static async create(providerData) {
    try {
      return await prisma.provider.create({
        data: providerData,
        include: {
          city: true,
          state: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }
  }

  static async update(id, providerData) {
    try {
      return await prisma.provider.update({
        where: { id },
        data: providerData,
        include: {
          city: true,
          state: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to update provider: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await prisma.provider.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to delete provider: ${error.message}`);
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
