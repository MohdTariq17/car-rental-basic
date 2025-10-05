import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      include: {
        state: true
      }
    });
    return Response.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return Response.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}