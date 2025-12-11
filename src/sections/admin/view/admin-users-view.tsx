import type { ApexOptions } from 'apexcharts';
import type { User, UserRole } from 'src/types/user';

import { useState } from 'react';
import Chart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
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
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as UserRole });

  const handleAddUser = () => {
    const user: User = {
      id: `new_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: `/assets/images/avatar/avatar-${Math.floor(Math.random() * 20) + 1}.webp`,
    };
    setUsers([...users, user]);
    setOpenDialog(false);
    setNewUser({ name: '', email: '', role: 'student' });
  };

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
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">Users Management</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Manage system users, roles, and permissions.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:user-plus-bold-duotone" />}
            onClick={() => setOpenDialog(true)}
          >
            New User
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

        <Card>
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
                {users.map((user) => (
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
                    <TableCell>
                      {user.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" color="inherit">
                        <Iconify icon="solar:pen-bold-duotone" />
                      </Button>
                      <Button size="small" color="error">
                        <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Add New User</Typography>
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
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleAddUser}>Add User</Button>
              </Box>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
