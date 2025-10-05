// src/services/providerService.js

// Import Prisma singleton instance (edit path if needed)
import { prisma } from '../lib/prisma';

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
// End of src/services/providerService.js