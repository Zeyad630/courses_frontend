import type { Theme } from '@mui/material/styles';

import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Card, { cardClasses } from '@mui/material/Card';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Iconly } from 'src/components/iconly';
import { SchoolLogo } from 'src/components/school-logo';

import Antigravity from '../components/antigravity';
import { useInView } from '../components/use-in-view';
import ScrollVelocity from '../components/scroll-velocity';

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

type Feature = {
  title: string;
  description: string;
  icon: string;
};

function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.18 });

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : 'translateY(18px)',
        transition: (theme: Theme) =>
          theme.transitions.create(['opacity', 'transform'], {
            duration: 650,
            easing: theme.transitions.easing.easeOut,
          }),
      }}
    >
      {children}
    </Box>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.18),
        bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.8),
        backdropFilter: 'blur(14px)',
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], {
          duration: 220,
        }),
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0,
          background: `radial-gradient(600px circle at 50% 0%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.22)}, transparent 45%)`,
          transition: theme.transitions.create(['opacity'], { duration: 220 }),
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.32),
          boxShadow: `0 18px 40px ${varAlpha(theme.vars.palette.common.blackChannel, 0.14)}`,
          [`& .${cardClasses.root}`]: {
            transform: 'none',
          },
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.10),
                border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
              }}
            >
              <Iconly name={feature.icon} size={22} sx={{ color: 'primary.main' }} />
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {feature.title}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {feature.description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function LandingView() {
  const theme = useTheme();

  const features: Feature[] = [
    {
      title: 'Role-Based Dashboards',
      description: 'A personalized dashboard for admins, instructors, and students—each with focused tools and shortcuts.',
      icon: 'Home',
    },
    {
      title: 'Courses & Progress',
      description: 'Browse courses, join quickly, and keep a clear view of your learning progress and milestones.',
      icon: 'Bookmark',
    },
    {
      title: 'Assignments Workflow',
      description: 'Structured tasks and submissions with a smooth student experience and instructor oversight.',
      icon: 'Document',
    },
    {
      title: 'Applications & Payments',
      description: 'A streamlined admission flow with clear status tracking and payment steps built-in.',
      icon: 'Folder',
    },
    {
      title: 'Live Playground',
      description: 'Experiment, practice, and learn by doing with an integrated playground experience.',
      icon: 'Game',
    },
    {
      title: 'Reports & Insights',
      description: 'Track performance and engagement with clean, actionable analytics for admins.',
      icon: 'Chart',
    },
  ];

  const onGoToSignIn = useCallback(() => {
    scrollToId('top');
  }, []);

  return (
    <Box id="top" sx={{ bgcolor: 'background.default' }}>
      <AppBar
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.72),
          backdropFilter: 'blur(16px)',
        }}
      >
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <SchoolLogo href="/" />

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button color="inherit" onClick={() => scrollToId('features')} sx={{ fontWeight: 700 }}>
                Features
              </Button>
              <Button color="inherit" onClick={() => scrollToId('workflow')} sx={{ fontWeight: 700 }}>
                Workflow
              </Button>
              <Button color="inherit" onClick={() => scrollToId('faq')} sx={{ fontWeight: 700 }}>
                FAQ
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={RouterLink}
                href="/sign-in"
                variant="outlined"
                color="inherit"
                sx={{
                  borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
                  fontWeight: 800,
                }}
              >
                Sign in
              </Button>

              <Button
                component={RouterLink}
                href="/sign-up"
                variant="contained"
                sx={{
                  fontWeight: 900,
                  boxShadow: `0 16px 40px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.26)}`,
                }}
              >
                Get started
              </Button>

              <IconButton
                onClick={() => scrollToId('features')}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <Iconly name="Arrow - Down 2" size={22} />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          background: (t: Theme) =>
            `radial-gradient(900px circle at 25% 0%, ${varAlpha(t.vars.palette.primary.mainChannel, 0.18)}, transparent 55%), radial-gradient(700px circle at 90% 30%, ${varAlpha(t.vars.palette.secondary.mainChannel, 0.18)}, transparent 55%)`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.50)}, transparent, ${alpha(theme.palette.secondary.light, 0.35)})`,
            backgroundSize: '200% 200%',
            animation: `${shimmer} 12s ease infinite`,
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack spacing={6} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
            <Stack spacing={3.5} sx={{ flex: '1 1 auto' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="Interactive learning platform"
                  variant="outlined"
                  sx={{
                    fontWeight: 800,
                    borderColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.28),
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
                  }}
                />

                <Chip
                  label="Fast. Secure. Modern."
                  variant="outlined"
                  sx={{
                    fontWeight: 800,
                    borderColor: varAlpha(theme.vars.palette.secondary.mainChannel, 0.28),
                    bgcolor: varAlpha(theme.vars.palette.secondary.mainChannel, 0.06),
                  }}
                />
              </Stack>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.06,
                  letterSpacing: -1.5,
                  backgroundImage: `linear-gradient(90deg, ${theme.vars.palette.text.primary}, ${theme.vars.palette.primary.main}, ${theme.vars.palette.secondary.main})`,
                  backgroundSize: '200% 200%',
                  animation: `${shimmer} 10s ease infinite`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Build skills.
                <br />
                Track progress.
                <br />
                Launch careers.
              </Typography>

              <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 560 }}>
                A role-based experience for students, instructors, and admins—designed with smooth interactions,
                strong UX, and a modern visual system.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <Button
                  component={RouterLink}
                  href="/sign-up"
                  size="large"
                  variant="contained"
                  sx={{
                    fontWeight: 900,
                    px: 3,
                    py: 1.25,
                    boxShadow: `0 18px 50px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.26)}`,
                  }}
                >
                  Start learning
                </Button>

                <Button
                  component={RouterLink}
                  href="/sign-in"
                  size="large"
                  variant="outlined"
                  color="inherit"
                  onClick={onGoToSignIn}
                  sx={{
                    fontWeight: 900,
                    px: 3,
                    py: 1.25,
                    borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
                  }}
                >
                  Sign in
                </Button>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconly name="Shield Done" size={20} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Auth Guard
                  </Typography>
                </Stack>

                <Divider flexItem orientation="vertical" sx={{ borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.18) }} />

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconly name="Time Circle" size={20} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Smooth UX
                  </Typography>
                </Stack>

                <Divider flexItem orientation="vertical" sx={{ borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.18) }} />

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconly name="Activity" size={20} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Interactive UI
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 520 } }}>
              <Box
                sx={{
                  height: { xs: 360, md: 460 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                  bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.55),
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 22px 70px ${varAlpha(theme.vars.palette.common.blackChannel, 0.18)}`,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(600px circle at 35% 15%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.20)}, transparent 50%), radial-gradient(600px circle at 75% 70%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.18)}, transparent 55%)`,
                    pointerEvents: 'none',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.7,
                  }}
                >
                  <Antigravity
                    count={320}
                    magnetRadius={6}
                    ringRadius={7}
                    waveSpeed={0.4}
                    waveAmplitude={1}
                    particleSize={1.35}
                    lerpSpeed={0.055}
                    color={theme.vars.palette.primary.main}
                    autoAnimate
                    particleVariance={1}
                    depthFactor={1.0}
                    pulseSpeed={3}
                    particleShape="capsule"
                    fieldStrength={10}
                  />
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 16,
                    borderRadius: 2,
                    border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.18)}`,
                    bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.82),
                    backdropFilter: 'blur(14px)',
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    Your next lesson is one click away
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Explore courses, submit assignments, track progress, and stay connected.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 3, md: 4 },
          borderTop: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.10)}`,
          borderBottom: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.10)}`,
          bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.4),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <ScrollVelocity
            texts={['GenZCoders', 'Courses']}
            velocity={50}
            numCopies={8}
            parallaxSx={{
              borderRadius: 1,
              overflow: 'hidden',
            }}
            scrollerSx={{
              py: { xs: 1.25, md: 1.5 },
              color: varAlpha(theme.vars.palette.text.primaryChannel, 0.82),
              fontWeight: 900,
              fontSize: { xs: 28, md: 56 },
              lineHeight: 1,
              letterSpacing: { xs: -0.6, md: -1.2 },
              textTransform: 'uppercase',
              '& > span': {
                px: { xs: 2, md: 3 },
                display: 'inline-flex',
                alignItems: 'center',
              },
            }}
          />
        </Container>
      </Box>

      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Reveal>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900 }}>
              FEATURES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.8 }}>
              Everything you need in one place
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 680, lineHeight: 1.8 }}>
              A cohesive experience across roles—built with a consistent theme, clear navigation, and delightful UI
              interactions.
            </Typography>
          </Stack>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2.25,
          }}
        >
          {features.map((feature) => (
            <Reveal key={feature.title}>
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </Box>
      </Container>

      <Box id="workflow" sx={{ py: { xs: 8, md: 10 }, bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.55) }}>
        <Container maxWidth="lg">
          <Reveal>
            <Stack spacing={1} sx={{ mb: 4 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                WORKFLOW
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.8 }}>
                Simple flow, powerful tools
              </Typography>
            </Stack>
          </Reveal>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2.25,
            }}
          >
            {[
              {
                title: 'Sign in & pick your path',
                icon: 'Login',
                description: 'Get the correct dashboard for your role with protected routing and clean UX.',
              },
              {
                title: 'Learn with structure',
                icon: 'Paper',
                description: 'Courses, assignments, and progress tracking stay organized in a unified experience.',
              },
              {
                title: 'Manage & scale',
                icon: 'Setting',
                description: 'Admins review applications, manage users & courses, and monitor reports.',
              },
            ].map((step) => (
              <Reveal key={step.title}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.18),
                    bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.7),
                    backdropFilter: 'blur(14px)',
                    p: 1,
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: varAlpha(theme.vars.palette.secondary.mainChannel, 0.10),
                            border: `1px solid ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.18)}`,
                          }}
                        >
                          <Iconly name={step.icon} size={22} sx={{ color: 'secondary.main' }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          {step.title}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {step.description}
                      </Typography>

                      <Box
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 999,
                          overflow: 'hidden',
                          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                        }}
                      >
                        <Box
                          sx={{
                            height: 1,
                            width: '78%',
                            background: `linear-gradient(90deg, ${theme.vars.palette.primary.main}, ${theme.vars.palette.secondary.main})`,
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </Box>

          <Reveal>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.18)}`,
                bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.7),
                backdropFilter: 'blur(14px)',
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack spacing={0.75}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Ready to start?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Create an account and access the full platform.
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button
                  component={RouterLink}
                  href="/sign-up"
                  variant="contained"
                  size="large"
                  sx={{ fontWeight: 900, px: 3 }}
                >
                  Create account
                </Button>
                <Button
                  component={RouterLink}
                  href="/sign-in"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    fontWeight: 900,
                    px: 3,
                    borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.22),
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Reveal>
        </Container>
      </Box>

      <Container id="faq" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Reveal>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900 }}>
              FAQ
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.8 }}>
              Questions, answered
            </Typography>
          </Stack>
        </Reveal>

        <Stack spacing={1.5}>
          {[
            {
              q: 'Is the landing page theme consistent with the dashboard?',
              a: 'Yes. It uses the same MUI theme variables and the same palette system you already have in the app.',
            },
            {
              q: 'Can we add more advanced “React Bits” style interactions?',
              a: 'Yes. We can progressively add more interactive blocks (hover effects, scroll effects, text animations) as standalone components while staying aligned with the theme.',
            },
            {
              q: 'Will this affect protected routes?',
              a: 'No. The dashboard pages remain protected by AuthGuard. The landing page is public and routes cleanly to sign-in/sign-up.',
            },
          ].map((item) => (
            <Reveal key={item.q}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                  bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.65),
                  backdropFilter: 'blur(12px)',
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconly name="Arrow - Down 2" size={20} />}
                  sx={{
                    px: 2,
                    '& .MuiAccordionSummary-content': {
                      my: 1.5,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2, pb: 2.25 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Reveal>
          ))}
        </Stack>
      </Container>

      <Box
        sx={{
          py: 4,
          borderTop: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.10)}`,
          bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.40),
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Built with MUI theme variables and interactive 3D effects.
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button color="inherit" size="small" onClick={() => scrollToId('top')} sx={{ fontWeight: 800 }}>
                Back to top
              </Button>
              <Button component={RouterLink} href="/sign-in" size="small" sx={{ fontWeight: 800 }}>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
