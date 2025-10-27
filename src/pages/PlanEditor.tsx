import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getStudyPlan } from '../services/api';
import { useLocalEdits } from '../hooks/useLocalStorage';
import type { StudyPlan, Difficulty } from '../types';
import ChapterAccordion from '../components/ChapterAccordion';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const PlanEditor: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { addEdit } = useLocalEdits();
  
  const [loading, setLoading] = useState(!!planId);
  const [plan, setPlan] = useState<StudyPlan>({
    id: uuidv4(),
    name: '',
    subjectName: '',
    description: '',
    examBoardId: '',
    difficulty: 'BEGINNER' as Difficulty,
    version: 1,
    isDeleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'admin',
    chapters: []
  });

  useEffect(() => {
    if (planId && planId !== 'new') {
      loadPlan(planId);
    } else {
      setLoading(false);
    }
  }, [planId]);

  const loadPlan = async (id: string) => {
    setLoading(true);
    try {
      const fetchedPlan = await getStudyPlan(id);
      if (fetchedPlan) {
        setPlan(fetchedPlan);
      } else {
        toast.error('Study plan not found');
        navigate('/plans');
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load study plan');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Validation
    if (!plan.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!plan.subjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (plan.chapters.length === 0) {
      toast.error('At least one chapter is required');
      return;
    }

    // Save to local edits
    const updatedPlan: StudyPlan = {
      ...plan,
      updatedAt: Date.now()
    };
    
    addEdit(updatedPlan.id, updatedPlan);
    setPlan(updatedPlan);
    
    toast.success('Study plan saved locally! Remember to upload changes.');
  };

  const handleAddChapter = () => {
    const newChapter = {
      id: uuidv4(),
      name: `Chapter ${plan.chapters.length + 1}`,
      description: '',
      order: plan.chapters.length + 1,
      lessons: []
    };
    
    setPlan({
      ...plan,
      chapters: [...plan.chapters, newChapter]
    });
  };

  const handleUpdateChapter = (chapterIndex: number, updatedChapter: any) => {
    const newChapters = [...plan.chapters];
    newChapters[chapterIndex] = updatedChapter;
    setPlan({ ...plan, chapters: newChapters });
  };

  const handleDeleteChapter = (chapterIndex: number) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const newChapters = plan.chapters.filter((_, index) => index !== chapterIndex);
      // Reorder remaining chapters
      newChapters.forEach((chapter, index) => {
        chapter.order = index + 1;
      });
      setPlan({ ...plan, chapters: newChapters });
      toast.success('Chapter deleted');
    }
  };

  const handleMoveChapter = (chapterIndex: number, direction: 'up' | 'down') => {
    const newChapters = [...plan.chapters];
    const targetIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newChapters.length) return;
    
    // Swap chapters
    [newChapters[chapterIndex], newChapters[targetIndex]] = 
      [newChapters[targetIndex], newChapters[chapterIndex]];
    
    // Update order numbers
    newChapters.forEach((chapter, index) => {
      chapter.order = index + 1;
    });
    
    setPlan({ ...plan, chapters: newChapters });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/plans')}
          sx={{ mb: 2 }}
        >
          Back to Study Plans
        </Button>
        
        <Typography variant="h4" gutterBottom>
          {planId === 'new' ? 'Create New Study Plan' : 'Edit Study Plan'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {planId === 'new' 
            ? 'Create a new study plan with chapters, lessons, and videos'
            : 'Edit the study plan structure and content'}
        </Typography>
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <TextField
            label="Plan Name"
            fullWidth
            required
            value={plan.name}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
            placeholder="e.g., Introduction to Physics"
          />
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Subject Name"
              fullWidth
              required
              value={plan.subjectName}
              onChange={(e) => setPlan({ ...plan, subjectName: e.target.value })}
              placeholder="e.g., Physics"
            />
            
            <TextField
              label="Exam Board"
              fullWidth
              value={plan.examBoardId}
              onChange={(e) => setPlan({ ...plan, examBoardId: e.target.value })}
              placeholder="e.g., IGCSE, A-Level"
            />
            
            <TextField
              select
              label="Difficulty"
              fullWidth
              value={plan.difficulty}
              onChange={(e) => setPlan({ ...plan, difficulty: e.target.value as Difficulty })}
            >
              <MenuItem value="BEGINNER">Beginner</MenuItem>
              <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
              <MenuItem value="ADVANCED">Advanced</MenuItem>
            </TextField>
          </Stack>
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={plan.description}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
            placeholder="Brief description of the study plan..."
          />
        </Stack>
      </Paper>

      {/* Chapters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Chapters ({plan.chapters.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddChapter}
          >
            Add Chapter
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {plan.chapters.length === 0 ? (
          <Alert severity="info">
            No chapters yet. Click "Add Chapter" to get started.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {plan.chapters.map((chapter, index) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                chapterIndex={index}
                isFirst={index === 0}
                isLast={index === plan.chapters.length - 1}
                onUpdate={(updatedChapter) => handleUpdateChapter(index, updatedChapter)}
                onDelete={() => handleDeleteChapter(index)}
                onMove={(direction) => handleMoveChapter(index, direction)}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Locally
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/plans')}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default PlanEditor;

