
import { providerService } from '../../../../../services/providerService.js';

export async function GET() {
  try {
    const providers = await providerService.getAllProviders();
    return Response.json(providers);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const provider = await providerService.createProvider(data);
    return Response.json(provider, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
