import mongoose, { Schema, Document } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  encryptedTitle: string;
  encryptedUsername?: string;
  encryptedPassword: string;
  encryptedWebsite?: string;
  encryptedNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  encryptedTitle: {
    type: String,
    required: true,
  },
  encryptedUsername: {
    type: String,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  encryptedWebsite: {
    type: String,
  },
  encryptedNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create index for better query performance
VaultItemSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);