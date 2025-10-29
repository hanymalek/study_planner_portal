import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { getAllStudyPlans, batchSaveStudyPlans, deleteStudyPlan } from '../services/api';
import { useLocalEdits } from '../hooks/useLocalStorage';
import type { StudyPlan, Difficulty } from '../types';
import StudyPlanCard from '../components/StudyPlanCard';
import JsonImportDialog from '../components/JsonImportDialog';
import toast from 'react-hot-toast';

const StudyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { hasUnsavedChanges, getAllEdits, clearEdits, editCount, hasEdit, addEdit, removeEdit } = useLocalEdits();
  
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React StrictMode
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    filterPlans();
  }, [plans, searchQuery, difficultyFilter]);

    // Helper function to merge Firebase plans with local edits
    const mergePlansWithLocalEdits = (firebasePlans: StudyPlan[]): StudyPlan[] => {
      const localEditsData = getAllEdits() as StudyPlan[];
      
      // Create a map of Firebase plans by ID
      const planMap = new Map<string, StudyPlan>();
      firebasePlans.forEach(plan => planMap.set(plan.id, plan));
      
      // Add or update with local edits
      localEditsData.forEach(editedPlan => {
        planMap.set(editedPlan.id, editedPlan);
      });
      
      return Array.from(planMap.values());
    };

    const loadPlans = async (forceRefresh = false) => {
      setLoading(true);
      try {
        let fetchedPlans: StudyPlan[] = [];
        
        // Try to load from cache first
        if (!forceRefresh) {
          const cachedPlans = localStorage.getItem('cached_study_plans');
          const cacheTimestamp = localStorage.getItem('cached_study_plans_timestamp');
          
          if (cachedPlans && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
            
            if (cacheAge < CACHE_DURATION) {
              // Use cached data
              fetchedPlans = JSON.parse(cachedPlans);
              const ageInSeconds = Math.round(cacheAge / 1000);
              console.log(`Loaded ${fetchedPlans.length} plans from cache (${ageInSeconds}s old)`);
              
              // Merge with local edits
              const mergedPlans = mergePlansWithLocalEdits(fetchedPlans);
              setPlans(mergedPlans);
              setLoading(false);
              toast.success(`Loaded ${mergedPlans.length} study plans from cache (${ageInSeconds}s old)`);
              return;
            }
          }
        }
        
        // Fetch from Firebase
        fetchedPlans = await getAllStudyPlans();
        
        // Cache the results
        localStorage.setItem('cached_study_plans', JSON.stringify(fetchedPlans));
        localStorage.setItem('cached_study_plans_timestamp', Date.now().toString());
        
        // Merge with local edits
        const mergedPlans = mergePlansWithLocalEdits(fetchedPlans);
        setPlans(mergedPlans);
        toast.success(`Loaded ${mergedPlans.length} study plans from Firebase`);
      } catch (error) {
        console.error('Error loading plans:', error);
        
        // Try to use stale cache as fallback
        const cachedPlans = localStorage.getItem('cached_study_plans');
        if (cachedPlans) {
          const parsedPlans = JSON.parse(cachedPlans);
          const mergedPlans = mergePlansWithLocalEdits(parsedPlans);
          setPlans(mergedPlans);
          toast.error('Failed to load from Firebase. Using cached data.');
        } else {
          toast.error('Failed to load study plans');
        }
      } finally {
        setLoading(false);
      }
    };

  const filterPlans = () => {
    let filtered = [...plans];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          plan.subjectName.toLowerCase().includes(query) ||
          plan.examBoardId.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'ALL') {
      filtered = filtered.filter((plan) => plan.difficulty === difficultyFilter);
    }

    setFilteredPlans(filtered);
  };

  const handleSyncFromFirebase = async () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        `You have ${editCount} unsaved changes. Syncing will discard them. Continue?`
      );
      if (!confirm) return;
      clearEdits();
    }

    setSyncing(true);
    try {
      await loadPlans(true); // Force refresh from Firebase
      toast.success('Synced successfully from Firebase');
    } catch (error) {
      toast.error('Failed to sync from Firebase');
    } finally {
      setSyncing(false);
    }
  };

  const handleUploadChanges = async () => {
    if (!hasUnsavedChanges) {
      toast.error('No changes to upload');
      return;
    }

    const confirm = window.confirm(
      `Upload ${editCount} changes to Firebase? This will update the study plans for all students.`
    );
    if (!confirm) return;

    setUploading(true);
    try {
      const edits = getAllEdits();
      await batchSaveStudyPlans(edits);
      clearEdits();
      
      // Invalidate cache and reload from Firebase
      localStorage.removeItem('cached_study_plans');
      localStorage.removeItem('cached_study_plans_timestamp');
      await loadPlans(true);
      
      toast.success(`Successfully uploaded ${edits.length} study plans`);
    } catch (error) {
      console.error('Error uploading changes:', error);
      toast.error('Failed to upload changes');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/plans/new');
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/plans/${planId}/edit`);
  };

  const handleImportSuccess = (importedPlans: StudyPlan[]) => {
    // Add imported plans to local edits (they need to be uploaded)
    importedPlans.forEach(plan => {
      addEdit(plan.id, plan);
    });
    setPlans((prev) => [...prev, ...importedPlans]);
    toast.success(`Imported ${importedPlans.length} study plans locally. Click "Upload Changes" to save to Firebase.`);
  };

  const handleDeletePlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Check if this plan exists in Firebase by checking the cache
    const cachedPlans = localStorage.getItem('cached_study_plans');
    const firebasePlans = cachedPlans ? JSON.parse(cachedPlans) : [];
    const existsInFirebase = firebasePlans.some((p: StudyPlan) => p.id === planId);
    const isLocalOnly = !existsInFirebase && hasEdit(planId);

    const confirm = window.confirm(
      isLocalOnly
        ? `Are you sure you want to delete "${plan.name}"?\n\nThis plan has not been uploaded to Firebase yet. It will be permanently removed from your local edits.`
        : `Are you sure you want to delete "${plan.name}"?\n\nThis will mark the plan as deleted and hide it from students. This action can be undone by an admin if needed.`
    );
    if (!confirm) return;

    try {
      if (isLocalOnly) {
        // Plan only exists locally - just remove from local edits
        removeEdit(planId);
        setPlans(prev => prev.filter(p => p.id !== planId));
        toast.success(`Removed "${plan.name}" from local edits`);
      } else {
        // Plan exists in Firebase - soft delete it
        await deleteStudyPlan(planId);
        
        // Remove from local state
        setPlans(prev => prev.filter(p => p.id !== planId));
        
        // Also remove from local edits if it was being edited
        if (hasEdit(planId)) {
          removeEdit(planId);
        }
        
        // Invalidate cache
        localStorage.removeItem('cached_study_plans');
        localStorage.removeItem('cached_study_plans_timestamp');
        
        toast.success(`Successfully deleted "${plan.name}" from Firebase`);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete study plan');
    }
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
      <Box sx={{ 
        mb: 4,
        pt: { xs: 1, sm: 2 }
      }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            color: 'text.primary'
          }}
        >
          Study Plans
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage curriculum structure for all subjects
        </Typography>
      </Box>

            {/* Action Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ 
                mb: 3,
                flexWrap: 'wrap'
              }}
            >
              <Button
                variant="outlined"
                startIcon={syncing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                onClick={handleSyncFromFirebase}
                disabled={syncing}
                size="small"
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: 'fit-content' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sync from Firebase</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Sync</Box>
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                onClick={handleUploadChanges}
                disabled={!hasUnsavedChanges || uploading}
                size="small"
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: 'fit-content' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Upload Changes {hasUnsavedChanges && `(${editCount})`}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Upload {hasUnsavedChanges && `(${editCount})`}
                </Box>
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
                size="small"
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: 'fit-content' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Import JSON</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Import</Box>
              </Button>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                size="small"
                sx={{ 
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: 'fit-content' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                New Plan
              </Button>
            </Stack>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {editCount} unsaved changes. Remember to upload them to Firebase.
        </Alert>
      )}

      {/* Search and Filter */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, subject, or exam board..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={difficultyFilter}
            label="Difficulty"
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Levels</MenuItem>
            <MenuItem value="BEGINNER">Beginner</MenuItem>
            <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
            <MenuItem value="ADVANCED">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredPlans.length} of {plans.length} study plans
        </Typography>
      </Box>

      {/* Study Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery || difficultyFilter !== 'ALL'
              ? 'No study plans match your filters'
              : 'No study plans yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || difficultyFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Create your first study plan or import from JSON'}
          </Typography>
          {!searchQuery && difficultyFilter === 'ALL' && (
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
                Create New Plan
              </Button>
              <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setImportDialogOpen(true)}>
                Import JSON
              </Button>
            </Stack>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {filteredPlans.map((plan) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => handleEditPlan(plan.id)}
              onDelete={() => handleDeletePlan(plan.id)}
              hasUnsavedChanges={hasEdit(plan.id)}
            />
          ))}
        </Box>
      )}

      {/* JSON Import Dialog */}
      <JsonImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </Container>
  );
};

export default StudyPlans;

