import React, { useState, useEffect } from 'react';
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
  Add as AddIcon
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

const LessonAccordion: React.FC<LessonAccordionProps> = ({
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
    const totalVideoSeconds = lesson.videos.reduce((sum, video) => sum + (video.durationSeconds || 0), 0);
    const totalVideoMinutes = Math.ceil(totalVideoSeconds / 60);
    
    // Only update if different to avoid infinite loops
    if (totalVideoMinutes !== lesson.estimatedMinutes) {
      onUpdate({ ...lesson, estimatedMinutes: totalVideoMinutes });
    }
  }, [lesson.videos]); // Only recalculate when videos array changes

  const handleAddVideo = () => {
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
  };

  const handleUpdateVideo = (videoIndex: number, updatedVideo: any) => {
    const newVideos = [...lesson.videos];
    newVideos[videoIndex] = updatedVideo;
    onUpdate({ ...lesson, videos: newVideos });
  };

  const handleDeleteVideo = (videoIndex: number) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const newVideos = lesson.videos.filter((_, index) => index !== videoIndex);
      onUpdate({ ...lesson, videos: newVideos });
    }
  };

  const handleMoveVideo = (videoIndex: number, direction: 'up' | 'down') => {
    const newVideos = [...lesson.videos];
    const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newVideos.length) return;
    
    // Swap videos
    [newVideos[videoIndex], newVideos[targetIndex]] = 
      [newVideos[targetIndex], newVideos[videoIndex]];
    
    onUpdate({ ...lesson, videos: newVideos });
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          minHeight: { xs: 64, sm: 56 },
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
          <Typography 
            variant="subtitle1" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 0.5, sm: 0 }
            }}
          >
            {chapterIndex + 1}.{lessonIndex + 1} {lesson.name || 'Untitled Lesson'}
          </Typography>
          
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
                label={`${lesson.videos.length} video${lesson.videos.length !== 1 ? 's' : ''}`} 
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
                size="small"
                onClick={() => onMove('up')}
                disabled={isFirst}
                title="Move up"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onMove('down')}
                disabled={isLast}
                title="Move down"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={onDelete}
                title="Delete lesson"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
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

          {/* Videos Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Videos ({lesson.videos.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddVideo}
              >
                Add Video
              </Button>
            </Box>
            
            {lesson.videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
                No videos yet. Click "Add Video" to create one.
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
      </AccordionDetails>
    </Accordion>
  );
};

export default LessonAccordion;

