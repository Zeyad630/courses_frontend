import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { user, hasRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate about learning and technology.',
    location: 'New York, USA',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
  });

  const handleSave = useCallback(() => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // TODO: Implement profile update API call
  }, [formData]);

  const handleCancel = useCallback(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      bio: 'Passionate about learning and technology.',
      location: 'New York, USA',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
    });
    setIsEditing(false);
  }, [user]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Mock stats based on user role
  const getStatsForRole = () => {
    if (hasRole('admin')) {
      return [
        { label: 'Total Users', value: '1,234', icon: 'solar:pen-bold', color: 'primary' },
        { label: 'Active Courses', value: '45', icon: 'solar:eye-bold', color: 'success' },
        { label: 'Monthly Revenue', value: '$12,500', icon: 'solar:cart-3-bold', color: 'warning' },
        { label: 'System Uptime', value: '99.9%', icon: 'solar:restart-bold', color: 'info' },
      ];
    }
    
    if (hasRole('instructor')) {
      return [
        { label: 'Students Taught', value: '156', icon: 'solar:pen-bold', color: 'primary' },
        { label: 'Courses Created', value: '8', icon: 'solar:eye-bold', color: 'success' },
        { label: 'Avg. Rating', value: '4.8⭐', icon: 'solar:share-bold', color: 'warning' },
        { label: 'Hours Taught', value: '240h', icon: 'solar:clock-circle-outline', color: 'info' },
      ];
    }

    // Student stats
    return [
      { label: 'Courses Enrolled', value: '3', icon: 'solar:pen-bold', color: 'primary' },
      { label: 'Assignments Done', value: '24', icon: 'solar:eye-bold', color: 'success' },
      { label: 'Average Grade', value: 'B+', icon: 'solar:share-bold', color: 'warning' },
      { label: 'Study Hours', value: '120h', icon: 'solar:clock-circle-outline', color: 'info' },
    ];
  };

  const stats = getStatsForRole();

  return (
    <DashboardContent>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4">Profile Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage your account information and preferences
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Profile Card */}
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {formData.name}
              </Typography>
              
              <Chip
                label={user?.role?.toUpperCase()}
                color="primary"
                variant="filled"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {formData.bio}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:share-bold" />}
                  href={formData.linkedin}
                  target="_blank"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  href={formData.github}
                  target="_blank"
                >
                  GitHub
                </Button>
              </Box>

              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                fullWidth
                startIcon={<Iconify icon={isEditing ? 'solar:pen-bold' : 'solar:pen-bold'} />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Box>
            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Iconify 
                      icon={stat.icon as any} 
                      width={32} 
                      color={`${stat.color}.main`} 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="h5" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Profile Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <TextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <TextField
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <TextField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <TextField
                    label="Website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    sx={{ gridColumn: { sm: 'span 2' } }}
                  />
                  
                  <TextField
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    fullWidth
                    sx={{ gridColumn: { sm: 'span 2' } }}
                  />
                </Box>

                {isEditing && (
                  <CardActions sx={{ justifyContent: 'flex-end', mt: 3, px: 0 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<Iconify icon="solar:pen-bold" />}
                    >
                      Save Changes
                    </Button>
                  </CardActions>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Social Links
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                  <TextField
                    label="LinkedIn Profile"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <Iconify icon="solar:share-bold" sx={{ mr: 1 }} />,
                    }}
                  />
                  
                  <TextField
                    label="GitHub Profile"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Change Password
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Iconify icon="solar:clock-circle-outline" />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Notification Settings
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Deactivate Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </DashboardContent>
  );
}
