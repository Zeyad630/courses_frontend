import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const mockCourses = [
  {
    id: '1',
    title: 'Full Stack Web Development',
    description: 'Master modern web development with React, Node.js, and MongoDB. Build production-ready applications.',
    instructor: 'Dr. Sarah Johnson',
    instructorId: 'inst_1',
    students: 245,
    duration: '12 weeks',
    level: 'Intermediate',
    price: 599,
    category: 'Web Development',
    isActive: true,
    maxStudents: 300,
    startDate: new Date('2024-02-01'),
    rating: 4.9,
    reviews: 342,
    image: '/assets/school/logo.png',
    tags: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    progress: 65,
  },
  {
    id: '2',
    title: 'Machine Learning Masterclass',
    description: 'Deep dive into machine learning algorithms, neural networks, and real-world applications.',
    instructor: 'Prof. Michael Chen',
    instructorId: 'inst_2',
    students: 189,
    duration: '14 weeks',
    level: 'Advanced',
    price: 799,
    category: 'Data Science',
    isActive: true,
    maxStudents: 200,
    startDate: new Date('2024-02-15'),
    rating: 4.8,
    reviews: 287,
    image: '/assets/school/logo.png',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'AI'],
    progress: 48,
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles, user research, and prototyping. Create beautiful and intuitive interfaces.',
    instructor: 'Emma Davis',
    instructorId: 'inst_3',
    students: 156,
    duration: '8 weeks',
    level: 'Beginner',
    price: 449,
    category: 'Design',
    isActive: true,
    maxStudents: 150,
    startDate: new Date('2024-03-01'),
    rating: 4.7,
    reviews: 198,
    image: '/assets/school/logo.png',
    tags: ['Figma', 'Design', 'UX', 'Prototyping'],
    progress: 72,
  },
  {
    id: '4',
    title: 'Mobile App Development with Flutter',
    description: 'Build cross-platform mobile apps with Flutter. Deploy to iOS and Android from a single codebase.',
    instructor: 'Alex Rivera',
    instructorId: 'inst_4',
    students: 134,
    duration: '10 weeks',
    level: 'Intermediate',
    price: 549,
    category: 'Mobile Development',
    isActive: true,
    maxStudents: 150,
    startDate: new Date('2024-03-15'),
    rating: 4.6,
    reviews: 156,
    image: '/assets/school/logo.png',
    tags: ['Flutter', 'Dart', 'Mobile', 'iOS'],
    progress: 52,
  },
  {
    id: '5',
    title: 'Cloud Architecture with AWS',
    description: 'Master AWS services and cloud architecture. Design scalable and secure cloud solutions.',
    instructor: 'Dr. James Wilson',
    instructorId: 'inst_5',
    students: 98,
    duration: '9 weeks',
    level: 'Advanced',
    price: 699,
    category: 'Cloud Computing',
    isActive: true,
    maxStudents: 100,
    startDate: new Date('2024-04-01'),
    rating: 4.9,
    reviews: 142,
    image: '/assets/school/logo.png',
    tags: ['AWS', 'Cloud', 'DevOps', 'Architecture'],
    progress: 35,
  },
  {
    id: '6',
    title: 'Python for Data Analysis',
    description: 'Learn data manipulation, visualization, and analysis using Python, pandas, and matplotlib.',
    instructor: 'Dr. Lisa Wang',
    instructorId: 'inst_6',
    students: 267,
    duration: '8 weeks',
    level: 'Beginner',
    price: 399,
    category: 'Data Science',
    isActive: true,
    maxStudents: 300,
    startDate: new Date('2024-02-20'),
    rating: 4.8,
    reviews: 421,
    image: '/assets/school/logo.png',
    tags: ['Python', 'Pandas', 'Data', 'Analysis'],
    progress: 58,
  },
];

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function CoursesAdvancedView() {
  const { user } = useAuth();
  const [courses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const categories = ['all', 'Web Development', 'Data Science', 'Design', 'Mobile Development', 'Cloud Computing'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = useCallback((course: any) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
    avgRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1),
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Explore Courses
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Discover and enroll in world-class courses taught by industry experts
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
            {[
              { label: 'Total Courses', value: stats.totalCourses, icon: 'solar:eye-bold' as any, color: 'primary' },
              { label: 'Active Students', value: stats.totalStudents, icon: 'solar:pen-bold' as any, color: 'success' },
              { label: 'Avg Rating', value: `${stats.avgRating}⭐`, icon: 'solar:share-bold' as any, color: 'warning' },
            ].map((stat, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${stat.color === 'primary' ? '#DC2626' : stat.color === 'success' ? '#10B981' : '#F59E0B'} 0%, ${stat.color === 'primary' ? '#FF6B6B' : stat.color === 'success' ? '#34D399' : '#FBBF24'} 100%)`,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Iconify icon={stat.icon} width={32} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 4, p: 3, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:pen-bold" width={20} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
                  },
                },
              }}
            />
            <Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
              },
            }}
          >
            <Tab label={`All Courses (${filteredCourses.length})`} />
            <Tab label="Most Popular" />
            <Tab label="Highest Rated" />
          </Tabs>
        </Card>

        {/* Courses Grid */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {filteredCourses.map((course) => (
              <Box key={course.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Chip
                          label={course.level}
                          size="small"
                          color={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'error'}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {course.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {course.description.substring(0, 80)}...
                    </Typography>

                    {/* Rating and Reviews */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Rating value={course.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {course.rating} ({course.reviews} reviews)
                      </Typography>
                    </Box>

                    {/* Instructor */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {course.instructor.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                          {course.instructor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.students} students
                        </Typography>
                      </Box>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {course.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                      {course.tags.length > 2 && <Chip label={`+${course.tags.length - 2}`} size="small" />}
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Course Progress
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {course.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: 'rgba(220, 38, 38, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
                          },
                        }}
                      />
                    </Box>

                    {/* Info Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.duration}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Capacity
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.students}/{course.maxStudents}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ${course.price}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                      onClick={() => handleOpenDialog(course)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:share-bold" width={16} />}
                    >
                      Enroll
                    </Button>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Most Popular Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {filteredCourses
              .sort((a, b) => b.students - a.students)
              .slice(0, 3)
              .map((course) => (
                <Box key={course.id}>
                  <Card
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '"POPULAR"',
                        position: 'absolute',
                        top: 10,
                        right: -30,
                        background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                        color: 'white',
                        padding: '4px 40px',
                        transform: 'rotate(45deg)',
                        fontSize: '12px',
                        fontWeight: 700,
                        zIndex: 1,
                      },
                    }}
                  >
                    <CardContent>
                      <Chip label={course.level} size="small" color="success" variant="outlined" sx={{ mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {course.description.substring(0, 80)}...
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={course.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {course.rating}
                        </Typography>
                      </Box>
                      <Button variant="contained" fullWidth>
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        </TabPanel>

        {/* Highest Rated Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {filteredCourses
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((course) => (
                <Box key={course.id}>
                  <Card
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '"TOP RATED"',
                        position: 'absolute',
                        top: 10,
                        right: -30,
                        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                        color: 'white',
                        padding: '4px 40px',
                        transform: 'rotate(45deg)',
                        fontSize: '12px',
                        fontWeight: 700,
                        zIndex: 1,
                      },
                    }}
                  >
                    <CardContent>
                      <Chip label={course.level} size="small" color="warning" variant="outlined" sx={{ mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {course.description.substring(0, 80)}...
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={course.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {course.rating}
                        </Typography>
                      </Box>
                      <Button variant="contained" fullWidth>
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        </TabPanel>

        {/* Course Details Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          {selectedCourse && (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                {selectedCourse.title}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedCourse.description}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Instructor
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedCourse.instructor}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedCourse.duration}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Level
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedCourse.level}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${selectedCourse.price}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button variant="contained">Enroll Now</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
