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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

     const { id } = await params;

    const body = await request.json();
    const {
      encryptedTitle,
      encryptedUsername,
      encryptedPassword,
      encryptedWebsite,
      encryptedNotes
    } = body;

    // Find the item and verify ownership
    const existingItem = await VaultItem.findOne({ 
      _id:id, 
      userId 
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem = await VaultItem.findByIdAndUpdate(
      id,
      {
        encryptedTitle,
        encryptedUsername,
        encryptedPassword,
        encryptedWebsite,
        encryptedNotes,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem!._id.toString(),
        encryptedTitle: updatedItem!.encryptedTitle,
        encryptedUsername: updatedItem!.encryptedUsername,
        encryptedPassword: updatedItem!.encryptedPassword,
        encryptedWebsite: updatedItem!.encryptedWebsite,
        encryptedNotes: updatedItem!.encryptedNotes,
        createdAt: updatedItem!.createdAt,
        updatedAt: updatedItem!.updatedAt
      }
    });

  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the item and verify ownership
    const existingItem = await VaultItem.findOne({ 
      _id:id, 
      userId 
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: 'Item not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the item
    await VaultItem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}