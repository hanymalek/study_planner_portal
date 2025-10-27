import React, { useEffect, useState } from 'react';
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
import { getAllStudyPlans, batchSaveStudyPlans } from '../services/api';
import { useLocalEdits } from '../hooks/useLocalStorage';
import type { StudyPlan, Difficulty } from '../types';
import StudyPlanCard from '../components/StudyPlanCard';
import JsonImportDialog from '../components/JsonImportDialog';
import toast from 'react-hot-toast';

const StudyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { hasUnsavedChanges, getAllEdits, clearEdits, editCount, hasEdit, addEdit } = useLocalEdits();
  
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchQuery, difficultyFilter]);

  const loadPlans = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Try to load from cache first
      if (!forceRefresh) {
        const cachedPlans = localStorage.getItem('cached_study_plans');
        const cacheTimestamp = localStorage.getItem('cached_study_plans_timestamp');
        
        if (cachedPlans && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
          
          if (cacheAge < CACHE_DURATION) {
            // Use cached data
            const parsedPlans = JSON.parse(cachedPlans);
            setPlans(parsedPlans);
            setLoading(false);
            console.log(`Loaded ${parsedPlans.length} plans from cache (${Math.round(cacheAge / 1000)}s old)`);
            return;
          }
        }
      }
      
      // Fetch from Firebase
      const fetchedPlans = await getAllStudyPlans();
      
      // Cache the results
      localStorage.setItem('cached_study_plans', JSON.stringify(fetchedPlans));
      localStorage.setItem('cached_study_plans_timestamp', Date.now().toString());
      
      setPlans(fetchedPlans);
      toast.success(`Loaded ${fetchedPlans.length} study plans from Firebase`);
    } catch (error) {
      console.error('Error loading plans:', error);
      
      // Try to use stale cache as fallback
      const cachedPlans = localStorage.getItem('cached_study_plans');
      if (cachedPlans) {
        const parsedPlans = JSON.parse(cachedPlans);
        setPlans(parsedPlans);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Study Plans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage curriculum structure for all subjects
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={syncing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
          onClick={handleSyncFromFirebase}
          disabled={syncing}
        >
          Sync from Firebase
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          onClick={handleUploadChanges}
          disabled={!hasUnsavedChanges || uploading}
        >
          Upload Changes {hasUnsavedChanges && `(${editCount})`}
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={() => setImportDialogOpen(true)}
        >
          Import JSON
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
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
              onDelete={() => {
                // TODO: Implement delete
                toast.error('Delete functionality coming soon');
              }}
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

