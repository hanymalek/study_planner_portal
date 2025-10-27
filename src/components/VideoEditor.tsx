import React from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Stack,
  Box,
  MenuItem,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as VideoLibraryIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import type { VideoResource, VideoType, VideoCategory } from '../types';

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
  const getVideoTypeIcon = (type: VideoType) => {
    switch (type) {
      case 'YOUTUBE':
        return <YouTubeIcon fontSize="small" />;
      case 'LOCAL':
        return <VideoLibraryIcon fontSize="small" />;
      case 'URL':
        return <LinkIcon fontSize="small" />;
      default:
        return <VideoLibraryIcon fontSize="small" />;
    }
  };

  const getResourceUrlPlaceholder = (type: VideoType) => {
    switch (type) {
      case 'YOUTUBE':
        return 'YouTube video ID (e.g., dQw4w9WgXcQ)';
      case 'LOCAL':
        return 'Local file path (e.g., /videos/lesson1.mp4)';
      case 'URL':
        return 'Direct video URL (e.g., https://example.com/video.mp4)';
      default:
        return 'Video resource identifier';
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

        {/* Video fields */}
        <TextField
          label="Video Title"
          fullWidth
          required
          value={video.title}
          onChange={(e) => onUpdate({ ...video, title: e.target.value })}
          placeholder="e.g., Introduction to Newton's First Law"
          size="small"
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Video Type"
            value={video.type}
            onChange={(e) => onUpdate({ ...video, type: e.target.value as VideoType })}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="YOUTUBE">YouTube</MenuItem>
            <MenuItem value="LOCAL">Local File</MenuItem>
            <MenuItem value="URL">Direct URL</MenuItem>
          </TextField>

          <TextField
            select
            label="Category"
            value={video.category}
            onChange={(e) => onUpdate({ ...video, category: e.target.value as VideoCategory })}
            size="small"
            sx={{ minWidth: 150 }}
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
            sx={{ maxWidth: 150 }}
          />
        </Stack>

        <TextField
          label="Resource URL / ID"
          fullWidth
          required
          value={video.resourceUrl}
          onChange={(e) => onUpdate({ ...video, resourceUrl: e.target.value })}
          placeholder={getResourceUrlPlaceholder(video.type)}
          size="small"
          helperText={
            video.type === 'YOUTUBE' 
              ? 'Enter only the video ID, not the full URL' 
              : video.type === 'LOCAL'
              ? 'Enter the path relative to the app\'s video directory'
              : 'Enter the complete URL to the video file'
          }
        />

        <TextField
          label="Thumbnail URL (optional)"
          fullWidth
          value={video.thumbnailUrl || ''}
          onChange={(e) => onUpdate({ ...video, thumbnailUrl: e.target.value || undefined })}
          placeholder="https://example.com/thumbnail.jpg"
          size="small"
          helperText="Leave empty to use default thumbnail"
        />
      </Stack>
    </Paper>
  );
};

export default VideoEditor;

