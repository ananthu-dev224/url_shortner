import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortId: { type: String, unique: true },
  customAlias: { type: String, unique: true, sparse: true },
  topic: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  analytics: [
    {
      timestamp: { type: Date, default: Date.now },
      userAgent: { type: String },
      ipAddress: { type: String },
      geolocation: {
        country_name: { type: String },
        region: { type: String },
        city: { type: String },
      },
    },
  ],
});

export default mongoose.model("ShortUrl", shortUrlSchema);
