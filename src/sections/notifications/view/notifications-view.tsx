import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

// ----------------------------------------------------------------------

// Enhanced notification types
type NotificationType = 'assignment' | 'grade' | 'meeting' | 'payment' | 'course' | 'system' | 'application';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
  relatedUser?: string;
  relatedCourse?: string;
}

// Mock notifications for different user types
const getNotificationsForRole = (role: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: '1',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance will occur on Sunday from 2:00 AM to 4:00 AM',
      type: 'system',
      priority: 'medium',
      read: false,
      createdAt: new Date('2024-01-24T10:00:00'),
      actionUrl: '/system-status',
      actionText: 'View Details',
    },
  ];

  if (role === 'admin') {
    return [
      ...baseNotifications,
      {
        id: '2',
        title: 'New Course Application',
        message: 'John Doe has applied for Web Development Bootcamp',
        type: 'application',
        priority: 'high',
        read: false,
        createdAt: new Date('2024-01-24T09:30:00'),
        actionUrl: '/admin/applications',
        actionText: 'Review Application',
        relatedUser: 'John Doe',
        relatedCourse: 'Web Development Bootcamp',
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'Payment of $499 received from Jane Smith for Data Science course',
        type: 'payment',
        priority: 'medium',
        read: false,
        createdAt: new Date('2024-01-24T08:15:00'),
        relatedUser: 'Jane Smith',
        relatedCourse: 'Data Science Fundamentals',
      },
      {
        id: '4',
        title: 'High Application Volume',
        message: '50+ applications received in the last 24 hours',
        type: 'system',
        priority: 'high',
        read: true,
        createdAt: new Date('2024-01-23T16:00:00'),
        actionUrl: '/admin/analytics',
        actionText: 'View Analytics',
      },
      {
        id: '5',
        title: 'Instructor Request',
        message: 'Dr. Smith requested to create a new Advanced JavaScript course',
        type: 'course',
        priority: 'medium',
        read: true,
        createdAt: new Date('2024-01-23T14:30:00'),
        actionUrl: '/admin/courses',
        actionText: 'Review Request',
        relatedUser: 'Dr. Smith',
      },
    ];
  }

  if (role === 'instructor') {
    return [
      ...baseNotifications,
      {
        id: '6',
        title: 'Assignment Submitted',
        message: 'John Doe submitted Variables Assignment for Introduction to Programming',
        type: 'assignment',
        priority: 'high',
        read: false,
        createdAt: new Date('2024-01-24T11:20:00'),
        actionUrl: '/grading',
        actionText: 'Grade Assignment',
        relatedUser: 'John Doe',
        relatedCourse: 'Introduction to Programming',
      },
      {
        id: '7',
        title: 'Student Question',
        message: 'Sarah Wilson asked a question about React components',
        type: 'course',
        priority: 'medium',
        read: false,
        createdAt: new Date('2024-01-24T10:45:00'),
        actionUrl: '/course-room/2',
        actionText: 'Answer Question',
        relatedUser: 'Sarah Wilson',
        relatedCourse: 'Web Development Bootcamp',
      },
      {
        id: '8',
        title: 'Upcoming Class Reminder',
        message: 'Live coding session for Advanced JavaScript starts in 30 minutes',
        type: 'meeting',
        priority: 'high',
        read: true,
        createdAt: new Date('2024-01-24T09:30:00'),
        actionUrl: '/zoom-meeting',
        actionText: 'Join Meeting',
        relatedCourse: 'Advanced JavaScript',
      },
    ];
  }

  // Student notifications
  return [
    ...baseNotifications,
    {
      id: '9',
      title: 'Assignment Graded',
      message: 'Your Variables Assignment has been graded: A-',
      type: 'grade',
      priority: 'medium',
      read: false,
      createdAt: new Date('2024-01-24T12:00:00'),
      actionUrl: '/course-room/1',
      actionText: 'View Grade',
      relatedCourse: 'Introduction to Programming',
    },
    {
      id: '10',
      title: 'New Assignment Posted',
      message: 'Functions Assignment has been posted for Introduction to Programming',
      type: 'assignment',
      priority: 'high',
      read: false,
      createdAt: new Date('2024-01-24T10:30:00'),
      actionUrl: '/course-room/1',
      actionText: 'View Assignment',
      relatedCourse: 'Introduction to Programming',
    },
    {
      id: '11',
      title: 'Application Approved',
      message: 'Your application for Web Development Bootcamp has been approved!',
      type: 'application',
      priority: 'high',
      read: false,
      createdAt: new Date('2024-01-24T09:00:00'),
      actionUrl: '/payment/app_1',
      actionText: 'Make Payment',
      relatedCourse: 'Web Development Bootcamp',
    },
    {
      id: '12',
      title: 'Upcoming Zoom Session',
      message: 'Live coding session starts in 1 hour',
      type: 'meeting',
      priority: 'medium',
      read: true,
      createdAt: new Date('2024-01-24T08:00:00'),
      actionUrl: '/course-room/1',
      actionText: 'Join Session',
      relatedCourse: 'Introduction to Programming',
    },
  ];
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'assignment':
      return 'solar:pen-bold';
    case 'grade':
      return 'solar:eye-bold';
    case 'meeting':
      return 'solar:share-bold';
    case 'payment':
      return 'solar:cart-3-bold';
    case 'course':
      return 'solar:pen-bold';
    case 'application':
      return 'solar:clock-circle-outline';
    case 'system':
      return 'solar:restart-bold';
    default:
      return 'solar:pen-bold';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'assignment':
      return 'primary';
    case 'grade':
      return 'success';
    case 'meeting':
      return 'info';
    case 'payment':
      return 'success';
    case 'course':
      return 'primary';
    case 'application':
      return 'warning';
    case 'system':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
};

