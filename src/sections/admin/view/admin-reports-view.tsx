import type { ApexOptions } from 'apexcharts';

import Chart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ColorType = 'primary' | 'info' | 'success' | 'warning' | 'error';

interface StatData {
  title: string;
  value: string;
  icon: string;
  color: ColorType;
  percent: number;
}

const mockStats: StatData[] = [
  {
    title: 'Total Students',
    value: '2,345',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'primary',
    percent: 12,
  },
  {
    title: 'Active Courses',
    value: '45',
    icon: 'solar:notebook-bold-duotone',
    color: 'info',
    percent: 5,
  },
  {
    title: 'Total Revenue',
    value: '$124,500',
    icon: 'solar:dollar-minimalistic-bold-duotone',
    color: 'success',
    percent: 24,
  },
  {
    title: 'Pending Applications',
    value: '12',
    icon: 'solar:file-check-bold-duotone',
    color: 'warning',
    percent: -2,
  },
];

const mockPopularCourses = [
  { name: 'Introduction to Programming', students: 450, rating: 4.8, category: 'Development' },
  { name: 'Web Development Bootcamp', students: 320, rating: 4.9, category: 'Development' },
  { name: 'Data Science Fundamentals', students: 280, rating: 4.7, category: 'Data Science' },
  { name: 'UI/UX Design Masterclass', students: 210, rating: 4.8, category: 'Design' },
  { name: 'Digital Marketing 101', students: 150, rating: 4.6, category: 'Marketing' },
];

export function AdminReportsView() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (value) => `$${value / 1000}k`,
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `$${value}`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Revenue',
      data: [12500, 15000, 14200, 18500, 22000, 25000, 24500, 28000, 32500, 35000, 38000, 42500],
    },
  ];

  const pieChartOptions: ApexOptions = {
    chart: {
      fontFamily: theme.typography.fontFamily,
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ],
    labels: ['Development', 'Data Science', 'Design', 'Marketing'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      labels: { colors: theme.palette.text.primary },
    },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      theme: theme.palette.mode,
      fillSeriesColor: false,
    },
  };

  const pieChartSeries = [45, 25, 20, 10];

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 5,
            p: 3,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.12),
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
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:chart-2-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                System Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Platform performance, revenue, and student statistics.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, mb: 5 }}>
          {mockStats.map((stat) => (
            <Card
              key={stat.title}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                transition: (t) => t.transitions.create(['transform', 'box-shadow', 'border-color'], { duration: 200 }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                  boxShadow: theme.shadows[10],
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
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
                      bgcolor: (theme.palette as any)[stat.color].lighter,
                      color: (theme.palette as any)[stat.color].main,
                    }}
                  >
                    <Iconify icon={stat.icon} width={24} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify 
                    icon={stat.percent >= 0 ? 'solar:trending-up-bold' : 'solar:trending-down-bold'} 
                    color={stat.percent >= 0 ? 'success.main' : 'error.main'}
                    width={16}
                  />
                  <Typography 
                    variant="subtitle2" 
                    color={stat.percent >= 0 ? 'success.main' : 'error.main'}
                  >
                    {Math.abs(stat.percent)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Revenue Overview</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">2024</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: 350, width: '100%' }}>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={350}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Course Categories</Typography>
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="donut"
                  height={300}
                  width="100%"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Popular Courses</Typography>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {mockPopularCourses.map((course) => (
                <Box key={course.name} sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" noWrap sx={{ maxWidth: 200, fontWeight: 600 }}>
                        {course.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.category}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2">
                        {course.students} students
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Iconify icon="solar:star-bold" color="warning.main" width={14} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {course.rating}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(course.students / 500) * 100} 
                    color="primary"
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'primary.lighter' }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </DashboardContent>
  );
}
