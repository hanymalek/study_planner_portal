import React, { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Stack,
  Box,
  Chip,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Language as LanguageIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';
import type { Lesson, VideoResource } from '../types';
import { VideoType, VideoCategory } from '../types';
import VideoEditor from './VideoEditor';
import { v4 as uuidv4 } from 'uuid';

interface LessonAccordionProps {
  lesson: Lesson;
  lessonIndex: number;
  chapterIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (lesson: Lesson) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const LessonAccordion: React.FC<LessonAccordionProps> = React.memo(({
  lesson,
  lessonIndex,
  chapterIndex,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove
}) => {
  const [expanded, setExpanded] = useState(false);

  // Auto-calculate video minutes based on total video duration
  useEffect(() => {
    // Only calculate when expanded to avoid unnecessary updates
    if (!expanded) return;
    
    const totalVideoSeconds = lesson.videos.reduce((sum, video) => sum + (video.durationSeconds || 0), 0);
    const totalVideoMinutes = Math.ceil(totalVideoSeconds / 60);
    
    // Only update if different to avoid infinite loops
    if (totalVideoMinutes !== lesson.estimatedMinutes) {
      onUpdate({ ...lesson, estimatedMinutes: totalVideoMinutes });
    }
  }, [lesson.videos, lesson.estimatedMinutes, expanded, onUpdate, lesson]); // Include all dependencies

  const handleAddVideo = useCallback(() => {
    const newVideo: VideoResource = {
      id: uuidv4(),
      title: `Video ${lesson.videos.length + 1}`,
      type: VideoType.YOUTUBE,
      resourceUrl: '',
      thumbnailUrl: undefined,
      durationSeconds: 0,
      category: VideoCategory.LESSON
    };
    
    onUpdate({
      ...lesson,
      videos: [...lesson.videos, newVideo]
    });
  }, [lesson, onUpdate]);

  const handleAddWebResource = useCallback(() => {
    const newResource: VideoResource = {
      id: uuidv4(),
      title: '', // User will set a custom title
      type: VideoType.WEB_RESOURCE,
      resourceUrl: '',
      thumbnailUrl: undefined,
      durationSeconds: 0,
      category: 'LESSON' as VideoCategory // Explicitly set as string enum value
    };
    
    onUpdate({
      ...lesson,
      videos: [...lesson.videos, newResource]
    });
  }, [lesson, onUpdate]);

  const handleUpdateVideo = useCallback((videoIndex: number, updatedVideo: any) => {
    const newVideos = [...lesson.videos];
    newVideos[videoIndex] = updatedVideo;
    onUpdate({ ...lesson, videos: newVideos });
  }, [lesson, onUpdate]);

  const handleDeleteVideo = useCallback((videoIndex: number) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const newVideos = lesson.videos.filter((_, index) => index !== videoIndex);
      onUpdate({ ...lesson, videos: newVideos });
    }
  }, [lesson, onUpdate]);

  const handleMoveVideo = useCallback((videoIndex: number, direction: 'up' | 'down') => {
    const newVideos = [...lesson.videos];
    const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newVideos.length) return;
    
    // Swap videos
    [newVideos[videoIndex], newVideos[targetIndex]] = 
      [newVideos[targetIndex], newVideos[videoIndex]];
    
    onUpdate({ ...lesson, videos: newVideos });
  }, [lesson, onUpdate]);

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        border: '2px solid',
        borderColor: expanded ? 'secondary.main' : 'divider',
        '&:before': { display: 'none' },
        boxShadow: expanded ? 2 : 0,
        transition: 'all 0.3s ease'
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          minHeight: { xs: 64, sm: 56 },
          background: expanded 
            ? 'linear-gradient(90deg, rgba(237, 108, 2, 0.08) 0%, rgba(237, 108, 2, 0.02) 100%)'
            : 'transparent',
          '&:hover': {
            background: expanded
              ? 'linear-gradient(90deg, rgba(237, 108, 2, 0.12) 0%, rgba(237, 108, 2, 0.03) 100%)'
              : 'rgba(0, 0, 0, 0.04)'
          },
          transition: 'background 0.3s ease',
          '& .MuiAccordionSummary-content': {
            my: { xs: 1.5, sm: 1 }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          width: '100%', 
          gap: { xs: 0.5, sm: 2 }
        }}>
          {/* Title - Full width on mobile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, mb: { xs: 0.5, sm: 0 } }}>
            {expanded && (
              <DotIcon 
                sx={{ 
                  fontSize: '0.7rem', 
                  color: 'secondary.main',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }} 
              />
            )}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: expanded ? 600 : 400
              }}
            >
              {chapterIndex + 1}.{lessonIndex + 1} {lesson.name || 'Untitled Lesson'}
            </Typography>
          </Box>
          
          {/* Second line on mobile: Chips + Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' }
          }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip 
                label={`${lesson.videos.length} resource${lesson.videos.length !== 1 ? 's' : ''}`} 
                size="small" 
                color="secondary"
                variant="outlined"
              />
              <Chip 
                label={`${lesson.estimatedMinutes} min`} 
                size="small"
                variant="outlined"
              />
            </Box>
            <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                component="div"
                size="small"
                onClick={() => onMove('up')}
                disabled={isFirst}
                title="Move up"
                sx={{ p: { xs: 0.5, sm: 1 }, cursor: isFirst ? 'default' : 'pointer' }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="div"
                size="small"
                onClick={() => onMove('down')}
                disabled={isLast}
                title="Move down"
                sx={{ p: { xs: 0.5, sm: 1 }, cursor: isLast ? 'default' : 'pointer' }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="div"
                size="small"
                color="error"
                onClick={onDelete}
                title="Delete lesson"
                sx={{ p: { xs: 0.5, sm: 1 }, cursor: 'pointer' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        {/* Only render content when expanded - performance optimization */}
        {expanded && (
          <Stack spacing={2}>
            {/* Lesson Details */}
            <TextField
              label="Lesson Name"
              fullWidth
              required
              value={lesson.name}
              onChange={(e) => onUpdate({ ...lesson, name: e.target.value })}
              placeholder="e.g., Newton's Laws of Motion"
              size="small"
            />
            
            <TextField
              label="Lesson Description"
              fullWidth
              multiline
              rows={2}
              value={lesson.description}
              onChange={(e) => onUpdate({ ...lesson, description: e.target.value })}
              placeholder="Brief description of this lesson..."
              size="small"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Video Minutes"
                type="number"
                value={lesson.estimatedMinutes}
                size="small"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                helperText="Auto-calculated from video durations"
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: 'action.hover',
                    cursor: 'not-allowed'
                  }
                }}
              />
              
              <TextField
                label="Practice Minutes"
                type="number"
                value={lesson.practiceMinutes || 60}
                onChange={(e) => onUpdate({ ...lesson, practiceMinutes: parseInt(e.target.value) || 60 })}
                size="small"
                fullWidth
                helperText="Exercise/practice time"
              />
            </Stack>

            {/* Videos & Resources Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Videos & Resources ({lesson.videos.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddVideo}
                  >
                    Add Video
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<LanguageIcon />}
                    onClick={handleAddWebResource}
                  >
                    Add URL
                  </Button>
                </Box>
              </Box>
              
            {lesson.videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
                No videos or resources yet. Click "Add Video" or "Add URL" to create one.
              </Typography>
            ) : (
                <Stack spacing={1}>
                  {lesson.videos.map((video, index) => (
                    <VideoEditor
                      key={video.id}
                      video={video}
                      videoIndex={index}
                      isFirst={index === 0}
                      isLast={index === lesson.videos.length - 1}
                      onUpdate={(updatedVideo) => handleUpdateVideo(index, updatedVideo)}
                      onDelete={() => handleDeleteVideo(index)}
                      onMove={(direction) => handleMoveVideo(index, direction)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

LessonAccordion.displayName = 'LessonAccordion';

export default LessonAccordion;

