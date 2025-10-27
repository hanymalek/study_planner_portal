import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import type { StudyPlan, StudyPlanImport } from '../types';
import { useLocalEdits } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

interface JsonImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (plans: StudyPlan[]) => void;
}

const JsonImportDialog: React.FC<JsonImportDialogProps> = ({ open, onClose, onSuccess }) => {
  const { addEdit } = useLocalEdits();
  const [file, setFile] = useState<File | null>(null);
  const [parsedPlans, setParsedPlans] = useState<StudyPlan[]>([]);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setValidationErrors([]);
    setParsedPlans([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        
        // Handle both single plan and array of plans
        const plansArray = Array.isArray(json) ? json : [json];
        
        const { plans, errors } = validateAndConvertPlans(plansArray);
        
        if (errors.length > 0) {
          setValidationErrors(errors);
        }
        
        if (plans.length > 0) {
          setParsedPlans(plans);
        } else {
          setError('No valid study plans found in the JSON file');
        }
      } catch (err) {
        setError('Invalid JSON file. Please check the format.');
        console.error('JSON parse error:', err);
      }
    };

    reader.readAsText(selectedFile);
  };

  const validateAndConvertPlans = (plansData: any[]): { plans: StudyPlan[]; errors: string[] } => {
    const plans: StudyPlan[] = [];
    const errors: string[] = [];

    plansData.forEach((planData, index) => {
      try {
        // Validate required fields
        if (!planData.name) {
          errors.push(`Plan ${index + 1}: Missing 'name' field`);
          return;
        }
        if (!planData.subjectName) {
          errors.push(`Plan ${index + 1}: Missing 'subjectName' field`);
          return;
        }
        if (!planData.chapters || !Array.isArray(planData.chapters)) {
          errors.push(`Plan ${index + 1}: Missing or invalid 'chapters' array`);
          return;
        }

        // Generate ID if not provided
        const planId = planData.id || `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Convert to StudyPlan format
        const studyPlan: StudyPlan = {
          id: planId,
          name: planData.name,
          subjectName: planData.subjectName,
          description: planData.description || '',
          examBoardId: planData.examBoardId || 'GENERAL',
          difficulty: planData.difficulty || 'BEGINNER',
          version: planData.version || 1,
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: 'admin',
          chapters: planData.chapters.map((chapter: any, chapterIndex: number) => ({
            id: chapter.id || `chapter_${chapterIndex + 1}`,
            name: chapter.name || `Chapter ${chapterIndex + 1}`,
            description: chapter.description || '',
            order: chapter.order || chapterIndex + 1,
            lessons: (chapter.lessons || []).map((lesson: any, lessonIndex: number) => ({
              id: lesson.id || `lesson_${chapterIndex + 1}_${lessonIndex + 1}`,
              name: lesson.name || `Lesson ${lessonIndex + 1}`,
              description: lesson.description || '',
              order: lesson.order || lessonIndex + 1,
              estimatedMinutes: lesson.estimatedMinutes || 30,
              videos: (lesson.videos || []).map((video: any, videoIndex: number) => ({
                id: video.id || `video_${chapterIndex + 1}_${lessonIndex + 1}_${videoIndex + 1}`,
                title: video.title || `Video ${videoIndex + 1}`,
                type: video.type || 'YOUTUBE',
                resourceUrl: video.resourceUrl || '',
                thumbnailUrl: video.thumbnailUrl || null,
                durationSeconds: video.durationSeconds || 0,
                category: video.category || 'LESSON'
              }))
            }))
          }))
        };

        plans.push(studyPlan);
      } catch (err) {
        errors.push(`Plan ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });

    return { plans, errors };
  };

  const handleImport = () => {
    if (parsedPlans.length === 0) {
      toast.error('No valid plans to import');
      return;
    }

    // Add to local edits
    parsedPlans.forEach((plan) => {
      addEdit(plan.id, plan);
    });

    toast.success(`Imported ${parsedPlans.length} study plans to local edits`);
    onSuccess(parsedPlans);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedPlans([]);
    setError('');
    setValidationErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Study Plans from JSON</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a JSON file containing one or more study plans. The file should follow the
            StudyPlan structure with chapters, lessons, and videos.
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            Choose JSON File
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Validation Warnings:</strong>
            </Typography>
            {validationErrors.map((err, index) => (
              <Typography key={index} variant="caption" display="block">
                • {err}
              </Typography>
            ))}
          </Alert>
        )}

        {parsedPlans.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Preview: {parsedPlans.length} {parsedPlans.length === 1 ? 'Plan' : 'Plans'} Found
              </Typography>
            </Box>

            <List>
              {parsedPlans.map((plan, index) => {
                const totalChapters = plan.chapters.length;
                const totalLessons = plan.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
                const totalVideos = plan.chapters.reduce(
                  (sum, ch) =>
                    sum + ch.lessons.reduce((lSum, l) => lSum + l.videos.length, 0),
                  0
                );

                return (
                  <React.Fragment key={plan.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={plan.name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {plan.subjectName} • {plan.examBoardId} • {plan.difficulty}
                            </Typography>
                            <br />
                            <Typography variant="caption" component="span">
                              {totalChapters} chapters • {totalLessons} lessons • {totalVideos} videos
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={parsedPlans.length === 0}
        >
          Import {parsedPlans.length > 0 && `(${parsedPlans.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JsonImportDialog;

