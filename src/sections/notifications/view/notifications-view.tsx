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
              opacity: 0.9,
              background: `radial-gradient(1200px circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, transparent 60%), radial-gradient(900px circle at 100% 10%, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 55%)`,
              pointerEvents: 'none',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stay updated with your latest activities
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={user?.role ? user.role.toUpperCase() : 'USER'}
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={`${unreadCount} Unread`}
                  color={unreadCount > 0 ? 'error' : 'default'}
                  variant={unreadCount > 0 ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 800 }}
                />
                <Button
                  variant={unreadCount > 0 ? 'contained' : 'outlined'}
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  startIcon={<Iconify icon="eva:done-all-fill" />}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: 'none',
                    borderRadius: 1.5,
                  }}
                >
                  Mark all as read
                </Button>
              </Box>
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
                  ...(filter === type.value
                    ? {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
                      }
                    : {
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
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
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${notification.read ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.primary.main, 0.28)}`,
                  bgcolor: notification.read
                    ? alpha(theme.palette.background.paper, 0.7)
                    : alpha(theme.palette.primary.main, 0.06),
                  backdropFilter: 'blur(10px)',
                  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                    borderColor: notification.read
                      ? alpha(theme.palette.divider, 0.2)
                      : alpha(theme.palette.primary.main, 0.4),
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
                      width: 4,
                      bgcolor: 'primary.main',
                      boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0.12)}`,
                    }}
                  />
                )}

                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon */}
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type)}.main`,
                        width: 48,
                        height: 48,
                        boxShadow: theme.shadows[3],
                      }}
                    >
                      <Iconify 
                        icon={getNotificationIcon(notification.type)} 
                        width={24}
                        color="white"
                      />
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: notification.read ? 700 : 900 }}>
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority)}
                            variant={notification.read ? 'outlined' : 'filled'}
                            sx={{ fontWeight: 800 }}
                          />
                          <Chip
                            label={notification.type}
                            size="small"
                            color={getNotificationColor(notification.type)}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body1" color="text.secondary" paragraph>
                        {notification.message}
                      </Typography>

                      {/* Related Info */}
                      {(notification.relatedUser || notification.relatedCourse) && (
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          {notification.relatedUser && (
                            <Typography variant="caption" color="text.disabled">
                              User: {notification.relatedUser}
                            </Typography>
                          )}
                          {notification.relatedCourse && (
                            <Typography variant="caption" color="text.disabled">
                              Course: {notification.relatedCourse}
                            </Typography>
                          )}
                        </Box>
                      )}

                      <Typography variant="caption" color="text.disabled">
                        {notification.createdAt.toLocaleDateString()} at {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {notification.actionUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        href={notification.actionUrl}
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                      >
                        {notification.actionText || 'View'}
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
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
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 1.5 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      </Container>
    </DashboardContent>
  );
}
