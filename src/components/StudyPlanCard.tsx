import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import type { StudyPlan } from '../types';

interface StudyPlanCardProps {
  plan: StudyPlan;
  onEdit: () => void;
  onDelete: () => void;
  hasUnsavedChanges?: boolean;
}

const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ plan, onEdit, onDelete, hasUnsavedChanges = false }) => {
  const totalChapters = plan.chapters.length;
  const totalLessons = plan.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const totalVideos = plan.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.videos.length, 0),
    0
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'warning';
      case 'ADVANCED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: hasUnsavedChanges ? '2px solid #ff9800' : undefined,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
          <MenuBookIcon color="primary" />
          <Chip
            label={plan.difficulty}
            size="small"
            color={getDifficultyColor(plan.difficulty)}
          />
          <Chip label={`v${plan.version}`} size="small" variant="outlined" />
          {hasUnsavedChanges && (
            <Chip
              icon={<CloudUploadIcon />}
              label="Not Synced"
              size="small"
              color="warning"
              variant="filled"
            />
          )}
        </Stack>

        <Typography variant="h6" gutterBottom noWrap title={plan.name}>
          {plan.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {plan.subjectName} • {plan.examBoardId}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {plan.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            📚 {totalChapters} {totalChapters === 1 ? 'Chapter' : 'Chapters'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📖 {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            🎥 {totalVideos} {totalVideos === 1 ? 'Video' : 'Videos'}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Created by {plan.createdBy}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default StudyPlanCard;

