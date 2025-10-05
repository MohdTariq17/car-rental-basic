import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany();
    return Response.json(cities);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}