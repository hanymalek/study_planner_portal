import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  Star as StarIcon,
  FitnessCenter as FitnessCenterIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { getStudyPlan, getUserProgressForPlan } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { StudyPlan, LessonCompletion, VideoProgress } from '../types';

const PlanDetails: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      loadPlanDetails();
    }
  }, [planId, currentUser]);

  const loadPlanDetails = () => {
    if (!planId) return;
    
    setError(null);
    
    try {
      // Load from local storage - instant, no async needed
      const planData = getStudyPlan(planId);
      
      if (!planData) {
        setError('Study plan not found in local storage');
        return;
      }

      setPlan(planData);

      // Load progress if user is logged in
      if (currentUser) {
        const progressData = getUserProgressForPlan(currentUser.uid, planId);
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error loading plan details:', err);
      setError('Failed to load plan details');
    }
  };

  const getVideoProgress = (videoId: string): VideoProgress | null => {
    return progress?.videoProgress?.[videoId] || null;
  };

  const getLessonCompletion = (lessonId: string): LessonCompletion | null => {
    return progress?.lessonCompletions?.[lessonId] || null;
  };

  const isVideoWatched = (videoId: string): boolean => {
    const videoProgress = getVideoProgress(videoId);
    return videoProgress?.isCompleted === true;
  };

  const isLessonPracticed = (lessonId: string): boolean => {
    const completion = getLessonCompletion(lessonId);
    return completion?.practicedConfirmed === true;
  };

  const getLessonRating = (lessonId: string): number | null => {
    const completion = getLessonCompletion(lessonId);
    return completion?.difficultyRating || null;
  };

  const getLessonRatingLabel = (lessonId: string): string | null => {
    const completion = getLessonCompletion(lessonId);
    return completion?.difficultyLabel || null;
  };

  const getVideoWatchProgress = (videoId: string): number => {
    const videoProgress = getVideoProgress(videoId);
    if (!videoProgress) return 0;
    if (videoProgress.totalSeconds === 0) return 0;
    return Math.round((videoProgress.watchedSeconds / videoProgress.totalSeconds) * 100);
  };

  const handleExportToJSON = async () => {
    if (!plan) return;

    try {
      // Clean the plan data by removing local-only metadata
      const exportData = {
        ...plan,
        _syncStatus: undefined,
        _lastSyncedAt: undefined
      };

      // Remove undefined properties
      const cleanedData = JSON.parse(JSON.stringify(exportData));

      // Convert to formatted JSON string
      const jsonString = JSON.stringify(cleanedData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a safe filename from the plan ID
      const sanitizedFilename = `${plan.id}.json`;

      // Try to use File System Access API for native "Save As" dialog
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: sanitizedFilename,
            types: [{
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          // Success - no alert needed for native dialog
          return;
        } catch (err: any) {
          // User cancelled the dialog or API failed
          if (err.name === 'AbortError') {
            return; // User cancelled, no error needed
          }
          // Fall through to fallback method
          console.warn('File System Access API failed, using fallback:', err);
        }
      }

      // Fallback: Standard download for browsers without File System Access API
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting study plan:', err);
      setError('Failed to export study plan');
    }
  };

  if (error || !plan) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'Study plan not found'}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/plans')} sx={{ mt: 2 }}>
            Back to Study Plans
          </Button>
        </Box>
      </Container>
    );
  }

  const totalLessons = plan.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const totalVideos = plan.chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.videos.length, 0),
    0
  );

  const completedVideos = plan.chapters.reduce((sum, chapter) =>
    sum + chapter.lessons.reduce((lessonSum, lesson) =>
      lessonSum + lesson.videos.filter(video => isVideoWatched(video.id)).length, 0
    ), 0
  );

  const practicedLessons = plan.chapters.reduce((sum, chapter) =>
    sum + chapter.lessons.filter(lesson => isLessonPracticed(lesson.id)).length, 0
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, pt: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/plans')}
          >
            Back to Study Plans
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToJSON}
            color="primary"
          >
            Export to JSON
          </Button>
        </Box>

        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            color: 'text.primary'
          }}
        >
          {plan.name}
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          {plan.subjectName} • {plan.examBoardId}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {plan.description}
        </Typography>

        {/* Progress Summary */}
        {progress && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Progress
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Videos Watched: {completedVideos} / {totalVideos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Lessons Practiced: {practicedLessons} / {totalLessons}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalLessons > 0 ? Math.round((practicedLessons / totalLessons) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalLessons > 0 ? (practicedLessons / totalLessons) * 100 : 0}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Stack>
          </Box>
        )}

        {!progress && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You haven't started this study plan yet. Progress will appear here once you begin watching videos and practicing lessons on the mobile app.
          </Alert>
        )}

        {/* Plan Structure */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Plan Structure
        </Typography>

        <Stack spacing={2}>
          {plan.chapters.map((chapter, chapterIndex) => (
            <Accordion key={chapter.id} defaultExpanded={chapterIndex === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6">
                    Chapter {chapterIndex + 1}: {chapter.name}
                  </Typography>
                  <Chip
                    label={`${chapter.lessons.length} lesson${chapter.lessons.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {chapter.description}
                </Typography>

                <Stack spacing={2}>
                  {chapter.lessons.map((lesson, lessonIndex) => {
                    const lessonCompletion = getLessonCompletion(lesson.id);
                    const completedVideosInLesson = lesson.videos.filter(video => isVideoWatched(video.id)).length;
                    const totalVideosInLesson = lesson.videos.length;

                    return (
                      <Accordion key={lesson.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="subtitle1">
                                {chapterIndex + 1}.{lessonIndex + 1} {lesson.name}
                              </Typography>
                              {isLessonPracticed(lesson.id) && (
                                <Chip
                                  icon={<FitnessCenterIcon />}
                                  label="Practiced"
                                  size="small"
                                  color="success"
                                />
                              )}
                              {getLessonRating(lesson.id) !== null && (
                                <Chip
                                  icon={<StarIcon />}
                                  label={`${getLessonRating(lesson.id)}/5`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="text.secondary">
                                {completedVideosInLesson} / {totalVideosInLesson} videos watched
                              </Typography>
                              {getLessonRatingLabel(lesson.id) && (
                                <Typography variant="caption" color="text.secondary">
                                  Rating: {getLessonRatingLabel(lesson.id)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {lesson.description}
                          </Typography>

                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Videos ({lesson.videos.length})
                          </Typography>
                          <Stack spacing={1}>
                            {lesson.videos.map((video) => {
                              const videoProgress = getVideoProgress(video.id);
                              const watched = isVideoWatched(video.id);
                              const watchProgress = getVideoWatchProgress(video.id);

                              return (
                                <Box
                                  key={video.id}
                                  sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: watched ? 'success.light' : 'background.paper'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    {watched ? (
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    ) : videoProgress ? (
                                      <PlayCircleIcon color="primary" fontSize="small" />
                                    ) : null}
                                    <Typography variant="body2" fontWeight={watched ? 'bold' : 'normal'}>
                                      {video.title}
                                    </Typography>
                                  </Box>
                                  {videoProgress && !watched && (
                                    <Box sx={{ mt: 1 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={watchProgress}
                                        sx={{ height: 4, borderRadius: 2 }}
                                      />
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        {watchProgress}% watched
                                      </Typography>
                                    </Box>
                                  )}
                                  {watched && (
                                    <Typography variant="caption" color="success.main">
                                      Completed
                                    </Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default PlanDetails;
