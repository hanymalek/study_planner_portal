/**
 * YouTube API Service
 * Fetches video metadata from YouTube Data API v3
 */

export interface YouTubeVideoInfo {
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  videoId: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Detect video type from URL
 */
export function detectVideoType(url: string): 'YOUTUBE' | 'URL' {
  if (!url || !url.trim()) {
    return 'YOUTUBE'; // Default
  }

  // Check if it's a YouTube URL or ID
  if (extractVideoId(url)) {
    return 'YOUTUBE';
  }

  // Check if it's a direct video URL (contains video file extensions)
  const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'URL';
  }

  // If it starts with http/https and doesn't match YouTube patterns, assume direct URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'URL';
  }

  // Default to YouTube for short strings (likely video IDs)
  return 'YOUTUBE';
}

/**
 * Convert ISO 8601 duration to seconds
 * Example: PT1H2M10S -> 3730 seconds
 */
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch video information from YouTube API
 */
export async function fetchYouTubeVideoInfo(urlOrId: string): Promise<YouTubeVideoInfo> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured. Please add VITE_YOUTUBE_API_KEY to your environment variables.');
  }

  const videoId = extractVideoId(urlOrId);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL or video ID. Please provide a valid YouTube link.');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('YouTube API quota exceeded or invalid API key. Please check your API configuration.');
      }
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found. Please check the URL and make sure the video is public.');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    return {
      title: snippet.title,
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
      durationSeconds: parseDuration(contentDetails.duration),
      videoId: videoId
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch video information from YouTube. Please try again.');
  }
}

/**
 * Format seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

