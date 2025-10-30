import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getAllUsers, updateUserRole } from '../services/api';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { User, UserRole } from '../types';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT' as UserRole);
  const [addingUser, setAddingUser] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React StrictMode
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async (syncWithFirebase = false) => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers(syncWithFirebase);
      setUsers(fetchedUsers);
      if (syncWithFirebase) {
        toast.success(`Synced ${fetchedUsers.length} users from Firebase`);
      } else {
        console.log(`Loaded ${fetchedUsers.length} users from local storage`);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setAddingUser(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserEmail,
        newUserPassword
      );

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        email: newUserEmail,
        displayName: newUserName,
        role: newUserRole,
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', newUser.id), newUser);

      // Add to local state
      setUsers([...users, newUser]);
      
      // Reset form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRole('STUDENT' as UserRole);
      setAddDialogOpen(false);
      
      toast.success(`User ${newUserEmail} created successfully`);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Failed to create user');
      }
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, selectedUser.role);
      
      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast.success('User role updated');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: Deleting from Firebase Auth requires admin SDK (backend)
      // For now, we'll just show a message
      toast.error('User deletion requires backend implementation');
      // TODO: Implement backend endpoint for user deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role: UserRole) => {
    return role === 'ADMIN' ? 'error' : 'primary';
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
      <Box sx={{ 
        mb: { xs: 2, sm: 4 },
        pt: { xs: 1, sm: 2 }
      }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          User Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Manage student and admin accounts
        </Typography>
      </Box>

      {/* Action Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => loadUsers(true)}
          size="small"
          sx={{ 
            minWidth: { xs: 'auto', sm: 'fit-content' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sync from Firebase</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Sync</Box>
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          size="small"
          sx={{ 
            minWidth: { xs: 'auto', sm: 'fit-content' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add User</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add User</Box>
        </Button>
      </Stack>

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={`Total Users: ${users.length}`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`Students: ${users.filter(u => u.role === 'STUDENT').length}`} 
            color="primary"
            size="small"
          />
          <Chip 
            label={`Admins: ${users.filter(u => u.role === 'ADMIN').length}`} 
            color="error"
            size="small"
          />
        </Stack>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'table-cell', sm: 'table-cell' } }}>Name</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Active Schedule</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {searchQuery ? 'No users match your search' : 'No users yet. Click "Add User" to create one.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{user.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={getRoleColor(user.role)}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {user.activeScheduleId ? (
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="None" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}
                        title="Edit role"
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete user"
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              The user will receive their credentials via email and can log in immediately.
            </Alert>
            
            <TextField
              label="Full Name"
              fullWidth
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g., John Doe"
            />
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="e.g., john@example.com"
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="At least 6 characters"
              helperText="User can change this after first login"
            />
            
            <TextField
              select
              label="Role"
              fullWidth
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
            disabled={addingUser}
          >
            {addingUser ? <CircularProgress size={24} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Name"
                fullWidth
                value={selectedUser.displayName}
                disabled
              />
              
              <TextField
                label="Email"
                fullWidth
                value={selectedUser.email}
                disabled
              />
              
              <TextField
                select
                label="Role"
                fullWidth
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditRole} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;

