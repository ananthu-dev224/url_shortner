import ShortUrl from "../models/shortUrl.js";
import moment from "moment";

// Get URL Analytics
export const getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const shortUrl = await ShortUrl.findOne({ shortId: alias });

    if (!shortUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    const analytics = shortUrl.analytics;
    const totalClicks = analytics.length;

    const uniqueUsers = new Set(analytics.map((a) => a.ipAddress)).size;

    const clicksByDate = Array.from({ length: 7 }).map((_, i) => {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      const count = analytics.filter((a) =>
        moment(a.timestamp).isSame(date, "day")
      ).length;
      return { date, count };
    });

    const osType = Object.entries(
      analytics.reduce((acc, { osName, ipAddress }) => {
        if (!acc[osName])
          acc[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        acc[osName].uniqueClicks += 1;
        acc[osName].uniqueUsers.add(ipAddress);
        return acc;
      }, {})
    ).map(([osName, { uniqueClicks, uniqueUsers }]) => ({
      osName,
      uniqueClicks,
      uniqueUsers: uniqueUsers.size,
    }));

    const deviceType = Object.entries(
      analytics.reduce((acc, { deviceType, ipAddress }) => {
        if (!acc[deviceType])
          acc[deviceType] = { uniqueClicks: 0, uniqueUsers: new Set() };
        acc[deviceType].uniqueClicks += 1;
        acc[deviceType].uniqueUsers.add(ipAddress);
        return acc;
      }, {})
    ).map(([deviceName, { uniqueClicks, uniqueUsers }]) => ({
      deviceName,
      uniqueClicks,
      uniqueUsers: uniqueUsers.size,
    }));

    res.json({ totalClicks, uniqueUsers, clicksByDate, osType, deviceType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Topic-Based Analytics
export const getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;
    const shortUrls = await ShortUrl.find({ topic });

    if (!shortUrls.length) {
      return res.status(404).json({ error: "No URLs found for this topic" });
    }

    const totalClicks = shortUrls.reduce(
      (acc, url) => acc + url.analytics.length,
      0
    );
    const uniqueUsers = new Set(
      shortUrls.flatMap((url) => url.analytics.map((a) => a.ipAddress))
    ).size;

    const clicksByDate = Array.from({ length: 7 }).map((_, i) => {
      const date = moment().subtract(i, "days").format("YYYY-MM-DD");
      const count = shortUrls.reduce(
        (acc, url) =>
          acc +
          url.analytics.filter((a) => moment(a.timestamp).isSame(date, "day"))
            .length,
        0
      );
      return { date, count };
    });

    const urls = shortUrls.map((url) => ({
      shortUrl: `${req.protocol}://${req.get("host")}/api/shorten/${
        url.shortId
      }`,
      totalClicks: url.analytics.length,
      uniqueUsers: new Set(url.analytics.map((a) => a.ipAddress)).size,
    }));

    res.json({ totalClicks, uniqueUsers, clicksByDate, urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Overall Analytics
export const getOverallAnalytics = async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch all URLs created by the user
    const urls = await ShortUrl.find({ user: userId });

    if (!urls.length) {
      return res
        .status(404)
        .json({ message: "No short URLs found for this user" });
    }

    // Initialize analytics data
    let totalClicks = 0;
    const uniqueUsers = new Set();
    const clicksByDate = {};
    const osType = {};
    const deviceType = {};

    // Process each URL
    urls.forEach((url) => {
      // Aggregate total clicks
      totalClicks += url.analytics.length;

      // Unique users
      url.analytics.forEach((entry) => {
        if (entry.ipAddress) {
          uniqueUsers.add(entry.ipAddress); // Use IP as a proxy for unique users
        }

        // Clicks by date
        const date = entry.timestamp.toISOString().split("T")[0]; // Extract YYYY-MM-DD
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;

        // OS types
        if (entry.osName) {
          if (!osType[entry.osName]) {
            osType[entry.osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
          }
          osType[entry.osName].uniqueClicks++;
          osType[entry.osName].uniqueUsers.add(entry.ipAddress);
        }

        // Device types
        if (entry.deviceType) {
          if (!deviceType[entry.deviceType]) {
            deviceType[entry.deviceType] = {
              uniqueClicks: 0,
              uniqueUsers: new Set(),
            };
          }
          deviceType[entry.deviceType].uniqueClicks++;
          deviceType[entry.deviceType].uniqueUsers.add(entry.ipAddress);
        }
      });
    });

    // Convert sets and objects to arrays for response
    res.status(200).json({
      totalUrls: urls.length,
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      clicksByDate: Object.entries(clicksByDate).map(([date, clicks]) => ({
        date,
        clicks,
      })),
      osType: Object.entries(osType).map(([osName, data]) => ({
        osName,
        uniqueClicks: data.uniqueClicks,
        uniqueUsers: data.uniqueUsers.size,
      })),
      deviceType: Object.entries(deviceType).map(([deviceName, data]) => ({
        deviceName,
        uniqueClicks: data.uniqueClicks,
        uniqueUsers: data.uniqueUsers.size,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