export function NotificationsView() {
  const theme = useTheme();
  const { user, hasRole } = useAuth();
  const [notifications, setNotifications] = useState(() => 
    getNotificationsForRole(user?.role || 'student')
  );
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationTypes: { value: NotificationType | 'all' | 'unread'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'grade', label: 'Grades' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'course', label: 'Courses' },
    ...(hasRole('admin') ? [
      { value: 'application' as NotificationType, label: 'Applications' },
      { value: 'payment' as NotificationType, label: 'Payments' },
    ] : []),
    { value: 'system', label: 'System' },
  ];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Premium Header */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
           {/* Background Mesh Gradient */}
           <Box sx={{
              position: 'absolute',
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              background: `radial-gradient(at 0% 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 100% 0%, ${alpha(theme.palette.primary.main, 0.9)} 0px, transparent 50%),
                           radial-gradient(at 100% 100%, ${alpha(theme.palette.info.main, 0.8)} 0px, transparent 50%),
                           radial-gradient(at 0% 100%, ${alpha(theme.palette.success.dark, 0.5)} 0px, transparent 50%),
                           linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)`, 
              zIndex: 0
           }} />

           <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
             <Box>
               <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, color: 'common.white', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                 Notifications
               </Typography>
               <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.8, fontWeight: 500 }}>
                 Stay updated with your latest activities
               </Typography>
             </Box>

             <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
               <Chip
                 label={user?.role ? user.role.toUpperCase() : 'USER'}
                 variant="filled"
                 sx={{ fontWeight: 800, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
               />
               <Chip
                 label={`${unreadCount} Unread`}
                 color={unreadCount > 0 ? 'error' : 'default'}
                 variant="filled"
                 sx={{ fontWeight: 800, boxShadow: theme.shadows[4] }}
               />
               <Button
                  variant="contained"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  startIcon={<Iconify icon="solar:check-read-bold" />}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    bgcolor: 'white',
                    color: 'primary.main',
                    border: '1px solid transparent',
                    boxShadow: theme.shadows[4],
                    '&:hover': { bgcolor: 'grey.100', borderColor: 'white' },
                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)' }
                  }}
                >
                  Mark all as read
                </Button>
             </Box>
           </Box>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {notificationTypes.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                onClick={() => setFilter(type.value as any)}
                color={filter === type.value ? 'primary' : 'default'}
                variant={filter === type.value ? 'filled' : 'outlined'}
                clickable
                sx={{
                  fontWeight: 800,
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  ...(filter === type.value
                    ? {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                        transform: 'translateY(-2px)',
                      }
                    : {
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '&:hover': { bgcolor: alpha(theme.palette.background.paper, 1), transform: 'translateY(-1px)' }
                      }),
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Iconify 
                  icon="solar:pen-bold" 
                  width={64} 
                  color="text.disabled" 
                  sx={{ mb: 2 }} 
                />
                <Typography variant="h6" color="text.secondary">
                  No notifications found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications." 
                    : `No ${filter} notifications at the moment.`
                  }
                </Typography>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                sx={{
                  position: 'relative',
                  overflow: 'visible',
                  ...premiumGlass(theme),
                  bgcolor: notification.read
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.primary.main, 0.04), // Subtle tint for unread
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[16],
                    zIndex: 1
                  },
                }}
              >
                {!notification.read && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 6,
                      background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `4px 0 12px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    {/* Icon */}
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, ${(theme.palette as any)[getNotificationColor(notification.type)].main}, ${(theme.palette as any)[getNotificationColor(notification.type)].dark})`,
                            width: 56,
                            height: 56,
                            boxShadow: `0 8px 16px ${alpha((theme.palette as any)[getNotificationColor(notification.type)].main, 0.4)}`,
                            border: '2px solid white'
                          }}
                        >
                          <Iconify 
                            icon={getNotificationIcon(notification.type)} 
                            width={28}
                            color="white"
                          />
                        </Avatar>
                        {!notification.read && (
                             <Box sx={{ 
                                 position: 'absolute', 
                                 top: 0, 
                                 right: 0, 
                                 width: 14, 
                                 height: 14, 
                                 bgcolor: 'error.main', 
                                 borderRadius: '50%', 
                                 border: '2px solid white' 
                             }} />
                        )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: notification.read ? 700 : 900, lineHeight: 1.3 }}>
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                             {notification.priority === 'high' && (
                                <Chip
                                    label="HIGH PRIORITY"
                                    size="small"
                                    color="error"
                                    sx={{ fontWeight: 800, borderRadius: 1, height: 24, fontSize: '0.7rem' }}
                                />
                             )}
                             <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                <Iconify icon="solar:clock-circle-outline" width={14} sx={{ mr: 0.5 }} />
                                {notification.createdAt.toLocaleDateString()}
                             </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 2, lineHeight: 1.6 }}>
                        {notification.message}
                      </Typography>

                      {/* Related Info */}
                      {(notification.relatedUser || notification.relatedCourse) && (
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.08), width: 'fit-content' }}>
                          {notification.relatedUser && (
                            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                              <Iconify icon="solar:user-bold-duotone" width={16} sx={{ mr: 0.5, color: 'primary.main' }} /> {notification.relatedUser}
                            </Typography>
                          )}
                          {notification.relatedCourse && (
                            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                               <Iconify icon="solar:book-bold-duotone" width={16} sx={{ mr: 0.5, color: 'secondary.main' }} /> {notification.relatedCourse}
                            </Typography>
                          )}
                        </Box>
                      )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {notification.actionUrl && (
                              <Button
                                variant="contained"
                                size="small"
                                href={notification.actionUrl}
                                startIcon={<Iconify icon="solar:eye-bold" />}
                                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 30, px: 2, boxShadow: theme.shadows[4] }}
                              >
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleMarkAsRead(notification.id)}
                                startIcon={<Iconify icon="solar:check-read-bold" />}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 30 }}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </Box>
                          <Button
                            variant="text"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteNotification(notification.id)}
                            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 30, opacity: 0.7, '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            Delete
                          </Button>
                        </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Container>
    </DashboardContent>
  );
}
