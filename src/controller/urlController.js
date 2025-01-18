import ShortUrl from "../models/shortUrl.js";
import { nanoid } from "nanoid";
import axios from "axios";

export const createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.id;

    // Check for required fields
    if (!longUrl) {
      return res.status(400).json({ error: "Long URL is required." });
    }

    // Check if custom alias already exists
    if (customAlias) {
      const existingAlias = await ShortUrl.findOne({ customAlias });
      if (existingAlias) {
        return res.status(400).json({ error: "Custom alias already in use." });
      }
    }

    // Generate a shortId if no custom alias is provided
    const shortId = customAlias || nanoid(8);

    // Save to database
    const newShortUrl = new ShortUrl({
      longUrl,
      shortId,
      customAlias: customAlias || null,
      topic,
      user: userId,
    });

    await newShortUrl.save();

    res.status(201).json({
      shortUrl: `${req.protocol}://${req.get("host")}/api/shorten/${shortId}`,
      createdAt: newShortUrl.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const redirectShortUrl = async (req, res) => {
  try {
    const { alias } = req.params;

    // Find short URL in the database
    const shortUrl = await ShortUrl.findOne({
      $or: [{ shortId: alias }, { customAlias: alias }],
    });

    if (!shortUrl) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    // Get user agent and IP address
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    // Fetch geolocation data
    const geoResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);

    // Log analytics
    shortUrl.analytics.push({
      userAgent,
      ipAddress,
      geolocation: geoResponse.data,
    });

    await shortUrl.save();

    // Redirect to the original URL
    res.redirect(shortUrl.longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
