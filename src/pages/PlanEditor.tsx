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

  const loadPlan = (id: string) => {
    setLoading(true);
    try {
      // Load from local storage (instant)
      const fetchedPlan = getStudyPlan(id);
      if (fetchedPlan) {
        setPlan(fetchedPlan);
      } else {
        toast.error('Study plan not found in local storage');
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
    
    // Navigate back to plans list
    navigate('/plans');
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
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/plans')}
          sx={{ mb: 2 }}
          size="small"
        >
          Back
        </Button>
        
        <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
          {planId === 'new' ? 'Create New Study Plan' : 'Edit Study Plan'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {planId === 'new' 
            ? 'Create a new study plan with chapters, lessons, and videos'
            : 'Edit the study plan structure and content'}
        </Typography>
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Basic Information
        </Typography>
        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
        
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
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Chapters ({plan.chapters.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddChapter}
            size="small"
          >
            {plan.chapters.length === 0 ? 'Add Chapter' : 'Add'}
          </Button>
        </Box>
        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
        
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
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4, 
        flexDirection: { xs: 'column', sm: 'row' },
        position: { xs: 'sticky', sm: 'static' },
        bottom: { xs: 0, sm: 'auto' },
        backgroundColor: { xs: 'background.paper', sm: 'transparent' },
        p: { xs: 2, sm: 0 },
        mx: { xs: -1, sm: 0 },
        boxShadow: { xs: '0 -2px 10px rgba(0,0,0,0.1)', sm: 'none' },
        zIndex: { xs: 10, sm: 'auto' }
      }}>
        <Button
          variant="contained"
          size="medium"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          fullWidth
        >
          Save Locally
        </Button>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => navigate('/plans')}
          fullWidth
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default PlanEditor;

