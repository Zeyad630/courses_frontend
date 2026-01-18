import type { WeekDto } from 'src/api/models/week';
import type { MaterialDto } from 'src/api/models/material';
import type { Lesson, CourseModule } from 'src/types/course';
import type { ZoomMeetingDto } from 'src/api/models/zoom-meeting';

import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import AccordionSummary from '@mui/material/AccordionSummary';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { keyframes } from '@mui/system';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/contexts/simple-auth-context';
import { useCoursesContext } from 'src/contexts/courses-context';
import { mapCourseDtoToCourse } from 'src/api/mappers/course.mapper';
import { useApplicationsContext } from 'src/contexts/applications-context';
import { useCourseRoundsContext } from 'src/contexts/course-rounds-context';
import { applicationApi, courseApi, courseMaterialApi, materialApi, weekApi, zoomMeetingApi } from 'src/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
type CourseRoomViewProps = {
  courseId: string;
};

const courseContentStorageKey = (courseId: string) => `course_content_modules_v1_${courseId}`;

const safeParseModules = (raw: string | null): CourseModule[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CourseModule[]) : [];
  } catch {
    return [];
  }
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const premiumGlass = (theme: any) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
  borderRadius: 3,
});

const getMaterialMeta = (material: MaterialDto) => {
  const typeStatusId = material.materialTypeStatusId;
  const type = String(material.materialType ?? '').trim().toLowerCase();

  if (typeStatusId === 32) {
    return { label: 'PDF', icon: 'solar:document-text-bold-duotone' };
  }

  if (typeStatusId === 33) {
    return { label: 'VIDEO', icon: 'solar:videocamera-record-bold-duotone' };
  }

  if (typeStatusId === 34) {
    return { label: 'ZOOM LINK', icon: 'solar:videocamera-bold-duotone' };
  }

  if (typeStatusId === 35) {
    return { label: 'GENERAL', icon: 'solar:folder-with-files-bold-duotone' };
  }

  if (typeStatusId === 36) {
    return { label: 'QUIZ', icon: 'solar:checklist-minimalistic-bold-duotone' };
  }

  if (typeStatusId === 37) {
    return { label: 'POWERPOINT', icon: 'solar:presentation-graph-bold-duotone' };
  }

  if (type.includes('pdf')) return { label: 'PDF', icon: 'solar:document-text-bold-duotone' };
  if (type.includes('video')) return { label: 'VIDEO', icon: 'solar:videocamera-record-bold-duotone' };
  if (type.includes('zoom')) return { label: 'ZOOM', icon: 'solar:videocamera-bold-duotone' };
  if (type.includes('link')) return { label: 'LINK', icon: 'solar:link-bold-duotone' };

  return { label: 'MATERIAL', icon: 'solar:file-bold-duotone' };
};

