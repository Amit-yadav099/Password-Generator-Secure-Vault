import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
}

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true,
      items: items.map(item => ({
        id: item._id.toString(),
        encryptedTitle: item.encryptedTitle,
        encryptedUsername: item.encryptedUsername,
        encryptedPassword: item.encryptedPassword,
        encryptedWebsite: item.encryptedWebsite,
        encryptedNotes: item.encryptedNotes,
        createdAt: item.createdAt
      }))
    });

  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      encryptedTitle,
      encryptedUsername,
      encryptedPassword,
      encryptedWebsite,
      encryptedNotes
    } = body;

    const newItem = await VaultItem.create({
      userId,
      encryptedTitle,
      encryptedUsername,
      encryptedPassword,
      encryptedWebsite,
      encryptedNotes
    });

    return NextResponse.json({
      success: true,
      item: {
        id: newItem._id.toString(),
        encryptedTitle: newItem.encryptedTitle,
        encryptedUsername: newItem.encryptedUsername,
        encryptedPassword: newItem.encryptedPassword,
        encryptedWebsite: newItem.encryptedWebsite,
        encryptedNotes: newItem.encryptedNotes,
        createdAt: newItem.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// similarly we can create here the put and delete fucntion for the vault later 