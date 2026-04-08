import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Tooltip,
  LinearProgress,
  Badge,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  School,
  Add,
  Refresh,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  History,
  Person,
  Description,
  AttachFile,
  CalendarToday,
  TrendingUp,
  FilterList,
  Download,
  Assessment,
  ThumbUp,
  ThumbDown,
  Schedule,
  Star,
  StarBorder,
  ExpandMore,
  Group,
  Assignment,
  MenuBook,
  VideoLibrary,
  Security,
  Psychology,
  Engineering
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';

export default function Training() {
  // State
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [trainings, setTrainings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'new', 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state for new training
  const [trainingForm, setTrainingForm] = useState({
    name: '',
    description: '',
    department: '',
    durationDays: 1,
    isMandatory: false,
    type: 'technical',
    prerequisites: ''
  });

  // Session form
  const [sessionForm, setSessionForm] = useState({
    trainingId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    trainer: '',
    location: '',
    maxParticipants: 10,
    notes: ''
  });

  // Evaluation form
  const [evaluationForm, setEvaluationForm] = useState({
    score: 0,
    feedback: '',
    status: 'completed'
  });

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    type: '',
    status: ''
  });

  // Mock data - Training Types
  const trainingTypes = [
    { id: 'technical', name: 'Technical Training', icon: <Engineering />, color: '#2E7D32' },
    { id: 'safety', name: 'Safety Training', icon: <Security />, color: '#C62828' },
    { id: 'soft', name: 'Soft Skills', icon: <Psychology />, color: '#1565C0' },
    { id: 'orientation', name: 'Orientation', icon: <School />, color: '#F57C00' }
  ];

  // Mock data - Departments
  const departments = [
    { id: 1, name: 'Production' },
    { id: 2, name: 'Quality Control' },
    { id: 3, name: 'Maintenance' },
    { id: 4, name: 'Warehouse' },
    { id: 5, name: 'Administration' }
  ];

  // Mock data - Trainings
  useEffect(() => {
    setTrainings([
      {
        id: 1,
        name: 'Machine Operation - Biscuit Line',
        description: 'Comprehensive training on operating biscuit production machines safely and efficiently.',
        department: 'Production',
        departmentId: 1,
        durationDays: 3,
        isMandatory: true,
        type: 'technical',
        prerequisites: 'Basic mechanical knowledge',
        sessions: 2,
        totalEnrolled: 15,
        completed: 8,
        createdAt: '2026-01-15'
      },
      {
        id: 2,
        name: 'Food Safety & Hygiene',
        description: 'Essential food safety practices, HACCP principles, and personal hygiene standards.',
        department: 'Quality Control',
        departmentId: 2,
        durationDays: 2,
        isMandatory: true,
        type: 'safety',
        prerequisites: 'None',
        sessions: 3,
        totalEnrolled: 24,
        completed: 18,
        createdAt: '2026-01-20'
      },
      {
        id: 3,
        name: 'Forklift Operation Certification',
        description: 'Safe operation of forklifts, loading/unloading procedures, and warehouse safety.',
        department: 'Warehouse',
        departmentId: 4,
        durationDays: 3,
        isMandatory: true,
        type: 'technical',
        prerequisites: 'Valid driver license',
        sessions: 1,
        totalEnrolled: 8,
        completed: 5,
        createdAt: '2026-02-01'
      },
      {
        id: 4,
        name: 'Leadership & Supervision',
        description: 'Developing supervisory skills, team management, and effective communication.',
        department: 'Administration',
        departmentId: 5,
        durationDays: 4,
        isMandatory: false,
        type: 'soft',
        prerequisites: 'Team lead or supervisor role',
        sessions: 1,
        totalEnrolled: 6,
        completed: 2,
        createdAt: '2026-02-10'
      },
      {
        id: 5,
        name: 'Maintenance Technician Training',
        description: 'Preventive maintenance, troubleshooting, and repair of production equipment.',
        department: 'Maintenance',
        departmentId: 3,
        durationDays: 5,
        isMandatory: true,
        type: 'technical',
        prerequisites: 'Basic electrical knowledge',
        sessions: 2,
        totalEnrolled: 10,
        completed: 4,
        createdAt: '2026-02-15'
      },
      {
        id: 6,
        name: 'New Employee Orientation',
        description: 'Welcome to CodingHQ! Company policies, security practices, and engineering onboarding.',
        department: 'Administration',
        departmentId: 5,
        durationDays: 1,
        isMandatory: true,
        type: 'orientation',
        prerequisites: 'New hire',
        sessions: 4,
        totalEnrolled: 32,
        completed: 28,
        createdAt: '2026-01-05'
      }
    ]);

    setSessions([
      {
        id: 1,
        trainingId: 1,
        trainingName: 'Machine Operation - Biscuit Line',
        startDate: '2026-03-15',
        endDate: '2026-03-17',
        trainer: 'Jean-Pierre Ndi',
        location: 'Training Room A',
        maxParticipants: 10,
        enrolled: 8,
        status: 'upcoming',
        attendees: [2, 3, 5]
      },
      {
        id: 2,
        trainingId: 1,
        trainingName: 'Machine Operation - Biscuit Line',
        startDate: '2026-03-22',
        endDate: '2026-03-24',
        trainer: 'Jean-Pierre Ndi',
        location: 'Training Room A',
        maxParticipants: 10,
        enrolled: 5,
        status: 'planned',
        attendees: []
      },
      {
        id: 3,
        trainingId: 2,
        trainingName: 'Food Safety & Hygiene',
        startDate: '2026-03-10',
        endDate: '2026-03-11',
        trainer: 'Marie Claire',
        location: 'Training Room B',
        maxParticipants: 15,
        enrolled: 12,
        status: 'ongoing',
        attendees: [1, 4, 6, 7, 8, 9]
      },
      {
        id: 4,
        trainingId: 2,
        trainingName: 'Food Safety & Hygiene',
        startDate: '2026-03-18',
        endDate: '2026-03-19',
        trainer: 'Marie Claire',
        location: 'Training Room B',
        maxParticipants: 15,
        enrolled: 10,
        status: 'upcoming',
        attendees: []
      },
      {
        id: 5,
        trainingId: 3,
        trainingName: 'Forklift Operation Certification',
        startDate: '2026-03-05',
        endDate: '2026-03-07',
        trainer: 'Paul Biyong',
        location: 'Warehouse Training Area',
        maxParticipants: 8,
        enrolled: 8,
        status: 'completed',
        attendees: [10, 11, 12, 13]
      },
      {
        id: 6,
        trainingId: 6,
        trainingName: 'New Employee Orientation',
        startDate: '2026-03-01',
        endDate: '2026-03-01',
        trainer: 'HR Team',
        location: 'Conference Room',
        maxParticipants: 20,
        enrolled: 12,
        status: 'completed',
        attendees: [14, 15, 16, 17, 18]
      }
    ]);

    setEnrollments([
      { id: 1, employeeId: 2, employeeName: 'Marie Ndiaye', trainingId: 1, sessionId: 1, status: 'enrolled', enrollmentDate: '2026-03-01' },
      { id: 2, employeeId: 3, employeeName: 'Paul Biyong', trainingId: 1, sessionId: 1, status: 'enrolled', enrollmentDate: '2026-03-01' },
      { id: 3, employeeId: 1, employeeName: 'Pierre Kamga', trainingId: 2, sessionId: 3, status: 'in-progress', enrollmentDate: '2026-02-28' },
      { id: 4, employeeId: 4, employeeName: 'Jean Mbarga', trainingId: 2, sessionId: 3, status: 'completed', enrollmentDate: '2026-02-28', completionDate: '2026-03-11', score: 85 },
      { id: 5, employeeId: 5, employeeName: 'Claire Abena', trainingId: 3, sessionId: 5, status: 'completed', enrollmentDate: '2026-02-20', completionDate: '2026-03-07', score: 92 },
      { id: 6, employeeId: 6, employeeName: 'Luc Tchamba', trainingId: 6, sessionId: 6, status: 'completed', enrollmentDate: '2026-02-15', completionDate: '2026-03-01', score: 78 }
    ]);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNewTraining = () => {
    setTrainingForm({
      name: '',
      description: '',
      department: '',
      durationDays: 1,
      isMandatory: false,
      type: 'technical',
      prerequisites: ''
    });
    setDialogMode('new');
    setOpenTrainingDialog(true);
  };

  const handleEditTraining = (training) => {
    setSelectedTraining(training);
    setTrainingForm({
      name: training.name,
      description: training.description,
      department: training.departmentId,
      durationDays: training.durationDays,
      isMandatory: training.isMandatory,
      type: training.type,
      prerequisites: training.prerequisites || ''
    });
    setDialogMode('edit');
    setOpenTrainingDialog(true);
  };

  const handleViewTraining = (training) => {
    setSelectedTraining(training);
    setDialogMode('view');
    setOpenTrainingDialog(true);
  };

  const handleNewSession = (training) => {
    setSelectedTraining(training);
    setSessionForm({
      trainingId: training.id,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), training.durationDays), 'yyyy-MM-dd'),
      trainer: '',
      location: '',
      maxParticipants: 10,
      notes: ''
    });
    setOpenSessionDialog(true);
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setOpenSessionDialog(true);
  };

  const handleEnrollEmployees = (session) => {
    setSelectedSession(session);
    setOpenEnrollDialog(true);
  };

  const handleEvaluate = (enrollment) => {
    setSelectedSession(enrollment);
    setEvaluationForm({
      score: enrollment.score || 0,
      feedback: '',
      status: 'completed'
    });
    setOpenEvaluationDialog(true);
  };

  const handleSaveTraining = () => {
    if (!trainingForm.name || !trainingForm.department || !trainingForm.type) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }
    showSnackbar(dialogMode === 'new' ? 'Training program created' : 'Training program updated', 'success');
    setOpenTrainingDialog(false);
  };

  const handleSaveSession = () => {
    showSnackbar('Training session created', 'success');
    setOpenSessionDialog(false);
  };

  const handleSaveEnrollment = () => {
    showSnackbar('Employees enrolled successfully', 'success');
    setOpenEnrollDialog(false);
  };

  const handleSaveEvaluation = () => {
    showSnackbar('Evaluation saved', 'success');
    setOpenEvaluationDialog(false);
  };

  const getTrainingTypeIcon = (type) => {
    const t = trainingTypes.find(t => t.id === type) || trainingTypes[0];
    return t.icon;
  };

  const getTrainingTypeChip = (type) => {
    const t = trainingTypes.find(t => t.id === type) || trainingTypes[0];
    return (
      <Chip
        icon={t.icon}
        label={t.name}
        size="small"
        sx={{ bgcolor: t.color, color: 'white' }}
      />
    );
  };

  const getStatusChip = (status) => {
    const config = {
      planned: { color: 'default', label: 'Planned' },
      upcoming: { color: 'info', label: 'Upcoming' },
      ongoing: { color: 'warning', label: 'In Progress' },
      completed: { color: 'success', label: 'Completed' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  const getEnrollmentStatusChip = (status) => {
    const config = {
      enrolled: { color: 'info', label: 'Enrolled' },
      'in-progress': { color: 'warning', label: 'In Progress' },
      completed: { color: 'success', label: 'Completed' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  // Calculate statistics
  const stats = {
    totalTrainings: trainings.length,
    mandatory: trainings.filter(t => t.isMandatory).length,
    optional: trainings.filter(t => !t.isMandatory).length,
    totalSessions: sessions.length,
    upcomingSessions: sessions.filter(s => s.status === 'upcoming' || s.status === 'planned').length,
    ongoingSessions: sessions.filter(s => s.status === 'ongoing').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    totalEnrollments: enrollments.length,
    completedEnrollments: enrollments.filter(e => e.status === 'completed').length
  };

  const trainingColumns = [
    { 
      field: 'name', 
      headerName: 'Training Program', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, bgcolor: trainingTypes.find(t => t.id === params.row.type)?.color || '#2E7D32' }}>
            {getTrainingTypeIcon(params.row.type)}
          </Avatar>
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.department}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => getTrainingTypeChip(params.value)
    },
    { 
      field: 'durationDays', 
      headerName: 'Duration', 
      width: 80,
      valueGetter: (params) => `${params.value} days`
    },
    { 
      field: 'isMandatory', 
      headerName: 'Mandatory', 
      width: 90,
      renderCell: (params) => params.value ? 
        <Chip size="small" label="Yes" color="success" /> : 
        <Chip size="small" label="No" color="default" />
    },
    { 
      field: 'sessions', 
      headerName: 'Sessions', 
      width: 80,
      align: 'center'
    },
    { 
      field: 'totalEnrolled', 
      headerName: 'Enrolled', 
      width: 80,
      align: 'center'
    },
    { 
      field: 'completed', 
      headerName: 'Completed', 
      width: 90,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={(params.row.completed / params.row.totalEnrolled) * 100} 
            sx={{ width: 50, mr: 1 }}
          />
          <Typography variant="caption">
            {Math.round((params.row.completed / params.row.totalEnrolled) * 100)}%
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewTraining(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditTraining(params.row)}>
              <School fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Session">
            <IconButton size="small" color="primary" onClick={() => handleNewSession(params.row)}>
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Sessions">
            <IconButton size="small" onClick={() => {
              setSelectedTraining(params.row);
              setTabValue(1);
            }}>
              <Schedule fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const sessionColumns = [
    { field: 'trainingName', headerName: 'Training', width: 200 },
    { 
      field: 'startDate', 
      headerName: 'Start', 
      width: 100,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    { 
      field: 'endDate', 
      headerName: 'End', 
      width: 100,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    { field: 'trainer', headerName: 'Trainer', width: 150 },
    { field: 'location', headerName: 'Location', width: 130 },
    { 
      field: 'enrolled', 
      headerName: 'Enrolled', 
      width: 100,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value} / {params.row.maxParticipants}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(params.value / params.row.maxParticipants) * 100} 
            sx={{ width: 80 }}
          />
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewSession(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Enroll Employees">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleEnrollEmployees(params.row)}
              disabled={params.row.status === 'completed'}
            >
              <Group fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Attendees">
            <IconButton size="small">
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" color="primary.main">
          Training Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            sx={{ mr: 2 }}
          >
            Reports
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewTraining}
          >
            New Training Program
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Training Programs</Typography>
              <Typography variant="h5">{stats.totalTrainings}</Typography>
              <Typography variant="caption">{stats.mandatory} mandatory</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Sessions</Typography>
              <Typography variant="h5">{stats.totalSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Upcoming</Typography>
              <Typography variant="h5" color="warning.main">{stats.upcomingSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>In Progress</Typography>
              <Typography variant="h5" color="info.main">{stats.ongoingSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#C8E6C9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Completed</Typography>
              <Typography variant="h5" color="success.main">{stats.completedSessions}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Training Programs" />
          <Tab label="Sessions" />
          <Tab label="My Training" />
          <Tab label="Certifications" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <DataGrid
              rows={trainings}
              columns={trainingColumns}
              pageSize={5}
              autoHeight
              disableSelectionOnClick
              getRowId={(row) => row.id}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                {selectedTraining ? `Sessions for: ${selectedTraining.name}` : 'All Training Sessions'}
              </Typography>
              {selectedTraining && (
                <Button size="small" onClick={() => setSelectedTraining(null)}>
                  Show All
                </Button>
              )}
            </Box>
            <DataGrid
              rows={sessions.filter(s => !selectedTraining || s.trainingId === selectedTraining.id)}
              columns={sessionColumns}
              pageSize={5}
              autoHeight
              disableSelectionOnClick
              getRowId={(row) => row.id}
            />
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>My Progress</Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#2E7D32' }}>
                    <School sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5">Marie Ndiaye</Typography>
                  <Typography color="textSecondary" gutterBottom>Machine Operator</Typography>
                  <Chip label="8 Trainings Completed" color="success" sx={{ mt: 1 }} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Food Safety" secondary="Completed Mar 2026" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Machine Operation" secondary="Completed Feb 2026" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Pending color="warning" /></ListItemIcon>
                    <ListItemText primary="Leadership Skills" secondary="Scheduled Apr 2026" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upcoming Trainings</Typography>
                <List>
                  {sessions.filter(s => s.status === 'upcoming').map((session) => (
                    <ListItem key={session.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#F57C00' }}>
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={session.trainingName}
                        secondary={`${format(new Date(session.startDate), 'dd MMM yyyy')} - ${session.location} | Trainer: ${session.trainer}`}
                      />
                      <Chip label="Enrolled" color="success" />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Training Program Dialog */}
      <Dialog open={openTrainingDialog} onClose={() => setOpenTrainingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'new' ? 'New Training Program' : 
           dialogMode === 'edit' ? 'Edit Training Program' : 'Training Program Details'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'view' && selectedTraining ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="h6">{selectedTraining.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  {getTrainingTypeChip(selectedTraining.type)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                  <Typography>{selectedTraining.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                  <Typography>{selectedTraining.durationDays} days</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Mandatory</Typography>
                  <Chip 
                    size="small" 
                    label={selectedTraining.isMandatory ? 'Yes' : 'No'} 
                    color={selectedTraining.isMandatory ? 'success' : 'default'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedTraining.description}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Prerequisites</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedTraining.prerequisites || 'None'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Statistics</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(selectedTraining.completed / selectedTraining.totalEnrolled) * 100} 
                    sx={{ my: 1 }}
                  />
                  <Typography variant="body2">
                    {selectedTraining.completed} of {selectedTraining.totalEnrolled} employees completed
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Training Name"
                  value={trainingForm.name}
                  onChange={(e) => setTrainingForm({...trainingForm, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={trainingForm.department}
                    label="Department"
                    onChange={(e) => setTrainingForm({...trainingForm, department: e.target.value})}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Training Type</InputLabel>
                  <Select
                    value={trainingForm.type}
                    label="Training Type"
                    onChange={(e) => setTrainingForm({...trainingForm, type: e.target.value})}
                  >
                    {trainingTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (days)"
                  value={trainingForm.durationDays}
                  onChange={(e) => setTrainingForm({...trainingForm, durationDays: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Mandatory</InputLabel>
                  <Select
                    value={trainingForm.isMandatory}
                    label="Mandatory"
                    onChange={(e) => setTrainingForm({...trainingForm, isMandatory: e.target.value})}
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={trainingForm.description}
                  onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Prerequisites"
                  value={trainingForm.prerequisites}
                  onChange={(e) => setTrainingForm({...trainingForm, prerequisites: e.target.value})}
                  placeholder="List any prerequisites for this training"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainingDialog(false)}>Close</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveTraining} variant="contained" color="primary">
              {dialogMode === 'new' ? 'Create Training' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSession ? 'Session Details' : 'New Training Session'}
        </DialogTitle>
        <DialogContent>
          {selectedSession ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="h6">{selectedSession.trainingName}</Typography>
                </Grid>
                <Grid item xs={4}>
                  {getStatusChip(selectedSession.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Trainer</Typography>
                  <Typography>{selectedSession.trainer}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                  <Typography>{selectedSession.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                  <Typography>{format(new Date(selectedSession.startDate), 'dd MMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                  <Typography>{format(new Date(selectedSession.endDate), 'dd MMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Enrollment</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(selectedSession.enrolled / selectedSession.maxParticipants) * 100} 
                  />
                  <Typography variant="body2">
                    {selectedSession.enrolled} of {selectedSession.maxParticipants} spots filled
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Attendees</Typography>
                  <List>
                    {enrollments.filter(e => e.sessionId === selectedSession.id).map((e) => (
                      <ListItem key={e.id}>
                        <ListItemIcon>
                          {e.status === 'completed' ? <CheckCircle color="success" /> : 
                           e.status === 'in-progress' ? <Pending color="warning" /> : <Schedule color="info" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={e.employeeName} 
                          secondary={`Enrolled: ${format(new Date(e.enrollmentDate), 'dd MMM yyyy')}`}
                        />
                        {e.score && (
                          <Chip label={`Score: ${e.score}%`} size="small" color="success" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Training: {selectedTraining?.name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={sessionForm.startDate}
                  onChange={(e) => setSessionForm({...sessionForm, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={sessionForm.endDate}
                  onChange={(e) => setSessionForm({...sessionForm, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Trainer"
                  value={sessionForm.trainer}
                  onChange={(e) => setSessionForm({...sessionForm, trainer: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Participants"
                  value={sessionForm.maxParticipants}
                  onChange={(e) => setSessionForm({...sessionForm, maxParticipants: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Close</Button>
          {!selectedSession && (
            <Button onClick={handleSaveSession} variant="contained" color="primary">
              Create Session
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Enroll Employees Dialog */}
      <Dialog open={openEnrollDialog} onClose={() => setOpenEnrollDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Enroll Employees - {selectedSession?.trainingName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Session: {selectedSession?.startDate} to {selectedSession?.endDate} | 
              Available: {selectedSession?.maxParticipants - selectedSession?.enrolled} spots
            </Alert>
            <Typography variant="subtitle2" gutterBottom>Select Employees</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell align="center">Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Marie Ndiaye</TableCell>
                    <TableCell>Production</TableCell>
                    <TableCell>Machine Operator</TableCell>
                    <TableCell align="center">
                      <Chip label="Enrolled" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pierre Kamga</TableCell>
                    <TableCell>Quality Control</TableCell>
                    <TableCell>Inspector</TableCell>
                    <TableCell align="center">
                      <Chip label="Enrolled" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Paul Biyong</TableCell>
                    <TableCell>Maintenance</TableCell>
                    <TableCell>Technician</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined">Enroll</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jean Mbarga</TableCell>
                    <TableCell>Production</TableCell>
                    <TableCell>Trainee</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined">Enroll</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnrollDialog(false)}>Close</Button>
          <Button onClick={handleSaveEnrollment} variant="contained" color="primary">
            Save Enrollments
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
