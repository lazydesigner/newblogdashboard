// models/MediaItem.js
import mongoose from 'mongoose';

const MediaItemSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  altText: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  size: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.MediaItem || mongoose.model('MediaItem', MediaItemSchema);