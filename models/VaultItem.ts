import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  username?: string;
  encryptedPassword: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);