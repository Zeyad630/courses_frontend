import type { ApexOptions } from 'apexcharts';
import type { User, UserRole } from 'src/types/user';

import Chart from 'react-apexcharts';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@school.com',
    role: 'student',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    avatar: '/assets/images/avatar/avatar-1.webp',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@school.com',
    role: 'instructor',
    isActive: true,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15'),
    avatar: '/assets/images/avatar/avatar-2.webp',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@school.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2023-11-20'),
    avatar: '/assets/images/avatar/avatar-3.webp',
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike.johnson@school.com',
    role: 'student',
    isActive: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    avatar: '/assets/images/avatar/avatar-4.webp',
  },
];

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'instructor':
      return 'warning';
    case 'student':
    default:
      return 'info';
  }
};

export function AdminUsersView() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as UserRole });
  const [query, setQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const t = setTimeout(() => {
      if (!active) return;
      setIsLoading(false);
    }, 250);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = u.name?.toLowerCase() ?? '';
      const email = u.email?.toLowerCase() ?? '';
      const role = u.role?.toLowerCase() ?? '';
      return name.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [query, users]);

  const openCreateDialog = useCallback(() => {
    setEditingUserId(null);
    setNewUser({ name: '', email: '', role: 'student' });
    setOpenDialog(true);
  }, []);

  const openEditDialog = useCallback(
    (user: User) => {
      setEditingUserId(String(user.id));
      setNewUser({ name: user.name ?? '', email: user.email ?? '', role: user.role ?? 'student' });
      setOpenDialog(true);
    },
    []
  );

  const handleDeleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => String(u.id) !== id));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingUserId(null);
    setNewUser({ name: '', email: '', role: 'student' });
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  }, []);

  const handleSaveUser = useCallback(() => {
    const name = newUser.name.trim();
    const email = newUser.email.trim();

    if (!name || !email) {
      setError('Please provide name and email.');
      return;
    }

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === editingUserId
            ? {
                ...u,
                name,
                email,
                role: newUser.role,
                updatedAt: new Date(),
              }
            : u
        )
      );
    } else {
      const user: User = {
        id: `new_${Date.now()}`,
        name,
        email,
        role: newUser.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: `/assets/images/avatar/avatar-${Math.floor(Math.random() * 20) + 1}.webp`,
      };
      setUsers((prev) => [user, ...prev]);
    }

    setError(null);
    handleCloseDialog();
  }, [editingUserId, handleCloseDialog, newUser.email, newUser.name, newUser.role]);

  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
    },
    tooltip: {
      theme: theme.palette.mode,
    },
  };

  const chartSeries = [
    {
      name: 'New Users',
      data: [12, 19, 3, 5, 2, 3],
    },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'primary.main',
      bgcolor: 'primary.lighter',
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.isActive).length,
      icon: 'solar:user-check-bold-duotone',
      color: 'success.main',
      bgcolor: 'success.lighter',
    },
    {
      title: 'Instructors',
      value: users.filter(u => u.role === 'instructor').length,
      icon: 'solar:user-id-bold-duotone',
      color: 'warning.main',
      bgcolor: 'warning.lighter',
    },
    {
      title: 'Students',
      value: users.filter(u => u.role === 'student').length,
      icon: 'solar:backpack-bold-duotone',
      color: 'info.main',
      bgcolor: 'info.lighter',
    },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {error && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ mb: 3 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Loading users...
              </Typography>
            </Card>
          </Box>
        )}

        <Box
          sx={{
            mb: 5,
            p: 3,
            borderRadius: 3,
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: alpha(theme.palette.info.main, 0.06),
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.12),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.14),
                color: 'info.main',
              }}
            >
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Users Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage users, roles, and access.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:user-plus-bold-duotone" />}
            onClick={openCreateDialog}
          >
            New User
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 260px' } }}>
          <TextField
            label="Search users"
            placeholder="Search by name, email, or role"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" color="inherit" onClick={() => setQuery('')} sx={{ fontWeight: 800 }}>
            Clear
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, mb: 5 }}>
          {stats.map((stat, index) => (
            <Card key={index} sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h3">
                  {stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: stat.bgcolor,
                  color: stat.color,
                }}
              >
                <Iconify icon={stat.icon} width={24} />
              </Box>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, mb: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>User Growth</Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={320}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Role Distribution</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { label: 'Students', value: 75, color: 'info' },
                  { label: 'Instructors', value: 15, color: 'warning' },
                  { label: 'Admins', value: 10, color: 'error' },
                ].map((role) => (
                  <Box key={role.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{role.value}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, bgcolor: 'background.neutral', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ width: `${role.value}%`, height: '100%', bgcolor: `${role.color}.main` }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.avatar} alt={user.name} />
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.toUpperCase()}
                          color={getRoleColor(user.role)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Button size="small" color="inherit" onClick={() => openEditDialog(user)}>
                          <Iconify icon="solar:pen-bold-duotone" />
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteUser(String(user.id))}>
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {editingUserId ? 'Edit User' : 'Add New User'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Name" 
                fullWidth 
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <TextField 
                label="Email" 
                fullWidth 
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <TextField
                select
                label="Role"
                fullWidth
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                SelectProps={{ native: true }}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </TextField>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveUser}>
                  {editingUserId ? 'Save' : 'Add User'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
