import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

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

export type NotificationsPopoverProps = IconButtonProps;

// Mock notifications for different user types (same as notifications page)
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
    ];
  }

  if (role === 'student') {
    return [
      ...baseNotifications,
      {
        id: '4',
        title: 'Assignment Due Soon',
        message: 'Python Variables assignment is due tomorrow at 11:59 PM',
        type: 'assignment',
        priority: 'high',
        read: false,
        createdAt: new Date('2024-01-24T09:00:00'),
        actionUrl: '/course-room/1',
        actionText: 'Submit Assignment',
        relatedCourse: 'Introduction to Programming',
      },
      {
        id: '5',
        title: 'Grade Posted',
        message: 'Your grade for HTML/CSS Project has been posted: A-',
        type: 'grade',
        priority: 'medium',
        read: false,
        createdAt: new Date('2024-01-24T08:30:00'),
        actionUrl: '/my-courses',
        actionText: 'View Grade',
        relatedCourse: 'Web Development Bootcamp',
      },
    ];
  }

  if (role === 'instructor') {
    return [
      ...baseNotifications,
      {
        id: '6',
        title: 'Assignment Submitted',
        message: '5 new assignment submissions for Python Functions',
        type: 'assignment',
        priority: 'medium',
        read: false,
        createdAt: new Date('2024-01-24T09:15:00'),
        actionUrl: '/instructor/assignments',
        actionText: 'Grade Assignments',
        relatedCourse: 'Introduction to Programming',
      },
    ];
  }

  return baseNotifications;
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

export function NotificationsPopover({ sx, ...other }: NotificationsPopoverProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => 
    getNotificationsForRole(user?.role || 'student')
  );

  const totalUnRead = notifications.filter((item) => !item.read).length;

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const handleViewAllNotifications = useCallback(() => {
    navigate('/notifications');
    handleClosePopover();
  }, [navigate, handleClosePopover]);

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.92),
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[24],
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          <Box sx={{ p: 1 }}>
            {notifications.length === 0 ? (
              <Box sx={{ px: 1.5, py: 6, textAlign: 'center' }}>
                <Iconify icon="solar:bell-off-bold-duotone" width={44} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  No notifications
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  You&apos;re all caught up.
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1.5,
                    border: `1px solid ${notification.read ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.primary.main, 0.28)}`,
                    bgcolor: notification.read
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.primary.main, 0.06),
                    cursor: 'pointer',
                    transition: theme.transitions.create(['transform', 'box-shadow', 'background-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[4],
                      bgcolor: notification.read
                        ? alpha(theme.palette.action.hover, 0.6)
                        : alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                      handleClosePopover();
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        mt: 1.1,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: notification.read ? 'transparent' : 'primary.main',
                        boxShadow: notification.read ? 'none' : `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`,
                      }}
                    />

                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type)}.main`,
                        width: 34,
                        height: 34,
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      <Iconify icon={getNotificationIcon(notification.type)} width={16} sx={{ color: 'common.white' }} />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ fontWeight: notification.read ? 600 : 800 }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          color={getPriorityColor(notification.priority)}
                          variant={notification.read ? 'outlined' : 'filled'}
                          sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 0.75,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {notification.createdAt.toLocaleDateString()} at{' '}
                        {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="inherit"
            onClick={handleViewAllNotifications}
            endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
            sx={{
              py: 1.2,
              borderRadius: 1.25,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.6) },
            }}
          >
            View all
          </Button>
        </Box>
      </Popover>
    </>
  );
}
