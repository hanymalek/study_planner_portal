import React, { useState, useCallback, useMemo } from 'react';
import {
  TextField,
  IconButton,
  Stack,
  Box,
  MenuItem,
  Typography,
  Button,
  CircularProgress,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as VideoLibraryIcon,
  Link as LinkIcon,
  CloudDownload as CloudDownloadIcon,
  FiberManualRecord as DotIcon
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

const VideoEditor: React.FC<VideoEditorProps> = React.memo(({
  video,
  videoIndex,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove
}) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Memoize category options to ensure they're stable
  const categoryOptions = useMemo(() => {
    if (video.type === 'WEB_RESOURCE') {
      return [
        { value: 'LESSON', label: 'Study Notes' },
        { value: 'PRACTICE', label: 'Past Papers' },
        { value: 'REVIEW', label: 'Classified' }
      ];
    }
    return [
      { value: 'LESSON', label: 'Lesson' },
      { value: 'PRACTICE', label: 'Practice' },
      { value: 'QUIZ', label: 'Quiz' },
      { value: 'REVIEW', label: 'Review' }
    ];
  }, [video.type]);
  
  // Get display title based on resource type
  const getDisplayTitle = () => {
    if (video.type === 'WEB_RESOURCE') {
      return video.title ? video.title : `Web Resource ${videoIndex + 1}`;
    }
    return video.title ? video.title : `Video ${videoIndex + 1}`;
  };

  const handleCategoryChange = useCallback((e: SelectChangeEvent<string>) => {
    onUpdate({ ...video, category: e.target.value as VideoCategory });
  }, [video, onUpdate]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...video, title: e.target.value });
  }, [video, onUpdate]);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...video, durationSeconds: parseInt(e.target.value) || 0 });
  }, [video, onUpdate]);

  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...video, thumbnailUrl: e.target.value || undefined });
  }, [video, onUpdate]);

  const getVideoTypeIcon = (type: VideoType) => {
    switch (type) {
      case 'YOUTUBE':
        return <YouTubeIcon fontSize="small" color="error" />;
      case 'URL':
        return <LinkIcon fontSize="small" color="primary" />;
      case 'WEB_RESOURCE':
        return <LinkIcon fontSize="small" color="secondary" />;
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
      case 'WEB_RESOURCE':
        return 'Web Resource';
      default:
        return 'Unknown';
    }
  };

  const handleResourceUrlChange = (url: string) => {
    // Don't auto-detect type if already a WEB_RESOURCE
    if (video.type === 'WEB_RESOURCE') {
      onUpdate({
        ...video,
        resourceUrl: url
        // Don't auto-update title for web resources - let user set it
      });
    } else {
      const detectedType = detectVideoType(url);
      onUpdate({
        ...video,
        resourceUrl: url,
        type: detectedType as VideoType
      });
    }
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
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        border: '2px solid',
        borderColor: expanded ? 'success.main' : 'divider',
        '&:before': { display: 'none' },
        boxShadow: expanded ? 2 : 0,
        transition: 'all 0.3s ease'
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          minHeight: 48,
          background: expanded 
            ? 'linear-gradient(90deg, rgba(46, 125, 50, 0.08) 0%, rgba(46, 125, 50, 0.02) 100%)'
            : 'transparent',
          '&:hover': {
            background: expanded
              ? 'linear-gradient(90deg, rgba(46, 125, 50, 0.12) 0%, rgba(46, 125, 50, 0.03) 100%)'
              : 'rgba(0, 0, 0, 0.04)'
          },
          transition: 'background 0.3s ease',
          '& .MuiAccordionSummary-content': {
            my: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          {expanded && (
            <DotIcon 
              sx={{ 
                fontSize: '0.6rem', 
                color: 'success.main',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }} 
            />
          )}
          {getVideoTypeIcon(video.type)}
          <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: expanded ? 600 : 500 }}>
            {getDisplayTitle()}
          </Typography>
          {video.type === 'WEB_RESOURCE' && (
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1, 
                py: 0.5, 
                backgroundColor: 'secondary.main', 
                color: 'secondary.contrastText',
                borderRadius: 1,
                fontSize: '0.7rem',
                mr: 1
              }}
            >
              URL
            </Typography>
          )}
          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              component="div"
              size="small"
              onClick={() => onMove('up')}
              disabled={isFirst}
              title="Move up"
              sx={{ cursor: isFirst ? 'default' : 'pointer' }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="div"
              size="small"
              onClick={() => onMove('down')}
              disabled={isLast}
              title="Move down"
              sx={{ cursor: isLast ? 'default' : 'pointer' }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="div"
              size="small"
              color="error"
              onClick={onDelete}
              title="Delete resource"
              sx={{ cursor: 'pointer' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ pt: 0 }}>
        {expanded && (
          <Stack spacing={2}>

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
              placeholder={
                video.type === 'WEB_RESOURCE' 
                  ? 'https://example.com/study-notes' 
                  : video.type === 'YOUTUBE'
                  ? 'YouTube URL, video ID'
                  : 'Direct video URL'
              }
              size="small"
              helperText={
                video.type === 'WEB_RESOURCE'
                  ? 'Enter the complete webpage URL (study notes, past papers, etc.)'
                  : video.type === 'YOUTUBE' 
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

        {/* Title field - different labels for videos vs web resources */}
        <TextField
          label={video.type === 'WEB_RESOURCE' ? 'Resource Title' : 'Video Title'}
          fullWidth
          required
          value={video.title}
          onChange={handleTitleChange}
          placeholder={video.type === 'WEB_RESOURCE' ? 'e.g., Chapter 1 Study Notes' : 'e.g., Introduction to Newton\'s First Law'}
          size="small"
          helperText={video.type === 'WEB_RESOURCE' ? 'Display name for this resource in the app' : undefined}
        />

        {/* Category and Duration */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Category"
            value={video.category || 'LESSON'}
            onChange={handleCategoryChange as any}
            size="small"
            fullWidth
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Duration - Hidden for WEB_RESOURCE */}
          {video.type !== 'WEB_RESOURCE' && (
            <TextField
              label="Duration (seconds)"
              type="number"
              value={video.durationSeconds}
              onChange={handleDurationChange}
              size="small"
              fullWidth
            />
          )}
        </Stack>

        {/* Thumbnail URL - Hidden for WEB_RESOURCE */}
        {video.type !== 'WEB_RESOURCE' && (
          <TextField
            label="Thumbnail URL (optional)"
            fullWidth
            value={video.thumbnailUrl || ''}
            onChange={handleThumbnailChange}
            placeholder="https://example.com/thumbnail.jpg"
            size="small"
            helperText="Leave empty to use default thumbnail (auto-filled for YouTube)"
          />
        )}

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
        )}
      </AccordionDetails>
    </Accordion>
  );
});

VideoEditor.displayName = 'VideoEditor';

export default VideoEditor;

