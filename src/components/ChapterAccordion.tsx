import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Box,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import type { Chapter } from '../types';
import LessonAccordion from './LessonAccordion';
import { v4 as uuidv4 } from 'uuid';

interface ChapterAccordionProps {
  chapter: Chapter;
  chapterIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (chapter: Chapter) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
  chapter,
  chapterIndex,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleAddLesson = () => {
    const newLesson = {
      id: uuidv4(),
      name: `Lesson ${chapter.lessons.length + 1}`,
      description: '',
      order: chapter.lessons.length + 1,
      estimatedMinutes: 30,
      practiceMinutes: 60,
      videos: []
    };
    
    onUpdate({
      ...chapter,
      lessons: [...chapter.lessons, newLesson]
    });
  };

  const handleUpdateLesson = (lessonIndex: number, updatedLesson: any) => {
    const newLessons = [...chapter.lessons];
    newLessons[lessonIndex] = updatedLesson;
    onUpdate({ ...chapter, lessons: newLessons });
  };

  const handleDeleteLesson = (lessonIndex: number) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const newLessons = chapter.lessons.filter((_, index) => index !== lessonIndex);
      // Reorder remaining lessons
      newLessons.forEach((lesson, index) => {
        lesson.order = index + 1;
      });
      onUpdate({ ...chapter, lessons: newLessons });
    }
  };

  const handleMoveLesson = (lessonIndex: number, direction: 'up' | 'down') => {
    const newLessons = [...chapter.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;
    
    // Swap lessons
    [newLessons[lessonIndex], newLessons[targetIndex]] = 
      [newLessons[targetIndex], newLessons[lessonIndex]];
    
    // Update order numbers
    newLessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    
    onUpdate({ ...chapter, lessons: newLessons });
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        '&:before': { display: 'none' },
        boxShadow: 1,
        mb: 1
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          minHeight: { xs: 64, sm: 64 },
          '& .MuiAccordionSummary-content': {
            my: { xs: 1.5, sm: 1.5 }
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
            variant="h6" 
            sx={{ 
              flexGrow: 1, 
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 0.5, sm: 0 }
            }}
          >
            Chapter {chapterIndex + 1}: {chapter.name || 'Untitled Chapter'}
          </Typography>
          
          {/* Second line on mobile: Chip + Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' }
          }}>
            <Chip 
              label={`${chapter.lessons.length} lesson${chapter.lessons.length !== 1 ? 's' : ''}`} 
              size="small" 
              color="primary"
              variant="outlined"
            />
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
                title="Delete chapter"
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {/* Chapter Details */}
          <TextField
            label="Chapter Name"
            fullWidth
            required
            value={chapter.name}
            onChange={(e) => onUpdate({ ...chapter, name: e.target.value })}
            placeholder="e.g., Introduction to Mechanics"
            size="small"
          />
          
          <TextField
            label="Chapter Description"
            fullWidth
            multiline
            rows={2}
            value={chapter.description}
            onChange={(e) => onUpdate({ ...chapter, description: e.target.value })}
            placeholder="Brief description of this chapter..."
            size="small"
          />

          {/* Lessons Section */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Lessons ({chapter.lessons.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddLesson}
              >
                {chapter.lessons.length === 0 ? 'Add Lesson' : 'Add'}
              </Button>
            </Box>
            
            {chapter.lessons.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No lessons yet. Click "Add Lesson" to create one.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {chapter.lessons.map((lesson, index) => (
                  <LessonAccordion
                    key={lesson.id}
                    lesson={lesson}
                    lessonIndex={index}
                    chapterIndex={chapterIndex}
                    isFirst={index === 0}
                    isLast={index === chapter.lessons.length - 1}
                    onUpdate={(updatedLesson) => handleUpdateLesson(index, updatedLesson)}
                    onDelete={() => handleDeleteLesson(index)}
                    onMove={(direction) => handleMoveLesson(index, direction)}
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

export default ChapterAccordion;

