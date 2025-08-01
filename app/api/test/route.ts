// =============================================================================
// API ROUTE DE TEST - ASSISTANTE BABOUNETTE
// =============================================================================

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API de test fonctionnelle',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST de test fonctionnel',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
} 