import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { getAllStudyPlans, getAllUsers } from '../services/api';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography color="text.secondary" variant="body2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: color,
          borderRadius: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalUsers: 0,
    activeStudents: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load from local storage (no Firebase call)
      const [plans, users] = await Promise.all([
        getAllStudyPlans(false),
        getAllUsers(false)
      ]);

      setStats({
        totalPlans: plans.length,
        totalUsers: users.length,
        activeStudents: users.filter(u => u.role === 'STUDENT').length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Overview of your study planner system
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StatCard
            title="Total Study Plans"
            value={stats.totalPlans}
            icon={<MenuBookIcon sx={{ color: 'white', fontSize: 40 }} />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ color: 'white', fontSize: 40 }} />}
            color="#2e7d32"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 40 }} />}
            color="#ed6c02"
          />
        </Box>
      </Stack>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the sidebar to navigate to different sections:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Study Plans:</strong> Create, edit, and manage study plans
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Users:</strong> Manage user accounts and roles
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Analytics:</strong> View student progress and statistics
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;

