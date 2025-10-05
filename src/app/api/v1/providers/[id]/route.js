
import { providerService } from '../../../../../services/providerService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const provider = await providerService.getProviderById(id);
    
    if (!provider) {
      return Response.json({ error: 'Provider not found' }, { status: 404 });
    }
    
    return Response.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return Response.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const provider = await providerService.updateProvider(id, data);
    return Response.json(provider);
  } catch (error) {
    console.error('Error updating provider:', error);
    return Response.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await providerService.deleteProvider(id);
    return Response.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return Response.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
