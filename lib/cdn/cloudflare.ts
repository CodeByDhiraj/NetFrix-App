// Cloudflare CDN Configuration
export class CloudflareService {
  private static readonly ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
  private static readonly API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
  private static readonly BASE_URL = "https://api.cloudflare.com/client/v4"

  static async purgeCache(urls: string[] = []): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/zones/${this.ZONE_ID}/purge_cache`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: urls.length > 0 ? urls : undefined,
          purge_everything: urls.length === 0,
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Cloudflare cache purge error:", error)
      return false
    }
  }

  static async createPageRule(url: string, settings: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/zones/${this.ZONE_ID}/pagerules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targets: [{ target: "url", constraint: { operator: "matches", value: url } }],
          actions: settings,
          status: "active",
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Cloudflare page rule error:", error)
      return false
    }
  }

  static getOptimizedImageUrl(
    originalUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: "webp" | "avif" | "auto"
    } = {},
  ): string {
    const { width, height, quality = 85, format = "auto" } = options

    // Cloudflare Image Resizing
    const params = new URLSearchParams()
    if (width) params.set("width", width.toString())
    if (height) params.set("height", height.toString())
    params.set("quality", quality.toString())
    params.set("format", format)

    return `/cdn-cgi/image/${params.toString()}/${originalUrl}`
  }

  static async getAnalytics(since: Date, until: Date): Promise<any> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/zones/${this.ZONE_ID}/analytics/dashboard?since=${since.toISOString()}&until=${until.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.API_TOKEN}`,
          },
        },
      )

      const result = await response.json()
      return result.result
    } catch (error) {
      console.error("Cloudflare analytics error:", error)
      return null
    }
  }
}

// CDN Helper Functions
export const CDN_CONFIG = {
  // Cache settings for different content types
  CACHE_SETTINGS: {
    static: {
      browser_ttl: 31536000, // 1 year
      edge_ttl: 31536000,
      cache_level: "cache_everything",
    },
    api: {
      browser_ttl: 0,
      edge_ttl: 300, // 5 minutes
      cache_level: "bypass",
    },
    content: {
      browser_ttl: 86400, // 1 day
      edge_ttl: 86400,
      cache_level: "cache_everything",
    },
  },

  // Image optimization presets
  IMAGE_PRESETS: {
    thumbnail: { width: 300, height: 450, quality: 80 },
    backdrop: { width: 1920, height: 1080, quality: 85 },
    avatar: { width: 100, height: 100, quality: 90 },
    poster: { width: 500, height: 750, quality: 85 },
  },
}
