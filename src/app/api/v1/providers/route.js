
import { providerService } from '../../../../services/providerService';

export async function GET() {
  try {
    const providers = await providerService.getAllProviders();
    return Response.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return Response.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const provider = await providerService.createProvider(data);
    return Response.json(provider, { status: 201 });
  } catch (error) {
    console.error('Error creating provider:', error);
    return Response.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