export function CourseRoomView({ courseId }: CourseRoomViewProps) {
  const { user, hasRole } = useAuth();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [materialsView, setMaterialsView] = useState<'grid' | 'list'>('grid');
  const [expandedWeekIds, setExpandedWeekIds] = useState<Record<string, boolean>>({});

  const [searchParams] = useSearchParams();
  const roundIdFromQuery = useMemo(() => searchParams.get('roundId') ?? '', [searchParams]);

  const { getRoundsByCourse } = useCourseRoundsContext();
  const { getApplicationsByStudent, isLoading: applicationsLoading } = useApplicationsContext();

  const [roundCountApplications, setRoundCountApplications] = useState<
    Array<{ courseRoundId: number; statusId?: number; status?: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const items = await applicationApi.getApplications();
        if (cancelled) return;
        setRoundCountApplications(
          items.map((a) => ({ courseRoundId: a.courseRoundId, statusId: a.statusId, status: a.status }))
        );
      } catch {
        if (cancelled) return;
        setRoundCountApplications([]);
      }
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const acceptedCountByRoundId = useMemo(() => {
    const map: Record<string, number> = {};
    roundCountApplications.forEach((a) => {
      if (typeof a.status === 'string' && a.status.trim() !== '') {
        if (!a.status.trim().toLowerCase().includes('accept')) return;
      } else if (a.statusId != null) {
        if (a.statusId !== 3) return;
      } else {
        return;
      }
      const key = String(a.courseRoundId);
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [roundCountApplications]);
  const acceptedApplication = useMemo(() => {
    if (!hasRole('student')) return undefined;
    if (!user?.id) return undefined;
    if (applicationsLoading) return undefined;
    return getApplicationsByStudent(user.id).find((a) => a.courseId === courseId && a.status === 'accepted');
  }, [applicationsLoading, courseId, getApplicationsByStudent, hasRole, user?.id]);

  const isAcceptedStudent = useMemo(() => {
    if (!hasRole('student')) return false;
    if (!user?.id) return false;
    if (applicationsLoading) return false;
    return getApplicationsByStudent(user.id).some((a) => a.courseId === courseId && a.status === 'accepted');
  }, [applicationsLoading, courseId, getApplicationsByStudent, hasRole, user?.id]);

  const roundsCount = useMemo(() => getRoundsByCourse(courseId).length, [courseId, getRoundsByCourse]);

  const roundsForCourse = useMemo(() => getRoundsByCourse(courseId), [courseId, getRoundsByCourse]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');

  const studentRoundId = useMemo(() => {
    if (!hasRole('student')) return undefined;
    if (roundIdFromQuery && roundsForCourse.some((r) => r.id === roundIdFromQuery)) return roundIdFromQuery;
    if (acceptedApplication?.courseRoundId != null) return String(acceptedApplication.courseRoundId);
    return undefined;
  }, [acceptedApplication?.courseRoundId, hasRole, roundIdFromQuery, roundsForCourse]);

  useEffect(() => {
    if (!hasRole('instructor')) return;
    if (roundsForCourse.length === 0) return;
    if (roundIdFromQuery && roundsForCourse.some((r) => r.id === roundIdFromQuery)) {
      if (selectedRoundId !== roundIdFromQuery) setSelectedRoundId(roundIdFromQuery);
      return;
    }
    if (selectedRoundId) return;
    setSelectedRoundId(roundsForCourse[0].id);
  }, [hasRole, roundIdFromQuery, roundsForCourse, selectedRoundId]);

  const activeRoundId = useMemo(() => {
    if (hasRole('student')) return studentRoundId;
    if (hasRole('instructor')) return selectedRoundId || roundsForCourse[0]?.id;
    return undefined;
  }, [hasRole, roundsForCourse, selectedRoundId, studentRoundId]);

  const dataRoundId = useMemo(() => {
    if (activeRoundId) return activeRoundId;
    return roundsForCourse[0]?.id;
  }, [activeRoundId, roundsForCourse]);

  const activeRound = useMemo(
    () => (activeRoundId ? roundsForCourse.find((r) => r.id === activeRoundId) : undefined),
    [activeRoundId, roundsForCourse]
  );

  const headerRound = useMemo(
    () => (hasRole('student') ? activeRound : activeRound),
    [activeRound, hasRole]
  );

  const headerRoundStudentsCount = useMemo(() => {
    if (!headerRound?.id) return 0;
    return acceptedCountByRoundId[String(headerRound.id)] ?? 0;
  }, [acceptedCountByRoundId, headerRound?.id]);

  const { courses } = useCoursesContext();
  const courseFromContext = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const [courseFromApi, setCourseFromApi] = useState<ReturnType<typeof mapCourseDtoToCourse> | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!courseId || courseFromContext) {
      setCourseFromApi(null);
      setCourseLoading(false);
      return () => {
        isActive = false;
      };
    }

    setCourseLoading(true);
    courseApi
      .getCourseById(courseId)
      .then((dto) => mapCourseDtoToCourse(dto))
      .then((mapped) => {
        if (isActive) setCourseFromApi(mapped);
      })
      .catch(() => {
        if (isActive) setCourseFromApi(null);
      })
      .finally(() => {
        if (isActive) setCourseLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [courseFromContext, courseId]);

  const resolvedCourse = courseFromContext ?? courseFromApi;

  const instructorHasAccess = useMemo(() => {
    if (!hasRole('instructor')) return true;
    if (!user?.id) return false;
    const ownsCourse = resolvedCourse?.instructorId === user.id;
    const ownsAnyRoundInCourse = roundsForCourse.some((r) => r.createdBy === user.id);
    return ownsCourse || ownsAnyRoundInCourse;
  }, [hasRole, resolvedCourse?.instructorId, roundsForCourse, user?.id]);

  const displayCourse = useMemo(
    () => ({
      id: courseId,
      title: resolvedCourse?.name ?? '',
      description: resolvedCourse?.description ?? '',
      instructor: resolvedCourse?.instructor ?? '',
      instructorId: resolvedCourse?.instructorId ?? '',
      duration: resolvedCourse ? `${resolvedCourse.duration} hours` : '',
      level: resolvedCourse
        ? `${resolvedCourse.level.charAt(0).toUpperCase()}${resolvedCourse.level.slice(1)}`
        : '',
      language: '',
      price: resolvedCourse?.price ?? 0,
      students: resolvedCourse?.students ?? 0,
      totalLessons: resolvedCourse?.content?.totalLessons ?? 0,
      completedLessons: 0,
      nextClass: null as Date | null,
      zoomLink: '',
      syllabus: [] as string[],
    }),
    [courseId, resolvedCourse]
  );

  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [zoomMeetings, setZoomMeetings] = useState<ZoomMeetingDto[]>([]);
  const [weeks, setWeeks] = useState<WeekDto[]>([]);
  const [weekDetailsById, setWeekDetailsById] = useState<Record<string, WeekDto>>({});
  const [roundDataError, setRoundDataError] = useState<string>('');

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setSuccessMessage('Copied to clipboard.');
    } catch {
      setRoundDataError('Failed to copy.');
    }
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const tmr = setTimeout(() => setSuccessMessage(''), 3500);
    return () => clearTimeout(tmr);
  }, [successMessage]);

  useEffect(() => {
    let cancelled = false;

    if (!dataRoundId) {
      setMaterials([]);
      setZoomMeetings([]);
      setWeeks([]);
      setRoundDataError('');
      return () => {
        cancelled = true;
      };
    }

    setRoundDataError('');
    setSuccessMessage('');

    Promise.all([
      courseMaterialApi.getByCourseRoundId(Number(dataRoundId)).catch(() => []),
      zoomMeetingApi.getByCourseRoundId(Number(dataRoundId)).catch(() => []),
      weekApi.getByCourseRoundId(Number(dataRoundId)).catch(() => []),
    ])
      .then(async ([mats, zooms, ws]) => {
        if (cancelled) return;
        const showOnlyActive = hasRole('student');
        const nextMaterials = showOnlyActive ? mats.filter((m) => m.isActive !== false) : mats;
        const weekIds = Array.from(
          new Set(nextMaterials.map((m) => m.weekId).filter((x): x is number => Number.isFinite(Number(x))))
        );

        const weekDetails = await Promise.all(
          weekIds.map((id) =>
            weekApi
              .getById(id)
              .then((w) => w)
              .catch(() => null)
          )
        );

        if (cancelled) return;

        const weekMap: Record<string, WeekDto> = {};
        weekDetails.forEach((w) => {
          if (w) weekMap[String(w.id)] = w;
        });

        setWeekDetailsById(weekMap);
        setMaterials(nextMaterials);
        setZoomMeetings(showOnlyActive ? zooms.filter((z) => z.isActive !== false) : zooms);
        setWeeks(ws);
      })
      .catch((error: any) => {
        if (cancelled) return;
        setMaterials([]);
        setZoomMeetings([]);
        setWeeks([]);
        setWeekDetailsById({});
        setRoundDataError(error?.message || 'Failed to load round materials/zoom meetings');
      });

    return () => {
      cancelled = true;
    };
  }, [dataRoundId, hasRole]);

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);

  const [editMaterialDialogOpen, setEditMaterialDialogOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<number | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState({
    title: '',
    description: '',
    link: '',
    materialTypeStatusId: 35,
    isActive: true,
  });

  const [materialForm, setMaterialForm] = useState({ title: '', description: '', link: '', materialTypeStatusId: 35 });
  const [zoomForm, setZoomForm] = useState({
    topic: '',
    description: '',
    meetingLink: '',
    meetingId: '',
    passcode: '',
    meetingDateTime: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
  });

  const reloadRoundData = useCallback(async () => {
    if (!activeRoundId) return;
    setRoundDataError('');
    try {
      const [mats, zooms, ws] = await Promise.all([
        courseMaterialApi.getByCourseRoundId(Number(activeRoundId)).catch(() => []),
        zoomMeetingApi.getByCourseRoundId(Number(activeRoundId)).catch(() => []),
        weekApi.getByCourseRoundId(Number(activeRoundId)).catch(() => []),
      ]);
      const showOnlyActive = hasRole('student');
      const nextMaterials = showOnlyActive ? mats.filter((m) => m.isActive !== false) : mats;
      const weekIds = Array.from(
        new Set(nextMaterials.map((m) => m.weekId).filter((x): x is number => Number.isFinite(Number(x))))
      );

      const weekDetails = await Promise.all(
        weekIds.map((id) =>
          weekApi
            .getById(id)
            .then((w) => w)
            .catch(() => null)
        )
      );

      const weekMap: Record<string, WeekDto> = {};
      weekDetails.forEach((w) => {
        if (w) weekMap[String(w.id)] = w;
      });

      setWeekDetailsById(weekMap);
      setMaterials(nextMaterials);
      setZoomMeetings(showOnlyActive ? zooms.filter((z) => z.isActive !== false) : zooms);
      setWeeks(ws);
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to load round materials/zoom meetings');
    }
  }, [activeRoundId, hasRole]);

  const zoomLinkMaterials = useMemo(
    () => materials.filter((m) => m.materialTypeStatusId === 34 || String(m.materialType ?? '').toLowerCase().includes('zoom')),
    [materials]
  );

  const materialsForMaterialsTab = useMemo(
    () =>
      materials.filter(
        (m) =>
          !(m.materialTypeStatusId === 34) && !String(m.materialType ?? '').toLowerCase().includes('zoom')
      ),
    [materials]
  );

  const materialsByWeek = useMemo(() => {
    const items = materialsForMaterialsTab;

    const allWeekIds = new Set<number>();
    items.forEach((m) => {
      if (m.weekId != null) allWeekIds.add(Number(m.weekId));
    });
    weeks.forEach((w) => allWeekIds.add(Number(w.id)));

    const resolved = Array.from(allWeekIds)
      .map((weekId) => {
        const details = weekDetailsById[String(weekId)];
        const fallback = weeks.find((w) => Number(w.id) === Number(weekId));

        const weekTitle =
          (details?.weekTitle ?? details?.title ?? fallback?.weekTitle ?? fallback?.title ?? `Week ${weekId}`).trim();

        const startDate = details?.startDate ?? fallback?.startDate;
        const endDate = details?.endDate ?? fallback?.endDate;

        const weekMaterials =
          details?.courseMaterials && details.courseMaterials.length > 0
            ? details.courseMaterials
            : items.filter((m) => Number(m.weekId) === Number(weekId));

        const byId: Record<string, MaterialDto> = {};
        weekMaterials.forEach((m) => {
          byId[String(m.id)] = m;
        });

        const childrenByParent: Record<string, MaterialDto[]> = {};
        weekMaterials.forEach((m) => {
          const pid = m.parentMaterialId;
          if (pid == null || Number(pid) === 0) return;
          const key = String(pid);
          childrenByParent[key] = [...(childrenByParent[key] ?? []), m];
        });

        const mainItems = weekMaterials.filter((m) => m.parentMaterialId == null || Number(m.parentMaterialId) === 0);
        const structured = mainItems.map((m) => {
          const directChildren = m.childMaterials?.length ? m.childMaterials : childrenByParent[String(m.id)] ?? [];
          return { main: m, children: directChildren };
        });

        return {
          weekId,
          weekTitle,
          startDate,
          endDate,
          items: structured,
        };
      })
      .sort((a, b) => {
        const da = a.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db;
      });

    return resolved;
  }, [materialsForMaterialsTab, weekDetailsById, weeks]);

  const zoomLinksByWeek = useMemo(() => {
    const items = zoomLinkMaterials;

    const allWeekIds = new Set<number>();
    items.forEach((m) => {
      if (m.weekId != null) allWeekIds.add(Number(m.weekId));
    });

    const resolved = Array.from(allWeekIds)
      .map((weekId) => {
        const details = weekDetailsById[String(weekId)];
        const fallback = weeks.find((w) => Number(w.id) === Number(weekId));

        const weekTitle =
          (details?.weekTitle ?? details?.title ?? fallback?.weekTitle ?? fallback?.title ?? `Week ${weekId}`).trim();

        const weekMaterials =
          details?.courseMaterials && details.courseMaterials.length > 0
            ? details.courseMaterials.filter((m) => m.materialTypeStatusId === 34)
            : items.filter((m) => Number(m.weekId) === Number(weekId));

        return {
          weekId,
          weekTitle,
          items: weekMaterials,
        };
      })
      .sort((a, b) => a.weekId - b.weekId);

    return resolved;
  }, [weekDetailsById, weeks, zoomLinkMaterials]);

  const isValidHttpUrl = useCallback((value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const openLink = useCallback((url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCreateMaterial = useCallback(async () => {
    if (!activeRoundId) return;
    if (!materialForm.title.trim() || !materialForm.link.trim()) return;
    if (!isValidHttpUrl(materialForm.link.trim())) {
      setRoundDataError('Please enter a valid URL for the material link.');
      return;
    }
    try {
      await materialApi.create({
        courseRoundId: Number(activeRoundId),
        title: materialForm.title.trim(),
        description: materialForm.description.trim() || undefined,
        link: materialForm.link.trim(),
        materialTypeStatusId: Number(materialForm.materialTypeStatusId) || 35,
      });
      setMaterialDialogOpen(false);
      setMaterialForm({ title: '', description: '', link: '', materialTypeStatusId: 35 });
      setSuccessMessage('Material uploaded successfully.');
      await reloadRoundData();
    } catch (error: any) {
      setSuccessMessage('');
      setRoundDataError(error?.message || 'Failed to upload material');
    }
  }, [activeRoundId, isValidHttpUrl, materialForm, reloadRoundData]);

  const handleDeleteMaterial = useCallback(
    async (id: number) => {
      if (!confirm('Delete this material?')) return;
      try {
        await materialApi.delete(id);
        await reloadRoundData();
      } catch (error: any) {
        setRoundDataError(error?.message || 'Failed to delete material');
      }
    },
    [reloadRoundData]
  );

  const handleOpenEditMaterial = useCallback((material: MaterialDto) => {
    setEditMaterialId(material.id);
    setEditMaterialForm({
      title: material.title ?? '',
      description: material.description ?? '',
      link: material.link ?? '',
      materialTypeStatusId: Number(material.materialTypeStatusId) || 35,
      isActive: Boolean(material.isActive),
    });
    setEditMaterialDialogOpen(true);
  }, []);

  const handleUpdateMaterial = useCallback(async () => {
    if (!editMaterialId) return;
    if (!editMaterialForm.title.trim() || !editMaterialForm.link.trim()) return;
    try {
      await materialApi.update(editMaterialId, {
        title: editMaterialForm.title.trim(),
        description: editMaterialForm.description.trim() || undefined,
        link: editMaterialForm.link.trim(),
        materialTypeStatusId: Number(editMaterialForm.materialTypeStatusId) || 35,
        isActive: Boolean(editMaterialForm.isActive),
      });
      setEditMaterialDialogOpen(false);
      setEditMaterialId(null);
      await reloadRoundData();
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to update material');
    }
  }, [editMaterialForm, editMaterialId, reloadRoundData]);

  const handleCreateZoomMeeting = useCallback(async () => {
    if (!activeRoundId) return;
    if (!zoomForm.topic.trim() || !zoomForm.meetingLink.trim()) return;
    if (!isValidHttpUrl(zoomForm.meetingLink.trim())) {
      setRoundDataError('Please enter a valid URL for the Zoom meeting link.');
      return;
    }
    try {
      await zoomMeetingApi.create({
        courseRoundId: Number(activeRoundId),
        topic: zoomForm.topic.trim(),
        description: zoomForm.description.trim() || undefined,
        meetingLink: zoomForm.meetingLink.trim(),
        meetingId: zoomForm.meetingId.trim() || undefined,
        passcode: zoomForm.passcode.trim() || undefined,
        meetingDateTime: new Date(zoomForm.meetingDateTime).toISOString(),
        durationMinutes: Number(zoomForm.durationMinutes) || 60,
      });
      setZoomDialogOpen(false);
      setZoomForm({
        topic: '',
        description: '',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        meetingDateTime: new Date().toISOString().slice(0, 16),
        durationMinutes: 60,
      });
      setSuccessMessage('Zoom session created successfully.');
      await reloadRoundData();
    } catch (error: any) {
      setSuccessMessage('');
      setRoundDataError(error?.message || 'Failed to add zoom meeting');
    }
  }, [activeRoundId, isValidHttpUrl, reloadRoundData, zoomForm]);

  const handleDeleteZoomMeeting = useCallback(
    async (id: number) => {
      if (!confirm('Delete this zoom meeting?')) return;
      try {
        await zoomMeetingApi.delete(id);
        await reloadRoundData();
      } catch (error: any) {
        setRoundDataError(error?.message || 'Failed to delete zoom meeting');
      }
    },
    [reloadRoundData]
  );

  const nextZoomMeeting = useMemo(() => {
    const now = Date.now();
    const upcoming = zoomMeetings
      .map((m) => ({ m, t: new Date(m.meetingDateTime).getTime() }))
      .filter((x) => Number.isFinite(x.t) && x.t >= now)
      .sort((a, b) => a.t - b.t);
    return upcoming[0]?.m;
  }, [zoomMeetings]);

  const zoomMeetingsByTime = useMemo(() => {
    const now = Date.now();
    const sorted = zoomMeetings
      .slice()
      .map((m) => ({ m, t: new Date(m.meetingDateTime).getTime() }))
      .filter((x) => Number.isFinite(x.t))
      .sort((a, b) => a.t - b.t);

    return {
      upcoming: sorted.filter((x) => x.t >= now).map((x) => x.m),
      past: sorted.filter((x) => x.t < now).map((x) => x.m).reverse(),
    };
  }, [zoomMeetings]);

  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nextZoomCountdown = useMemo(() => {
    if (!nextZoomMeeting) return '';
    const start = new Date(nextZoomMeeting.meetingDateTime).getTime();
    if (!Number.isFinite(start)) return '';
    const diffMs = start - nowTick;
    if (diffMs <= 0) return 'Starting now';
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    if (minutes > 0) return `Starts in ${minutes}m ${seconds}s`;
    return `Starts in ${seconds}s`;
  }, [nextZoomMeeting, nowTick]);

  // Simple content management state (Weeks/Modules & Lessons)
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDescription, setNewWeekDescription] = useState('');
  const [addWeekDialog, setAddWeekDialog] = useState(false);
  const [addLessonDialog, setAddLessonDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

  const [editWeekDialog, setEditWeekDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });
  const [editWeekTitle, setEditWeekTitle] = useState('');
  const [editWeekDescription, setEditWeekDescription] = useState('');

  const [deleteWeekDialog, setDeleteWeekDialog] = useState<{ open: boolean; moduleId?: string }>({ open: false });

  const [editLessonDialog, setEditLessonDialog] = useState<{ open: boolean; moduleId?: string; lessonId?: string }>({ open: false });
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDescription, setEditLessonDescription] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState<number>(30);
  const [editLessonContent, setEditLessonContent] = useState('');

  const [deleteLessonDialog, setDeleteLessonDialog] = useState<{ open: boolean; moduleId?: string; lessonId?: string }>({ open: false });

  useEffect(() => {
    const stored = safeParseModules(localStorage.getItem(courseContentStorageKey(courseId)));
    if (stored.length > 0) {
      setModules(stored);
      return;
    }

    const apiModules = resolvedCourse?.content?.modules;
    if (Array.isArray(apiModules) && apiModules.length > 0) {
      setModules(apiModules);
    }
  }, [courseId, resolvedCourse?.content?.modules]);

  useEffect(() => {
    localStorage.setItem(courseContentStorageKey(courseId), JSON.stringify(modules));
  }, [courseId, modules]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);



  const tabs = [
    { label: 'Overview', value: 0, icon: 'solar:info-circle-bold-duotone' },
    { label: 'Materials', value: 1, icon: 'solar:folder-with-files-bold-duotone' },
    { label: 'Zoom Sessions', value: 2, icon: 'solar:videocamera-bold-duotone' },
    { label: 'Curriculum', value: 3, icon: 'solar:checklist-minimalistic-bold-duotone' },
    ...(hasRole('instructor')
      ? [
          { label: 'Weeks', value: 4, icon: 'solar:calendar-mark-bold-duotone' },
          { label: 'Edit Content', value: 5, icon: 'solar:pen-new-square-bold-duotone' },
        ]
      : []),
  ];

  const weeksSorted = useMemo(
    () => weeks.slice().sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [weeks]
  );

  const completedWeeksCount = useMemo(() => {
    const now = Date.now();
    return weeksSorted.filter((w) => {
      const end = new Date(w.endDate).getTime();
      if (!Number.isFinite(end)) return false;
      return end < now;
    }).length;
  }, [weeksSorted]);

  const progressPercent = useMemo(() => {
    if (weeksSorted.length > 0) {
      return Math.max(0, Math.min(100, (completedWeeksCount / weeksSorted.length) * 100));
    }

    const total = Number(displayCourse.totalLessons);
    const done = Number(displayCourse.completedLessons);
    if (!Number.isFinite(total) || total <= 0) return 0;
    if (!Number.isFinite(done) || done < 0) return 0;
    return Math.max(0, Math.min(100, (done / total) * 100));
  }, [completedWeeksCount, displayCourse.completedLessons, displayCourse.totalLessons, weeksSorted.length]);

  const whatYouWillLearnItems = useMemo(() => {
    if (weeksSorted.length > 0) {
      return weeksSorted.map((w) => {
        const weekTitle = (w.weekTitle ?? w.title ?? '').trim();
        const group = materialsByWeek.find((x) => Number(x.weekId) === Number(w.id));
        const mainLessons = (group?.items ?? []).map((x) => x.main?.title).filter(Boolean) as string[];
        return {
          id: w.id,
          title: weekTitle,
          mainLessons: mainLessons.slice(0, 3),
        };
      });
    }

    return displayCourse.syllabus.map((t, idx) => ({ id: idx, title: t, mainLessons: [] as string[] }));
  }, [displayCourse.syllabus, materialsByWeek, weeksSorted]);

  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const [editWeekId, setEditWeekId] = useState<number | null>(null);
  const [weekForm, setWeekForm] = useState({ title: '', startDate: '', endDate: '' });

  const openCreateWeekDialog = useCallback(() => {
    setEditWeekId(null);
    setWeekForm({ title: '', startDate: '', endDate: '' });
    setWeekDialogOpen(true);
  }, []);

  const openEditWeekDialog = useCallback((w: WeekDto) => {
    setEditWeekId(w.id);
    setWeekForm({ title: w.weekTitle ?? w.title ?? '', startDate: w.startDate, endDate: w.endDate });
    setWeekDialogOpen(true);
  }, []);

  const saveWeek = useCallback(async () => {
    if (!activeRoundId) return;
    if (!weekForm.title.trim() || !weekForm.startDate || !weekForm.endDate) return;
    if (weekForm.endDate < weekForm.startDate) {
      setRoundDataError('End date must be after start date.');
      return;
    }
    try {
      if (editWeekId) {
        await weekApi.update(editWeekId, {
          title: weekForm.title.trim(),
          startDate: weekForm.startDate,
          endDate: weekForm.endDate,
        });
        setSuccessMessage('Week updated successfully.');
      } else {
        await weekApi.create({
          courseRoundId: Number(activeRoundId),
          title: weekForm.title.trim(),
          startDate: weekForm.startDate,
          endDate: weekForm.endDate,
        });
        setSuccessMessage('Week created successfully.');
      }

      setWeekDialogOpen(false);
      await reloadRoundData();
    } catch (error: any) {
      setRoundDataError(error?.message || 'Failed to save week');
    }
  }, [activeRoundId, editWeekId, reloadRoundData, weekForm]);

  const deleteWeek = useCallback(
    async (id: number) => {
      if (!confirm('Delete this week?')) return;
      try {
        await weekApi.delete(id);
        setSuccessMessage('Week deleted successfully.');
        await reloadRoundData();
      } catch (error: any) {
        setRoundDataError(error?.message || 'Failed to delete week');
      }
    },
    [reloadRoundData]
  );

  const handleAddWeek = useCallback(() => {
    setNewWeekTitle('');
    setNewWeekDescription('');
    setAddWeekDialog(true);
  }, []);

  const saveNewWeek = useCallback(() => {
    if (!newWeekTitle.trim()) return;
    const newModule: CourseModule = {
      id: `mod_${Date.now()}`,
      title: newWeekTitle.trim(),
      description: newWeekDescription.trim(),
      lessons: [],
      assignments: [],
    };
    setModules((prev) => [...prev, newModule]);
    setAddWeekDialog(false);
  }, [newWeekTitle, newWeekDescription]);

  const handleAddLesson = useCallback((moduleId: string) => {
    setAddLessonDialog({ open: true, moduleId });
    setNewLessonTitle('');
    setNewLessonDescription('');
  }, []);

  const handleEditWeek = useCallback((module: CourseModule) => {
    setEditWeekDialog({ open: true, moduleId: module.id });
    setEditWeekTitle(module.title);
    setEditWeekDescription(module.description);
  }, []);

  const saveEditedWeek = useCallback(() => {
    if (!editWeekDialog.moduleId) return;
    if (!editWeekTitle.trim()) return;

    setModules((prev) =>
      prev.map((m) =>
        m.id === editWeekDialog.moduleId
          ? { ...m, title: editWeekTitle.trim(), description: editWeekDescription.trim() }
          : m
      )
    );
    setEditWeekDialog({ open: false });
  }, [editWeekDescription, editWeekDialog.moduleId, editWeekTitle]);

  const handleDeleteWeek = useCallback((moduleId: string) => {
    setDeleteWeekDialog({ open: true, moduleId });
  }, []);

  const confirmDeleteWeek = useCallback(() => {
    if (!deleteWeekDialog.moduleId) return;
    setModules((prev) => prev.filter((m) => m.id !== deleteWeekDialog.moduleId));
    setDeleteWeekDialog({ open: false });
  }, [deleteWeekDialog.moduleId]);

  const handleEditLesson = useCallback((moduleId: string, lesson: Lesson) => {
    setEditLessonDialog({ open: true, moduleId, lessonId: lesson.id });
    setEditLessonTitle(lesson.title);
    setEditLessonDescription(lesson.description);
    setEditLessonDuration(lesson.duration);
    setEditLessonContent(lesson.content);
  }, []);

  const saveEditedLesson = useCallback(() => {
    if (!editLessonDialog.moduleId || !editLessonDialog.lessonId) return;
    if (!editLessonTitle.trim()) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== editLessonDialog.moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === editLessonDialog.lessonId
              ? {
                  ...l,
                  title: editLessonTitle.trim(),
                  description: editLessonDescription.trim(),
                  duration: Number.isFinite(editLessonDuration) ? editLessonDuration : l.duration,
                  content: editLessonContent,
                }
              : l
          ),
        };
      })
    );

    setEditLessonDialog({ open: false });
  }, [editLessonContent, editLessonDescription, editLessonDialog.lessonId, editLessonDialog.moduleId, editLessonDuration, editLessonTitle]);

  const handleDeleteLesson = useCallback((moduleId: string, lessonId: string) => {
    setDeleteLessonDialog({ open: true, moduleId, lessonId });
  }, []);

  const confirmDeleteLesson = useCallback(() => {
    if (!deleteLessonDialog.moduleId || !deleteLessonDialog.lessonId) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== deleteLessonDialog.moduleId) return m;
        const nextLessons = m.lessons
          .filter((l) => l.id !== deleteLessonDialog.lessonId)
          .map((l, idx) => ({ ...l, order: idx + 1 }));

        return { ...m, lessons: nextLessons };
      })
    );

    setDeleteLessonDialog({ open: false });
  }, [deleteLessonDialog.lessonId, deleteLessonDialog.moduleId]);

  const saveNewLesson = useCallback(() => {
    if (!addLessonDialog.moduleId || !newLessonTitle.trim()) return;
    setModules((prev) =>
      prev.map((m) =>
        m.id === addLessonDialog.moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `les_${Date.now()}`,
                  title: newLessonTitle.trim(),
                  description: newLessonDescription.trim(),
                  content: '',
                  duration: 30,
                  order: m.lessons.length + 1,
                } as Lesson,
              ],
            }
          : m
      )
    );
    setAddLessonDialog({ open: false });
  }, [addLessonDialog.moduleId, newLessonTitle, newLessonDescription]);

  if (hasRole('student') && user?.id && !headerRound) {
    if (applicationsLoading) {
      return (
        <DashboardContent>
          <Container maxWidth="xl">
            <Card sx={{ p: 4, mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Loading...
              </Typography>
              <LinearProgress />
            </Card>
          </Container>
        </DashboardContent>
      );
    }

    if (!isAcceptedStudent) {
      return (
        <DashboardContent>
          <Container maxWidth="xl">
            <Card sx={{ p: 4, mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                You do not have access to this course
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please apply for the course and wait for admin acceptance.
              </Typography>
              <Button variant="contained" href="/courses" sx={{ borderRadius: 30 }}>
                Browse Courses
              </Button>
            </Card>
          </Container>
        </DashboardContent>
      );
    }

    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Course round not available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your application was accepted, but the selected course round could not be found. Please refresh the page or contact support.
            </Typography>
            <Button variant="contained" href="/my-courses" sx={{ borderRadius: 30 }}>
              Back to My Courses
            </Button>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (hasRole('instructor') && courseLoading) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Loading...
            </Typography>
            <LinearProgress />
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  if (hasRole('instructor') && !instructorHasAccess) {
    return (
      <DashboardContent>
        <Container maxWidth="xl">
          <Card sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              You do not have access to this course
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This course is not assigned to your instructor account.
            </Typography>
            <Button variant="contained" href="/instructor/courses" sx={{ borderRadius: 30 }}>
              Back to My Courses
            </Button>
          </Card>
        </Container>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {roundDataError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRoundDataError('')}>
            {roundDataError}
          </Alert>
        )}
        {/* Premium Header */}
        <Box
          sx={{
            mb: 4,
            width: '100%',
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            animation: `${fadeIn} 0.8s ease-out`,
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
           
           <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 }, color: 'white' }}>
             <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                     <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <Chip 
                          label={displayCourse.level} 
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.15)', 
                            color: 'white', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            fontWeight: 700,
                            height: 28
                          }} 
                        />
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                            <Iconify icon="solar:clock-circle-bold" width={16} />
                            <Typography variant="body2" fontWeight={600}>{displayCourse.duration}</Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                            <Iconify icon="solar:users-group-rounded-bold" width={16} />
                            <Typography variant="body2" fontWeight={600}>{headerRoundStudentsCount} Students</Typography>
                         </Box>
                     </Stack>

                     <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        {displayCourse.title}
                     </Typography>
                     
                     <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
                       <Avatar sx={{ width: 48, height: 48, border: '2px solid white' }}>
                          {displayCourse.instructor.charAt(0)}
                       </Avatar>
                       <Box>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>Instructor</Typography>
                          <Typography variant="subtitle1" fontWeight={700}>{displayCourse.instructor}</Typography>
                       </Box>
                     </Stack>

                     {(headerRound || (hasRole('instructor') && roundsCount > 0)) && (
                       <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ opacity: 0.7, mr: 1 }}>Current Round:</Typography>
                          {headerRound && (
                            <>
                              <Chip
                                icon={<Iconify icon="solar:calendar-mark-bold" width={14} />}
                                label={headerRound.name}
                                sx={{ bgcolor: 'white', color: 'black', fontWeight: 700 }}
                              />
                               <Chip
                                label={String(headerRound.status).toUpperCase()}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                              />
                            </>
                          )}
                       </Box>
                     )}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                   <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: 'rgba(0,0,0,0.3)', 
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Course Progress</Typography>
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                         {/* Circular Progress Placeholder - CSS based */}
                         <Box sx={{ 
                            position: 'relative', 
                            width: 120, 
                            height: 120, 
                            borderRadius: '50%',
                            background: `conic-gradient(${theme.palette.primary.main} ${progressPercent * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                         }}>
                            <Box sx={{ 
                               width: 104, 
                               height: 104, 
                               borderRadius: '50%', 
                               bgcolor: '#2d2d2d', // Match dark bg slightly
                               display: 'flex',
                               flexDirection: 'column',
                               alignItems: 'center',
                               justifyContent: 'center'
                            }}>
                               <Typography variant="h4" fontWeight={800}>{Math.round(progressPercent)}%</Typography>
                            </Box>
                         </Box>
                      </Box>
                      <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
                          {displayCourse.completedLessons} of {displayCourse.totalLessons} lessons completed
                      </Typography>
                   </Box>
                </Grid>
             </Grid>
           </Box>
        </Box>

        {/* Floating Navigation Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
           <Card sx={{ 
              p: 1, 
              borderRadius: 50, 
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              boxShadow: theme.shadows[10],
              display: 'inline-flex'
           }}>
             <Tabs
               value={currentTab}
               onChange={handleTabChange}
               variant="scrollable"
               scrollButtons="auto"
               sx={{
                 '& .MuiTabs-indicator': { 
                    height: '100%', 
                    borderRadius: 50, 
                    zIndex: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                 },
                 '& .MuiTabs-flexContainer': { gap: 1 },
                 '& .MuiTab-root': {
                   minHeight: 48,
                   minWidth: 100,
                   borderRadius: 50,
                   textTransform: 'none',
                   fontWeight: 700,
                   zIndex: 1,
                   transition: 'all 0.3s',
                   color: 'text.secondary',
                   '&.Mui-selected': {
                     color: 'primary.main',
                   }
                 }
               }}
             >
               {tabs.map((tab) => (
                 <Tab 
                   key={tab.value} 
                   label={tab.label} 
                   icon={<Iconify icon={tab.icon} width={20} />} 
                   iconPosition="start"
                   disableRipple
                 />
               ))}
             </Tabs>
           </Card>
        </Box>

        {/* Overview Tab */}
        {currentTab === 0 && (
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Course Details */}
                <Card sx={{ 
                    p: { xs: 3, md: 5 }, 
                    mb: 3, 
                    borderRadius: 4,
                    boxShadow: theme.shadows[5],
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(20px)'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      About this Course
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 4, fontSize: '1.1rem' }}>
                      {displayCourse.description}
                    </Typography>

                    {/* At a glance */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 5 }}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Level</Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.main">{displayCourse.level}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Weeks</Typography>
                        <Typography variant="h6" fontWeight={800} color="info.main">{weeksSorted.length}</Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Lessons</Typography>
                        <Typography variant="h6" fontWeight={800} color="success.main">{displayCourse.totalLessons}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                      What you&apos;ll learn
                    </Typography>
                    <Grid container spacing={2}>
                        {whatYouWillLearnItems.map((item, index) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={item.id ?? index}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main', mt: 0.25 }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body1" fontWeight={800}>
                                  {item.title}
                                </Typography>
                                {item.mainLessons.length > 0 && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 600 }}>
                                    {item.mainLessons.join(' • ')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Next Class */}
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
                        color: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: theme.shadows[10]
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <Iconify icon="solar:videocamera-record-bold-duotone" width={24} color="white" />
                            </Box>
                            <Typography variant="h6" fontWeight={800}>Next Live Session</Typography>
                          </Box>

                          {nextZoomMeeting ? (
                            <>
                              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                {nextZoomMeeting.topic}
                              </Typography>
                              
                              <Stack spacing={1.5} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                   <Iconify icon="solar:calendar-mark-bold" width={18} sx={{ opacity: 0.8 }} />
                                   <Typography variant="body2" fontWeight={600}>{new Date(nextZoomMeeting.meetingDateTime).toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                   <Iconify icon="solar:hourglass-line-bold" width={18} sx={{ opacity: 0.8 }} />
                                   <Typography variant="body2" fontWeight={600} sx={{ color: '#FFD700' }}>{nextZoomCountdown || 'Upcoming'}</Typography>
                                </Box>
                                {(nextZoomMeeting.meetingId || nextZoomMeeting.passcode) && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {nextZoomMeeting.meetingId && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                        <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace' }}>
                                          ID: {nextZoomMeeting.meetingId}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => copyToClipboard(nextZoomMeeting.meetingId!)}
                                          sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white' }}
                                        >
                                          <Iconify icon="solar:copy-bold" width={18} />
                                        </IconButton>
                                      </Box>
                                    )}
                                    {nextZoomMeeting.passcode && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                        <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace' }}>
                                          Pass: {nextZoomMeeting.passcode}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => copyToClipboard(nextZoomMeeting.passcode!)}
                                          sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white' }}
                                        >
                                          <Iconify icon="solar:copy-bold" width={18} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Stack>
                              
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<Iconify icon="solar:play-bold" />}
                                href={nextZoomMeeting.meetingLink}
                                target="_blank"
                                sx={{ 
                                    bgcolor: 'white', 
                                    color: 'primary.dark', 
                                    fontWeight: 800,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                }}
                              >
                                Join Session
                              </Button>
                            </>
                          ) : (
                             <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>No upcoming sessions scheduled.</Typography>
                             </Box>
                          )}
                      </Box>

                      {/* Geometric Shapes */}
                      <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
                    </Card>

                    {/* Stats */}
                    <Card sx={{ p: 3, ...premiumGlass(theme) }}>
                       <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>Overview</Typography>
                       <Stack spacing={2}>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                               <Typography variant="body2" color="text.secondary" fontWeight={600}>Skill Level</Typography>
                               <Chip label={displayCourse.level} size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1 }} />
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                               <Typography variant="body2" color="text.secondary" fontWeight={600}>Certificate</Typography>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Iconify icon="solar:verified-check-bold" color={theme.palette.success.main} width={16} />
                                  <Typography variant="body2" fontWeight={700} color="success.main">Yes</Typography>
                               </Box>
                           </Box>
                       </Stack>
                    </Card>
                 </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Curriculum Tab (Student view) */}
        {currentTab === 3 && (
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
              Curriculum
            </Typography>

            {weeksSorted.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weeksSorted.map((w, idx) => (
                  <Card key={w.id} sx={{ ...premiumGlass(theme), overflow: 'hidden', mb: 1, '&:before': { content: '""', position: 'absolute', top: 0, left: 0, width: 6, bottom: 0, bgcolor: 'primary.main' } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                            Week {idx + 1}: {w.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Iconify icon="solar:calendar-date-bold" width={16} />
                            {new Date(w.startDate).toLocaleDateString()} - {new Date(w.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip label="Week" color="primary" variant="filled" sx={{ borderRadius: 1, fontWeight: 700 }} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : modules.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ 
                      ...premiumGlass(theme), 
                      overflow: 'visible', 
                      transition: 'all 0.3s', 
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] } 
                  }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
                        <Box>
                          <Typography variant="overline" color="primary.main" fontWeight={800} sx={{ letterSpacing: 1.2 }}>
                             MODULE {idx + 1}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                             {module.title}
                          </Typography>
                          {module.description && (
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                              {module.description}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                              icon={<Iconify icon="solar:documents-bold" width={16} />}
                              label={`${module.lessons.length} Lessons`} 
                              sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 1 }} 
                          />
                          {(hasRole('instructor') || hasRole('admin')) && (
                             <Box>
                                <IconButton size="small" onClick={() => handleEditWeek(module)}>
                                    <Iconify icon="solar:pen-bold" width={20} />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteWeek(module.id)}>
                                    <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                </IconButton>
                             </Box>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {module.lessons.length === 0 ? (
                          <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, border: `1px dashed ${theme.palette.divider}` }}>
                             <Typography variant="body2" color="text.secondary">No lessons added yet.</Typography>
                          </Box>
                        ) : (
                          module.lessons.map((lesson) => (
                            <Card
                              key={lesson.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 'none',
                                border: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                   <Box sx={{ 
                                       width: 40, height: 40, borderRadius: '50%', 
                                       bgcolor: 'background.paper', 
                                       border: `2px solid ${theme.palette.primary.main}`,
                                       color: 'primary.main',
                                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                                       fontWeight: 800
                                   }}>
                                       {lesson.order}
                                   </Box>
                                   <Box>
                                       <Typography variant="subtitle1" fontWeight={700}>
                                           {lesson.title}
                                       </Typography>
                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                           <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                                               <Iconify icon="solar:clock-circle-bold" width={14} />
                                               {lesson.duration}m
                                           </Typography>
                                           <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                                               <Iconify icon="solar:play-circle-bold" width={14} />
                                               Video
                                           </Typography>
                                       </Box>
                                   </Box>
                               </Box>
                               
                               <IconButton color="primary">
                                   <Iconify icon="solar:play-bold" width={24} />
                               </IconButton>
                            </Card>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card sx={{ p: 6, textAlign: 'center', ...premiumGlass(theme) }}>
                <Iconify icon="solar:notebook-minimalistic-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No curriculum has been published yet.
                </Typography>
              </Card>
            )}
          </Box>
        )}

        {/* Weeks Tab - Instructor only (backend weeks) */}
        {hasRole('instructor') && currentTab === 4 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Weeks</Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                onClick={openCreateWeekDialog}
                disabled={!activeRoundId}
              >
                Add Week
              </Button>
            </Box>

            {!activeRoundId && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a course round to manage weeks.
                </Typography>
              </Card>
            )}

            {activeRoundId && weeksSorted.length === 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No weeks created yet.
                </Typography>
              </Card>
            )}

            {weeksSorted.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {weeksSorted.map((w, idx) => (
                  <Card key={w.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                            Week {idx + 1}: {w.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(w.startDate).toLocaleDateString()} - {new Date(w.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => openEditWeekDialog(w)} aria-label="Edit week">
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => deleteWeek(w.id)} aria-label="Delete week">
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            <Dialog open={weekDialogOpen} onClose={() => setWeekDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>{editWeekId ? 'Edit Week' : 'Add Week'}</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Title"
                  sx={{ mt: 1 }}
                  value={weekForm.title}
                  onChange={(e) => setWeekForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={weekForm.startDate}
                    onChange={(e) => setWeekForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={weekForm.endDate}
                    onChange={(e) => setWeekForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setWeekDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={saveWeek}
                  disabled={!weekForm.title.trim() || !weekForm.startDate || !weekForm.endDate}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Content (Weeks) Tab - Instructor only */}
        {hasRole('instructor') && currentTab === 5 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Course Content (Weeks)</Typography>
              <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold-duotone" />} onClick={handleAddWeek}>
                Add Week
              </Button>
            </Box>

            {modules.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                 <Iconify icon="solar:folder-with-files-bold-duotone" width={64} sx={{ color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No weeks added yet. Click &quot;Add Week&quot; to create the first week.
                </Typography>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {modules.map((module, idx) => (
                  <Card key={module.id} sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>Week {idx + 1}: {module.title}</Typography>
                          {module.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{module.description}</Typography>
                          )}
                        </Box>
                        <Chip label={`${module.lessons.length} lessons`} color="primary" variant="outlined" />
                      </Box>

                      {/* Lessons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        {module.lessons.map((lesson) => (
                          <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                {lesson.order}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {lesson.title}
                                </Typography>
                                {lesson.description && (
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {lesson.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip label={`${lesson.duration}m`} size="small" variant="outlined" />
                              <IconButton size="small" onClick={() => handleEditLesson(module.id, lesson)} aria-label="Edit lesson">
                                <Iconify icon="solar:pen-bold" width={18} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteLesson(module.id, lesson.id)} aria-label="Delete lesson">
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ borderTop: `1px dashed ${theme.palette.divider}`, p: 2 }}>
                      <Button variant="text" startIcon={<Iconify icon="solar:add-circle-bold" />} onClick={() => handleAddLesson(module.id)}>
                        Add Lesson
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {/* Add Week Dialog */}
            <Dialog open={addWeekDialog} onClose={() => setAddWeekDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Week</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Week Title" sx={{ mt: 1 }} value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newWeekDescription} onChange={(e) => setNewWeekDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddWeekDialog(false)}>Cancel</Button>
                <Button variant="contained" onClick={saveNewWeek} disabled={!newWeekTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>

            {/* Add Lesson Dialog */}
            <Dialog open={addLessonDialog.open} onClose={() => setAddLessonDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Lesson</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Lesson Title" sx={{ mt: 1 }} value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={newLessonDescription} onChange={(e) => setNewLessonDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveNewLesson} disabled={!newLessonTitle.trim()}>Save</Button>
              </DialogActions>
            </Dialog>

            <Dialog open={editWeekDialog.open} onClose={() => setEditWeekDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Week</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Week Title" sx={{ mt: 1 }} value={editWeekTitle} onChange={(e) => setEditWeekTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={editWeekDescription} onChange={(e) => setEditWeekDescription(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditWeekDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveEditedWeek} disabled={!editWeekTitle.trim()}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={deleteWeekDialog.open} onClose={() => setDeleteWeekDialog({ open: false })} maxWidth="xs" fullWidth>
              <DialogTitle>Delete Week</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This will permanently delete the week and all lessons inside it.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteWeekDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" color="error" onClick={confirmDeleteWeek}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={editLessonDialog.open} onClose={() => setEditLessonDialog({ open: false })} maxWidth="sm" fullWidth>
              <DialogTitle>Edit Lesson</DialogTitle>
              <DialogContent>
                <TextField fullWidth label="Lesson Title" sx={{ mt: 1 }} value={editLessonTitle} onChange={(e) => setEditLessonTitle(e.target.value)} />
                <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={editLessonDescription} onChange={(e) => setEditLessonDescription(e.target.value)} />
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  sx={{ mt: 2 }}
                  type="number"
                  value={editLessonDuration}
                  onChange={(e) => setEditLessonDuration(Number(e.target.value))}
                />
                <TextField
                  fullWidth
                  label="Content"
                  sx={{ mt: 2 }}
                  multiline
                  rows={6}
                  value={editLessonContent}
                  onChange={(e) => setEditLessonContent(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" onClick={saveEditedLesson} disabled={!editLessonTitle.trim()}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={deleteLessonDialog.open} onClose={() => setDeleteLessonDialog({ open: false })} maxWidth="xs" fullWidth>
              <DialogTitle>Delete Lesson</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This will permanently delete the lesson.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteLessonDialog({ open: false })}>Cancel</Button>
                <Button variant="contained" color="error" onClick={confirmDeleteLesson}>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={editMaterialDialogOpen}
              onClose={() => {
                setEditMaterialDialogOpen(false);
                setEditMaterialId(null);
              }}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Edit Material</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Title"
                    value={editMaterialForm.title}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, title: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={editMaterialForm.description}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Link"
                    value={editMaterialForm.link}
                    onChange={(e) => setEditMaterialForm({ ...editMaterialForm, link: e.target.value })}
                    required
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      value={editMaterialForm.materialTypeStatusId}
                      onChange={(e) =>
                        setEditMaterialForm({ ...editMaterialForm, materialTypeStatusId: Number(e.target.value) })
                      }
                      label="Material Type"
                    >
                      <MenuItem value={32}>PDF</MenuItem>
                      <MenuItem value={33}>Video</MenuItem>
                      <MenuItem value={34}>ZoomLink</MenuItem>
                      <MenuItem value={35}>General</MenuItem>
                      <MenuItem value={36}>Quiz</MenuItem>
                      <MenuItem value={37}>PowerPoint</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Active</InputLabel>
                    <Select
                      value={editMaterialForm.isActive ? 'true' : 'false'}
                      onChange={(e) => setEditMaterialForm({ ...editMaterialForm, isActive: e.target.value === 'true' })}
                      label="Active"
                    >
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setEditMaterialDialogOpen(false);
                    setEditMaterialId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateMaterial}
                  disabled={!editMaterialForm.title.trim() || !editMaterialForm.link.trim()}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Materials Tab */}
        {currentTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Course Materials</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ToggleButtonGroup
                  value={materialsView}
                  exclusive
                  size="small"
                  onChange={(_, next) => {
                    if (!next) return;
                    setMaterialsView(next);
                  }}
                  sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5) }}
                >
                  <ToggleButton value="grid" aria-label="Grid view">
                    <Iconify icon="solar:widget-3-bold-duotone" width={18} />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="List view">
                    <Iconify icon="solar:list-bold-duotone" width={18} />
                  </ToggleButton>
                </ToggleButtonGroup>
                {hasRole('instructor') && roundsForCourse.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Round</InputLabel>
                    <Select
                      value={activeRoundId ?? ''}
                      label="Round"
                      onChange={(e) => setSelectedRoundId(String(e.target.value))}
                    >
                      {roundsForCourse.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {hasRole('instructor') && (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:upload-square-bold-duotone" />}
                    onClick={() => setMaterialDialogOpen(true)}
                    disabled={!activeRoundId}
                  >
                    Upload Material
                  </Button>
                )}
              </Box>
            </Box>

            {roundDataError && (
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="error">
                  {roundDataError}
                </Typography>
              </Card>
            )}

            {!activeRoundId && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a course round to view materials.
                </Typography>
              </Card>
            )}

            {activeRoundId && materialsByWeek.every((w) => w.items.length === 0) && (
              <Card sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No materials added yet.
                </Typography>
              </Card>
            )}

            {materialsView === 'grid' ? (
              <Grid container spacing={2}>
                {materialsByWeek.map((weekGroup, weekIdx) => {
                  const weekKey = String(weekGroup.weekId);
                  const expanded = expandedWeekIds[weekKey] ?? true;

                  return (
                    <Grid key={weekGroup.weekId} size={{ xs: 12, md: 6 }}>
                      <Accordion
                        expanded={expanded}
                        onChange={() => setExpandedWeekIds((prev) => ({ ...prev, [weekKey]: !expanded }))}
                        disableGutters
                        sx={{
                          ...premiumGlass(theme),
                          overflow: 'hidden',
                          animation: `${fadeIn} 0.45s ease-out ${weekIdx * 0.08}s backwards`,
                          '&:before': { display: 'none' },
                        }}
                      >
                    <AccordionSummary
                      expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={18} />}
                      sx={{
                        px: 3,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.10)}, ${alpha(theme.palette.info.main, 0.08)})`,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                        '& .MuiAccordionSummary-content': { my: 0 },
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              color: 'primary.main',
                            }}
                          >
                            <Iconify icon="solar:calendar-mark-bold-duotone" width={22} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                              {weekGroup.weekTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                              {weekGroup.startDate ? new Date(weekGroup.startDate).toLocaleDateString() : '—'} -{' '}
                              {weekGroup.endDate ? new Date(weekGroup.endDate).toLocaleDateString() : '—'}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip label={`${weekGroup.items.length} items`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 3 }}>
                      {weekGroup.items.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No materials for this week yet.
                        </Typography>
                      ) : materialsView === 'grid' ? (
                        <Grid container spacing={2.5}>
                          {weekGroup.items.map(({ main, children }) => {
                            const meta = getMaterialMeta(main);

                            return (
                              <Grid key={main.id} size={{ xs: 12, md: 6 }}>
                                <Card
                                  sx={{
                                    p: 2.25,
                                    borderRadius: 2.5,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.35),
                                    transition: 'all 0.25s',
                                    cursor: main.link ? 'pointer' : 'default',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.background.default, 0.5),
                                      borderColor: alpha(theme.palette.primary.main, 0.35),
                                    },
                                  }}
                                  onClick={() => openLink(main.link)}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Box
                                      sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2.25,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.14)})`,
                                        color: 'primary.main',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Iconify icon={meta.icon} width={28} />
                                    </Box>

                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                          {main.title}
                                        </Typography>
                                        <Chip
                                          size="small"
                                          variant="filled"
                                          label={meta.label}
                                          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 900, borderRadius: 1 }}
                                        />
                                      </Box>

                                      {main.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                                          {main.description}
                                        </Typography>
                                      )}

                                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openLink(main.link);
                                          }}
                                          disabled={!main.link}
                                          sx={{ borderRadius: 2, fontWeight: 900 }}
                                        >
                                          Open
                                        </Button>

                                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 800 }}>
                                          {main.createdAt ? new Date(main.createdAt).toLocaleDateString() : ''}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {hasRole('instructor') && (
                                      <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                        <IconButton onClick={() => handleOpenEditMaterial(main)} aria-label="Edit material" size="small" sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                          <Iconify icon="solar:pen-bold" width={20} />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDeleteMaterial(main.id)} aria-label="Delete material" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                          <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Box>

                                  {children.length > 0 && (
                                    <Box sx={{ mt: 2, pl: { xs: 0, md: 8 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      {children.map((child) => {
                                        const childMeta = getMaterialMeta(child);

                                        return (
                                          <Box
                                            key={child.id}
                                            onClick={() => openLink(child.link)}
                                            role="button"
                                            tabIndex={0}
                                            sx={{
                                              p: 1.75,
                                              borderRadius: 2,
                                              bgcolor: alpha(theme.palette.background.paper, 0.65),
                                              border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: 2,
                                              cursor: child.link ? 'pointer' : 'default',
                                              '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.35) },
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                              <Iconify icon={childMeta.icon} width={18} />
                                              <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                                  {child.title}
                                                </Typography>
                                                {child.description && (
                                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                                    {child.description}
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Box>

                                            <Button
                                              size="small"
                                              variant="text"
                                              startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openLink(child.link);
                                              }}
                                              disabled={!child.link}
                                              sx={{ fontWeight: 900 }}
                                            >
                                              Open
                                            </Button>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Stack spacing={2}>
                          {weekGroup.items.map(({ main, children }) => {
                            const meta = getMaterialMeta(main);

                            return (
                              <Card
                                key={main.id}
                                sx={{
                                  p: 2.25,
                                  borderRadius: 2.5,
                                  border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
                                  bgcolor: alpha(theme.palette.background.default, 0.35),
                                  cursor: main.link ? 'pointer' : 'default',
                                }}
                                onClick={() => openLink(main.link)}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                                      color: 'primary.main',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Iconify icon={meta.icon} width={24} />
                                  </Box>

                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                        {main.title}
                                      </Typography>
                                      <Chip size="small" label={meta.label} sx={{ fontWeight: 900 }} />
                                    </Box>
                                    {main.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {main.description}
                                      </Typography>
                                    )}
                                  </Box>

                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLink(main.link);
                                    }}
                                    disabled={!main.link}
                                    sx={{ borderRadius: 2, fontWeight: 900 }}
                                  >
                                    Open
                                  </Button>

                                  {hasRole('instructor') && (
                                    <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                      <IconButton onClick={() => handleOpenEditMaterial(main)} aria-label="Edit material" size="small" sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                        <Iconify icon="solar:pen-bold" width={20} />
                                      </IconButton>
                                      <IconButton color="error" onClick={() => handleDeleteMaterial(main.id)} aria-label="Delete material" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>

                                {children.length > 0 && (
                                  <Box sx={{ mt: 2, pl: { xs: 0, md: 7 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {children.map((child) => {
                                      const childMeta = getMaterialMeta(child);

                                      return (
                                        <Box
                                          key={child.id}
                                          onClick={() => openLink(child.link)}
                                          role="button"
                                          tabIndex={0}
                                          sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                                            bgcolor: alpha(theme.palette.background.paper, 0.65),
                                            cursor: child.link ? 'pointer' : 'default',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                          }}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Iconify icon={childMeta.icon} width={18} />
                                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                              {child.title}
                                            </Typography>
                                          </Box>
                                          <Iconify icon="solar:arrow-right-bold" width={18} />
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                )}
                              </Card>
                            );
                          })}
                        </Stack>
                      )}
                    </AccordionDetails>
                      </Accordion>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {materialsByWeek.map((weekGroup, weekIdx) => {
                  const weekKey = String(weekGroup.weekId);
                  const expanded = expandedWeekIds[weekKey] ?? true;

                  return (
                    <Accordion
                      key={weekGroup.weekId}
                      expanded={expanded}
                      onChange={() => setExpandedWeekIds((prev) => ({ ...prev, [weekKey]: !expanded }))}
                      disableGutters
                      sx={{
                        ...premiumGlass(theme),
                        overflow: 'hidden',
                        animation: `${fadeIn} 0.45s ease-out ${weekIdx * 0.08}s backwards`,
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={18} />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.10)}, ${alpha(theme.palette.info.main, 0.08)})`,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                          '& .MuiAccordionSummary-content': { my: 0 },
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: 'primary.main',
                              }}
                            >
                              <Iconify icon="solar:calendar-mark-bold-duotone" width={22} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                {weekGroup.weekTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                {weekGroup.startDate ? new Date(weekGroup.startDate).toLocaleDateString() : '—'} -{' '}
                                {weekGroup.endDate ? new Date(weekGroup.endDate).toLocaleDateString() : '—'}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip label={`${weekGroup.items.length} items`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 3 }}>
                        {weekGroup.items.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No materials for this week yet.
                          </Typography>
                        ) : (
                          <Stack spacing={2}>
                            {weekGroup.items.map(({ main, children }) => {
                              const meta = getMaterialMeta(main);

                              return (
                                <Card
                                  key={main.id}
                                  sx={{
                                    p: 2.25,
                                    borderRadius: 2.5,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
                                    bgcolor: alpha(theme.palette.background.default, 0.35),
                                    cursor: main.link ? 'pointer' : 'default',
                                  }}
                                  onClick={() => openLink(main.link)}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Iconify icon={meta.icon} width={24} />
                                    </Box>

                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                          {main.title}
                                        </Typography>
                                        <Chip size="small" label={meta.label} sx={{ fontWeight: 900 }} />
                                      </Box>
                                      {main.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                          {main.description}
                                        </Typography>
                                      )}
                                    </Box>

                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLink(main.link);
                                      }}
                                      disabled={!main.link}
                                      sx={{ borderRadius: 2, fontWeight: 900 }}
                                    >
                                      Open
                                    </Button>
                                  </Box>

                                  {children.length > 0 && (
                                    <Box sx={{ mt: 2, pl: { xs: 0, md: 7 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                      {children.map((child) => {
                                        const childMeta = getMaterialMeta(child);

                                        return (
                                          <Box
                                            key={child.id}
                                            onClick={() => openLink(child.link)}
                                            role="button"
                                            tabIndex={0}
                                            sx={{
                                              p: 1.5,
                                              borderRadius: 2,
                                              border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                                              bgcolor: alpha(theme.palette.background.paper, 0.65),
                                              cursor: child.link ? 'pointer' : 'default',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: 2,
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                              <Iconify icon={childMeta.icon} width={18} />
                                              <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                                {child.title}
                                              </Typography>
                                            </Box>
                                            <Iconify icon="solar:arrow-right-bold" width={18} />
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Card>
                              );
                            })}
                          </Stack>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            )}

            <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Upload Material</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Title"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Link"
                    value={materialForm.link}
                    onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                    required
                    fullWidth
                    placeholder="https://example.com/material.pdf"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      value={materialForm.materialTypeStatusId}
                      onChange={(e) => setMaterialForm({ ...materialForm, materialTypeStatusId: Number(e.target.value) })}
                      label="Material Type"
                    >
                      <MenuItem value={32}>PDF</MenuItem>
                      <MenuItem value={33}>Video</MenuItem>
                      <MenuItem value={34}>ZoomLink</MenuItem>
                      <MenuItem value={35}>General</MenuItem>
                      <MenuItem value={36}>Quiz</MenuItem>
                      <MenuItem value={37}>PowerPoint</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleCreateMaterial} disabled={!materialForm.title.trim() || !materialForm.link.trim()}>
                  Upload
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Zoom Sessions Tab */}
        {currentTab === 2 && (
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Zoom Sessions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {hasRole('instructor') && roundsForCourse.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Round</InputLabel>
                    <Select
                      value={activeRoundId ?? ''}
                      label="Round"
                      onChange={(e) => setSelectedRoundId(String(e.target.value))}
                      sx={{ borderRadius: 2 }}
                    >
                      {roundsForCourse.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {hasRole('instructor') && (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:videocamera-add-bold" />}
                    onClick={() => setZoomDialogOpen(true)}
                    disabled={!activeRoundId}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Add Zoom
                  </Button>
                )}
              </Box>
            </Box>

            {roundDataError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {roundDataError}
              </Alert>
            )}

            {!activeRoundId && (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.divider}` }}>
                <Typography variant="body1" color="text.secondary">
                  Select a course round to view zoom meetings.
                </Typography>
              </Card>
            )}

            {activeRoundId && zoomLinksByWeek.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Zoom Links
                </Typography>
                <Stack spacing={1.5}>
                  {zoomLinksByWeek.map((w) => (
                    <Accordion
                      key={w.weekId}
                      defaultExpanded
                      disableGutters
                      sx={{
                        ...premiumGlass(theme),
                        overflow: 'hidden',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={18} />}
                        sx={{
                          px: 2.5,
                          py: 1.25,
                          bgcolor: alpha(theme.palette.info.main, 0.08),
                          borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.14)}`,
                          '& .MuiAccordionSummary-content': { my: 0 },
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
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
                              <Iconify icon="solar:videocamera-bold-duotone" width={20} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                              {w.weekTitle}
                            </Typography>
                          </Box>
                          <Chip label={`${w.items.length} links`} size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 2.5 }}>
                        <Stack spacing={1.25}>
                          {w.items.map((m) => (
                            <Box
                              key={m.id}
                              onClick={() => openLink(m.link)}
                              role="button"
                              tabIndex={0}
                              sx={{
                                p: 1.75,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                                bgcolor: alpha(theme.palette.background.paper, 0.65),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                cursor: m.link ? 'pointer' : 'default',
                                '&:hover': { borderColor: alpha(theme.palette.info.main, 0.35) },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                <Iconify icon="solar:videocamera-bold" width={18} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                    {m.title}
                                  </Typography>
                                  {m.description && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                      {m.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLink(m.link);
                                }}
                                disabled={!m.link}
                                sx={{ borderRadius: 2, fontWeight: 900 }}
                              >
                                Join
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Box>
            )}

            {activeRoundId && zoomMeetings.length === 0 && zoomLinksByWeek.length === 0 && (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                 <Iconify icon="solar:videocamera-record-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No zoom meetings scheduled yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                   Live sessions will appear here once scheduled by the instructor.
                </Typography>
              </Card>
            )}

            {activeRoundId && zoomMeetings.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Upcoming Sessions
                  </Typography>
                  <Chip label={`${zoomMeetingsByTime.upcoming.length} upcoming`} size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                </Box>
                <Grid container spacing={3}>
                  {zoomMeetingsByTime.upcoming.map((meeting, idx) => (
                    <Grid key={meeting.id} size={{ xs: 12, md: 6 }}>
                    <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        ...premiumGlass(theme),
                        animation: `${fadeIn} 0.5s ease-out ${idx * 0.1}s backwards`,
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[16] }
                    }}>
                       <Box sx={{ 
                          p: 1.5, 
                          bgcolor: alpha(theme.palette.info.main, 0.1), 
                          color: 'info.main', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                       }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Iconify icon="solar:videocamera-bold" width={20} />
                              <Typography variant="subtitle2" fontWeight={700}>LIVE CLASS</Typography>
                           </Box>
                           {hasRole('instructor') && (
                            <IconButton color="error" size="small" onClick={() => handleDeleteZoomMeeting(meeting.id)}>
                              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                            </IconButton>
                          )}
                       </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.25rem' }}>
                              {meeting.topic}
                        </Typography>
                        
                        {meeting.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {meeting.description}
                              </Typography>
                         )}

                         <Stack spacing={1.5}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Iconify icon="solar:calendar-mark-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight={600}>{new Date(meeting.meetingDateTime).toLocaleString()}</Typography>
                             </Box>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
                                <Typography variant="body2" fontWeight={600}>{meeting.durationMinutes} Minutes</Typography>
                             </Box>
                             {meeting.passcode && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Iconify icon="solar:key-bold-duotone" width={20} sx={{ color: 'success.main' }} />
                                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', bgcolor: 'background.neutral', px: 1, borderRadius: 0.5 }}>
                                        Pass: {meeting.passcode}
                                    </Typography>
                                </Box>
                             )}
                             {meeting.meetingId && (
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                 <Iconify icon="solar:hashtag-bold-duotone" width={20} sx={{ color: 'info.main' }} />
                                 <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', bgcolor: 'background.neutral', px: 1, borderRadius: 0.5 }}>
                                   ID: {meeting.meetingId}
                                 </Typography>
                               </Box>
                             )}
                         </Stack>
                      </CardContent>

                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Iconify icon="solar:play-circle-bold" />}
                          href={meeting.meetingLink}
                          target="_blank"
                          sx={{ 
                              borderRadius: 2, 
                              background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`
                          }}
                        >
                          Join Meeting
                        </Button>
                      </CardActions>
                    </Card>
                    </Grid>
                  ))}
                </Grid>

                {zoomMeetingsByTime.past.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Past Sessions
                      </Typography>
                      <Chip label={`${zoomMeetingsByTime.past.length} past`} size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                    </Box>
                    <Grid container spacing={3}>
                      {zoomMeetingsByTime.past.map((meeting, idx) => (
                        <Grid key={meeting.id} size={{ xs: 12, md: 6 }}>
                          <Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              ...premiumGlass(theme),
                              opacity: 0.85,
                              animation: `${fadeIn} 0.5s ease-out ${idx * 0.08}s backwards`,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(theme.palette.grey[500], 0.12),
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon="solar:history-bold-duotone" width={20} />
                                <Typography variant="subtitle2" fontWeight={700}>
                                  PAST CLASS
                                </Typography>
                              </Box>
                              {hasRole('instructor') && (
                                <IconButton color="error" size="small" onClick={() => handleDeleteZoomMeeting(meeting.id)}>
                                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                </IconButton>
                              )}
                            </Box>

                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.25rem' }}>
                                {meeting.topic}
                              </Typography>
                              <Stack spacing={1.25}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Iconify icon="solar:calendar-mark-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                                  <Typography variant="body2" fontWeight={600}>
                                    {new Date(meeting.meetingDateTime).toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Iconify icon="solar:clock-circle-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                                  <Typography variant="body2" fontWeight={600}>
                                    {meeting.durationMinutes} Minutes
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>

                            <CardActions sx={{ p: 3, pt: 0 }}>
                              <Button
                                variant="outlined"
                                fullWidth
                                size="large"
                                startIcon={<Iconify icon="solar:link-bold" />}
                                href={meeting.meetingLink}
                                target="_blank"
                                sx={{ borderRadius: 2, fontWeight: 800 }}
                              >
                                Open Link
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
            {/* Dialogs remain unchanged... */}
            <Dialog open={zoomDialogOpen} onClose={() => setZoomDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add Zoom Meeting</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Topic"
                    value={zoomForm.topic}
                    onChange={(e) => setZoomForm({ ...zoomForm, topic: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={zoomForm.description}
                    onChange={(e) => setZoomForm({ ...zoomForm, description: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Meeting Link"
                    value={zoomForm.meetingLink}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingLink: e.target.value })}
                    required
                    fullWidth
                    placeholder="https://zoom.us/j/123456789"
                  />
                  <TextField
                    label="Meeting ID (optional)"
                    value={zoomForm.meetingId}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingId: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Passcode (optional)"
                    value={zoomForm.passcode}
                    onChange={(e) => setZoomForm({ ...zoomForm, passcode: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    value={zoomForm.meetingDateTime}
                    onChange={(e) => setZoomForm({ ...zoomForm, meetingDateTime: e.target.value })}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={zoomForm.durationMinutes}
                    onChange={(e) => setZoomForm({ ...zoomForm, durationMinutes: Number(e.target.value) })}
                    required
                    fullWidth
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setZoomDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleCreateZoomMeeting} disabled={!zoomForm.topic.trim() || !zoomForm.meetingLink.trim()}>
                  Add Zoom
                </Button>
              </DialogActions>
            </Dialog>
           
          </Box>
        )}

 

      </Container>
    </DashboardContent>
  );
}
