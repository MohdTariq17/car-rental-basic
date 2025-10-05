
import { NextResponse } from 'next/server';
import { ProviderService } from '../../../../../services/providerService.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    await ProviderService.registerProvider(body);

    return NextResponse.json({
      statusCode: "200",
      message: "Registered Successfully"
    }, { status: 200 });

  } catch (error) {
    console.error('Provider registration error:', error);
    
    if (error.message.includes('Email or Mobile already exists')) {
      return NextResponse.json({
        statusCode: "409",
        message: error.message
      }, { status: 409 });
    }

    if (error.message.includes('required fields') || 
        error.message.includes('Invalid') || 
        error.message.includes('does not belong')) {
      return NextResponse.json({
        statusCode: "400",
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      statusCode: "500",
      message: "Internal server error. Please try again later."
    }, { status: 500 });
  }
}