import React, { useState } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Stack,
  Box,
  MenuItem,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as VideoLibraryIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import type { VideoResource, VideoType, VideoCategory } from '../types';
import { fetchYouTubeVideoInfo, formatDuration, detectVideoType } from '../services/youtube';
import toast from 'react-hot-toast';

interface VideoEditorProps {
  video: VideoResource;
  videoIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (video: VideoResource) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  video,
  videoIndex,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove
}) => {
  const [loading, setLoading] = useState(false);

  const getVideoTypeIcon = (type: VideoType) => {
    switch (type) {
      case 'YOUTUBE':
        return <YouTubeIcon fontSize="small" color="error" />;
      case 'URL':
        return <LinkIcon fontSize="small" color="primary" />;
      default:
        return <VideoLibraryIcon fontSize="small" />;
    }
  };

  const getVideoTypeLabel = (type: VideoType) => {
    switch (type) {
      case 'YOUTUBE':
        return 'YouTube Video';
      case 'URL':
        return 'Direct Video URL';
      default:
        return 'Unknown';
    }
  };

  const handleResourceUrlChange = (url: string) => {
    const detectedType = detectVideoType(url);
    onUpdate({
      ...video,
      resourceUrl: url,
      type: detectedType as VideoType
    });
  };

  const handleFetchYouTubeInfo = async () => {
    if (!video.resourceUrl.trim()) {
      toast.error('Please enter a YouTube URL or video ID');
      return;
    }

    if (video.type !== 'YOUTUBE') {
      toast.error('Fetch Info is only available for YouTube videos');
      return;
    }

    setLoading(true);
    try {
      const info = await fetchYouTubeVideoInfo(video.resourceUrl);
      
      // Update video with fetched information
      onUpdate({
        ...video,
        title: info.title,
        resourceUrl: info.videoId,
        thumbnailUrl: info.thumbnailUrl,
        durationSeconds: info.durationSeconds,
        type: 'YOUTUBE' as VideoType
      });

      toast.success(`Fetched: ${info.title} (${formatDuration(info.durationSeconds)})`);
    } catch (error) {
      console.error('Error fetching YouTube info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch video info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        backgroundColor: 'background.default',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2}>
        {/* Header with controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getVideoTypeIcon(video.type)}
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            Video {videoIndex + 1}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onMove('up')}
            disabled={isFirst}
            title="Move up"
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onMove('down')}
            disabled={isLast}
            title="Move down"
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={onDelete}
            title="Delete video"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Resource URL with Fetch Button */}
        <Box>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1} 
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          >
            <TextField
              label="Resource URL / ID"
              fullWidth
              required
              value={video.resourceUrl}
              onChange={(e) => handleResourceUrlChange(e.target.value)}
              placeholder="YouTube URL, video ID, or direct video URL"
              size="small"
              helperText={
                video.type === 'YOUTUBE' 
                  ? 'Paste YouTube URL or video ID, then click "Fetch Info"' 
                  : 'Enter the complete URL to the video file (.mp4, .mkv, etc.)'
              }
            />
            {video.type === 'YOUTUBE' && (
              <Button
                variant="contained"
                size="small"
                onClick={handleFetchYouTubeInfo}
                disabled={loading || !video.resourceUrl}
                startIcon={loading ? <CircularProgress size={16} /> : <CloudDownloadIcon />}
                sx={{ 
                  mt: { xs: 0, sm: 0.5 },
                  minWidth: { xs: '100%', sm: 100 },
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {loading ? 'Loading...' : 'Fetch'}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Video Title */}
        <TextField
          label="Video Title"
          fullWidth
          required
          value={video.title}
          onChange={(e) => onUpdate({ ...video, title: e.target.value })}
          placeholder="e.g., Introduction to Newton's First Law"
          size="small"
        />

        {/* Category and Duration */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Category"
            value={video.category}
            onChange={(e) => onUpdate({ ...video, category: e.target.value as VideoCategory })}
            size="small"
            fullWidth
          >
            <MenuItem value="LESSON">Lesson</MenuItem>
            <MenuItem value="PRACTICE">Practice</MenuItem>
            <MenuItem value="QUIZ">Quiz</MenuItem>
            <MenuItem value="REVIEW">Review</MenuItem>
          </TextField>

          <TextField
            label="Duration (seconds)"
            type="number"
            value={video.durationSeconds}
            onChange={(e) => onUpdate({ ...video, durationSeconds: parseInt(e.target.value) || 0 })}
            size="small"
            fullWidth
          />
        </Stack>

        {/* Thumbnail URL */}
        <TextField
          label="Thumbnail URL (optional)"
          fullWidth
          value={video.thumbnailUrl || ''}
          onChange={(e) => onUpdate({ ...video, thumbnailUrl: e.target.value || undefined })}
          placeholder="https://example.com/thumbnail.jpg"
          size="small"
          helperText="Leave empty to use default thumbnail (auto-filled for YouTube)"
        />

        {/* Video Type Info (Read-only) */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: 'action.hover',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {getVideoTypeIcon(video.type)}
          <Typography variant="body2" color="text.secondary">
            <strong>Detected Type:</strong> {getVideoTypeLabel(video.type)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default VideoEditor;

