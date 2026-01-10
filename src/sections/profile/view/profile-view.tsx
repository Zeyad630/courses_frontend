import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileView() {
  const theme = useTheme();
  const { user, hasRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 250);
  }, []);

  const handleSave = useCallback(() => {
    setError(null);
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      // TODO: Implement profile update API call
    }, 450);
  }, [formData]);

  const handleCancel = useCallback(() => {
    setError(null);
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
                Loading profile...
              </Typography>
            </Card>
          </Box>
        )}

        {/* Header */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            boxShadow: theme.shadows[2],
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.95,
              background: `radial-gradient(1100px circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 60%), radial-gradient(900px circle at 100% 20%, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 55%)`,
              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account information and preferences
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={user?.role ? user.role.toUpperCase() : 'USER'}
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                startIcon={<Iconify icon={isEditing ? 'solar:close-circle-bold-duotone' : 'solar:pen-new-square-bold-duotone'} />}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading || isSaving}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                }}
              >
                {isEditing ? 'Cancel editing' : 'Edit profile'}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Profile Card */}
          <Card
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                height: 120,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
              }}
            />

            <CardContent sx={{ textAlign: 'center', pt: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-56px', mb: 1.5 }}>
                <Box
                  sx={{
                    p: 0.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    boxShadow: theme.shadows[6],
                  }}
                >
                  <Avatar
                    sx={{
                      width: 112,
                      height: 112,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      fontWeight: 900,
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </Box>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {formData.name}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {formData.email}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={user?.role?.toUpperCase()}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  icon={<Iconify icon="solar:map-point-bold-duotone" width={18} />}
                  label={formData.location}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
                {formData.bio}
              </Typography>

              <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:link-bold-duotone" />}
                  href={formData.website}
                  target="_blank"
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                >
                  Website
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:share-bold" />}
                  href={formData.linkedin}
                  target="_blank"
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:code-bold-duotone" />}
                  href={formData.github}
                  target="_blank"
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                >
                  GitHub
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Box>
            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(10px)',
                    transition: theme.transitions.create(['transform', 'box-shadow'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[6] },
                  }}
                >
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
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
              }}
            >
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
                      disabled={isSaving}
                      sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<Iconify icon="solar:pen-bold" />}
                      disabled={isSaving}
                      sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5, boxShadow: 'none' }}
                    >
                      {isSaving ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </CardActions>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card
              sx={{
                mt: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
              }}
            >
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
            <Card
              sx={{
                mt: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
              }}
            >
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
