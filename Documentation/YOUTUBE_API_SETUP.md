# 🎥 YouTube API Integration Setup

This guide explains how to set up YouTube Data API v3 integration for automatic video metadata fetching.

## Features

- **Auto-fetch video information**: Paste a YouTube URL and automatically fetch:
  - Video title
  - Thumbnail URL
  - Duration (in seconds)
  - Video ID
- **Edit video URL**: Update existing videos with a new URL and re-fetch metadata
- **Multiple URL formats supported**:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - Direct video ID: `VIDEO_ID`

## Setup Instructions

### Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Data API v3"
5. Click **Enable**
6. Go to **APIs & Services** > **Credentials**
7. Click **Create Credentials** > **API Key**
8. Copy the generated API key
9. (Optional but recommended) Click **Restrict Key** and:
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Under "Application restrictions", you can restrict by HTTP referrers (your domain)

### Step 2: Add API Key to Environment Variables

#### Local Development

Create a `.env.local` file in the project root:

```bash
# YouTube Data API v3
VITE_YOUTUBE_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

#### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_YOUTUBE_API_KEY`
   - **Value**: Your YouTube API key
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your application for changes to take effect

## Usage

### Adding a New YouTube Video

1. In the Plan Editor, expand a lesson
2. Click **Add Video**
3. Set **Video Type** to "YouTube"
4. Paste a YouTube URL in the **Resource URL / ID** field:
   - Example: `https://youtu.be/dQw4w9WgXcQ`
   - Or just the ID: `dQw4w9WgXcQ`
5. Click **Fetch Info** button
6. Video title, thumbnail, and duration will be automatically filled
7. The resource URL will be updated to just the video ID

### Editing an Existing Video URL

1. In the video editor, click **Edit URL** button
2. Paste the new YouTube URL in the dialog
3. Click **Apply**
4. For YouTube videos, metadata will be automatically fetched
5. For other video types, only the URL will be updated

## API Quota

YouTube Data API v3 has a daily quota limit:
- **Default quota**: 10,000 units per day
- **Cost per video fetch**: 1 unit (videos.list operation)
- **Estimated capacity**: ~10,000 video fetches per day

### Quota Management Tips

1. **Cache locally**: Video info is only fetched once and stored in Firebase
2. **Monitor usage**: Check quota usage in [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
3. **Request increase**: If needed, you can request a quota increase from Google

## Error Handling

The integration includes comprehensive error handling:

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "YouTube API key not configured" | Missing API key | Add `VITE_YOUTUBE_API_KEY` to environment variables |
| "Invalid YouTube URL or video ID" | Malformed URL | Check URL format and try again |
| "Video not found" | Video is private/deleted | Verify video exists and is public |
| "YouTube API quota exceeded" | Daily quota limit reached | Wait until quota resets (midnight Pacific Time) |
| "YouTube API error: 403" | Invalid API key or quota exceeded | Check API key and quota in Google Cloud Console |

## Testing

### Test with Sample Videos

Use these public YouTube videos for testing:

```
https://youtu.be/dQw4w9WgXcQ  (Rick Astley - Never Gonna Give You Up)
https://youtu.be/jNQXAC9IVRw  (Me at the zoo - First YouTube video)
https://youtu.be/9bZkp7q19f0  (PSY - GANGNAM STYLE)
```

### Verify API Key

Test your API key with this curl command:

```bash
curl "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=YOUR_API_KEY"
```

If successful, you'll receive JSON with video details.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API key** to specific APIs and domains in Google Cloud Console
4. **Rotate keys regularly** if they're exposed
5. **Monitor usage** to detect unauthorized access

## Troubleshooting

### API Key Not Working

1. Verify the API key is correctly set in environment variables
2. Check that YouTube Data API v3 is enabled in Google Cloud Console
3. Ensure there are no trailing spaces in the API key
4. Try creating a new API key

### Quota Issues

1. Check current quota usage in Google Cloud Console
2. Wait for quota reset (midnight Pacific Time)
3. Request quota increase if needed
4. Consider implementing additional caching

### CORS Errors

YouTube Data API v3 supports CORS, so this shouldn't be an issue. If you encounter CORS errors:
1. Verify you're using the correct API endpoint
2. Check browser console for specific error details
3. Ensure API key restrictions aren't blocking the request

## Support

For issues with:
- **YouTube API**: [YouTube API Support](https://developers.google.com/youtube/v3/support)
- **Google Cloud Console**: [Google Cloud Support](https://cloud.google.com/support)
- **This Integration**: Create an issue in the project repository

