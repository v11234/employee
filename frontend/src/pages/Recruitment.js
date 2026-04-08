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
  ListItemAvatar
} from '@mui/material';
import {
  Work,
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
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  TrendingUp,
  FilterList,
  Download,
  Assessment,
  ThumbUp,
  ThumbDown,
  Schedule,
  Star,
  StarBorder
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';

export default function Recruitment() {
  // State
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [jobPostings, setJobPostings] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [openApplicantDialog, setOpenApplicantDialog] = useState(false);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'new', 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state for new job
  const [jobForm, setJobForm] = useState({
    title: '',
    positionId: '',
    department: '',
    quantity: 1,
    employmentType: 'temporary',
    description: '',
    requirements: '',
    closingDate: format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy-MM-dd'),
    salary: ''
  });

  // Interview form
  const [interviewForm, setInterviewForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    interviewer: '',
    notes: '',
    score: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    employmentType: ''
  });

  // Mock data - Positions/Departments
  const [positions, setPositions] = useState([
    { id: 1, name: 'Machine Operator', department: 'Production' },
    { id: 2, name: 'Quality Inspector', department: 'Quality Control' },
    { id: 3, name: 'Technician', department: 'Maintenance' },
    { id: 4, name: 'Forklift Operator', department: 'Warehouse' },
    { id: 5, name: 'HR Assistant', department: 'Administration' },
    { id: 6, name: 'Production Supervisor', department: 'Production' },
    { id: 7, name: 'Cleaner', department: 'Maintenance' },
    { id: 8, name: 'Packer', department: 'Production' }
  ]);

  // Mock data - Job Postings
  useEffect(() => {
    setJobPostings([
      {
        id: 1,
        title: 'Machine Operator - Biscuit Line',
        positionId: 1,
        position: 'Machine Operator',
        department: 'Production',
        quantity: 3,
        employmentType: 'temporary',
        status: 'open',
        postedDate: '2026-03-01',
        closingDate: '2026-03-30',
        applicants: 12,
        shortlisted: 5,
        interviewed: 3,
        selected: 1,
        description: 'Looking for experienced machine operators for our biscuit production line. Must have experience with industrial machines.',
        requirements: '• 2+ years experience\n• Ability to work in shifts\n• Basic mechanical knowledge\n• Team player',
        salary: '150,000 - 200,000 CFA'
      },
      {
        id: 2,
        title: 'Quality Inspector',
        positionId: 2,
        position: 'Quality Inspector',
        department: 'Quality Control',
        quantity: 2,
        employmentType: 'permanent',
        status: 'open',
        postedDate: '2026-03-05',
        closingDate: '2026-04-05',
        applicants: 8,
        shortlisted: 4,
        interviewed: 2,
        selected: 0,
        description: 'Seeking detail-oriented quality inspectors for our milk and candy lines.',
        requirements: '• Food safety certification\n• Attention to detail\n• Good communication skills\n• Previous experience preferred',
        salary: '180,000 - 220,000 CFA'
      },
      {
        id: 3,
        title: 'Maintenance Technician',
        positionId: 3,
        position: 'Technician',
        department: 'Maintenance',
        quantity: 1,
        employmentType: 'permanent',
        status: 'in-progress',
        postedDate: '2026-02-15',
        closingDate: '2026-03-15',
        applicants: 15,
        shortlisted: 6,
        interviewed: 4,
        selected: 2,
        description: 'Experienced technician to maintain and repair production equipment.',
        requirements: '• Electrical and mechanical skills\n• 3+ years experience\n• Troubleshooting abilities\n• Available for emergencies',
        salary: '200,000 - 250,000 CFA'
      },
      {
        id: 4,
        title: 'Forklift Operator',
        positionId: 4,
        position: 'Forklift Operator',
        department: 'Warehouse',
        quantity: 2,
        employmentType: 'temporary',
        status: 'closed',
        postedDate: '2026-02-01',
        closingDate: '2026-02-28',
        applicants: 20,
        shortlisted: 8,
        interviewed: 6,
        selected: 2,
        description: 'Forklift operators needed for warehouse operations.',
        requirements: '• Valid forklift certification\n• Warehouse experience\n• Safety conscious\n• Physical stamina',
        salary: '140,000 - 180,000 CFA'
      }
    ]);

    setApplicants([
      {
        id: 1,
        jobId: 1,
        jobTitle: 'Machine Operator - Biscuit Line',
        firstName: 'Jean',
        lastName: 'Mbarga',
        email: 'jean.mbarga@email.com',
        phone: '677889900',
        address: 'Douala, Cameroon',
        status: 'selected',
        applicationDate: '2026-03-02',
        interviewDate: '2026-03-10',
        interviewScore: 85,
        interviewFeedback: 'Excellent technical skills. Good attitude.',
        resumeUrl: 'resume_jean.pdf',
        notes: 'Previous experience at Nestle',
        convertedToEmployeeId: 4
      },
      {
        id: 2,
        jobId: 1,
        jobTitle: 'Machine Operator - Biscuit Line',
        firstName: 'Claire',
        lastName: 'Abena',
        email: 'claire.abena@email.com',
        phone: '699887766',
        address: 'Yaoundé, Cameroon',
        status: 'interviewed',
        applicationDate: '2026-03-03',
        interviewDate: '2026-03-11',
        interviewScore: 72,
        interviewFeedback: 'Good potential, needs training on specific machines.',
        resumeUrl: 'resume_claire.pdf',
        notes: 'Fast learner'
      },
      {
        id: 3,
        jobId: 1,
        jobTitle: 'Machine Operator - Biscuit Line',
        firstName: 'Luc',
        lastName: 'Tchamba',
        email: 'luc.tchamba@email.com',
        phone: '655443322',
        address: 'Douala, Cameroon',
        status: 'shortlisted',
        applicationDate: '2026-03-04',
        interviewDate: null,
        interviewScore: null,
        interviewFeedback: null,
        resumeUrl: 'resume_luc.pdf',
        notes: 'Available immediately'
      },
      {
        id: 4,
        jobId: 2,
        jobTitle: 'Quality Inspector',
        firstName: 'Sarah',
        lastName: 'Nkeng',
        email: 'sarah.nkeng@email.com',
        phone: '677112233',
        address: 'Buea, Cameroon',
        status: 'pending',
        applicationDate: '2026-03-06',
        interviewDate: null,
        interviewScore: null,
        interviewFeedback: null,
        resumeUrl: 'resume_sarah.pdf',
        notes: 'Has food science degree'
      },
      {
        id: 5,
        jobId: 2,
        jobTitle: 'Quality Inspector',
        firstName: 'David',
        lastName: 'Eto',
        email: 'david.eto@email.com',
        phone: '699554433',
        address: 'Douala, Cameroon',
        status: 'rejected',
        applicationDate: '2026-03-07',
        interviewDate: '2026-03-14',
        interviewScore: 45,
        interviewFeedback: 'Lacks attention to detail',
        resumeUrl: 'resume_david.pdf',
        notes: 'Consider for other positions'
      }
    ]);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNewJob = () => {
    setJobForm({
      title: '',
      positionId: '',
      department: '',
      quantity: 1,
      employmentType: 'temporary',
      description: '',
      requirements: '',
      closingDate: format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy-MM-dd'),
      salary: ''
    });
    setDialogMode('new');
    setOpenJobDialog(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title,
      positionId: job.positionId,
      department: job.department,
      quantity: job.quantity,
      employmentType: job.employmentType,
      description: job.description,
      requirements: job.requirements,
      closingDate: job.closingDate,
      salary: job.salary || ''
    });
    setDialogMode('edit');
    setOpenJobDialog(true);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDialogMode('view');
    setOpenJobDialog(true);
  };

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setOpenApplicantDialog(true);
  };

  const handleScheduleInterview = (applicant) => {
    setSelectedApplicant(applicant);
    setInterviewForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      interviewer: '',
      notes: '',
      score: 0
    });
    setOpenInterviewDialog(true);
  };

  const handleSaveJob = () => {
    // Validate
    if (!jobForm.title || !jobForm.positionId || !jobForm.quantity) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }

    showSnackbar(dialogMode === 'new' ? 'Job posting created' : 'Job posting updated', 'success');
    setOpenJobDialog(false);
  };

  const handleUpdateStatus = (applicantId, newStatus) => {
    showSnackbar(`Applicant status updated to ${newStatus}`, 'success');
    setApplicants(prev => prev.map(a => 
      a.id === applicantId ? { ...a, status: newStatus } : a
    ));
  };

  const handleSaveInterview = () => {
    showSnackbar(`Interview scheduled for ${selectedApplicant?.firstName} ${selectedApplicant?.lastName}`, 'success');
    handleUpdateStatus(selectedApplicant.id, 'interviewed');
    setOpenInterviewDialog(false);
  };

  const handleConvertToEmployee = (applicant) => {
    if (window.confirm(`Convert ${applicant.firstName} ${applicant.lastName} to employee?`)) {
      showSnackbar(`Applicant converted to employee successfully`, 'success');
      handleUpdateStatus(applicant.id, 'selected');
    }
  };

  const getStatusChip = (status) => {
    const config = {
      pending: { color: 'warning', label: 'Pending' },
      shortlisted: { color: 'info', label: 'Shortlisted' },
      interviewed: { color: 'primary', label: 'Interviewed' },
      selected: { color: 'success', label: 'Selected' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  const getJobStatusChip = (status) => {
    const config = {
      draft: { color: 'default', label: 'Draft' },
      open: { color: 'success', label: 'Open' },
      'in-progress': { color: 'info', label: 'In Progress' },
      closed: { color: 'error', label: 'Closed' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  // Calculate statistics
  const stats = {
    totalJobs: jobPostings.length,
    openJobs: jobPostings.filter(j => j.status === 'open').length,
    inProgress: jobPostings.filter(j => j.status === 'in-progress').length,
    closed: jobPostings.filter(j => j.status === 'closed').length,
    totalApplicants: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interviewed: applicants.filter(a => a.status === 'interviewed').length,
    selected: applicants.filter(a => a.status === 'selected').length
  };

  // Filter applicants based on selected job and tab
  const filteredApplicants = applicants.filter(a => {
    if (selectedJob && a.jobId !== selectedJob.id) return false;
    
    if (tabValue === 1 && a.status !== 'pending') return false;
    if (tabValue === 2 && a.status !== 'shortlisted') return false;
    if (tabValue === 3 && a.status !== 'interviewed') return false;
    if (tabValue === 4 && a.status !== 'selected') return false;
    if (tabValue === 5 && a.status !== 'rejected') return false;
    
    return true;
  });

  const jobColumns = [
    { field: 'title', headerName: 'Job Title', width: 220 },
    { field: 'department', headerName: 'Department', width: 130 },
    { 
      field: 'employmentType', 
      headerName: 'Type', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          size="small" 
          label={params.value === 'permanent' ? 'Permanent' : 'Temporary'} 
          color={params.value === 'permanent' ? 'success' : 'warning'}
        />
      )
    },
    { field: 'quantity', headerName: 'Positions', width: 90, align: 'center' },
    {
      field: 'applicants',
      headerName: 'Applicants',
      width: 90,
      renderCell: (params) => (
        <Badge badgeContent={params.value} color="primary" max={99}>
          <Person />
        </Badge>
      )
    },
    {
      field: 'shortlisted',
      headerName: 'Shortlisted',
      width: 90,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => getJobStatusChip(params.value)
    },
    {
      field: 'closingDate',
      headerName: 'Closes',
      width: 100,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewJob(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditJob(params.row)}>
              <Work fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Applicants">
            <IconButton size="small" onClick={() => {
              setSelectedJob(params.row);
              setTabValue(0);
            }}>
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const applicantColumns = [
    { 
      field: 'name', 
      headerName: 'Applicant', 
      width: 180,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
            {params.row.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'jobTitle', 
      headerName: 'Position', 
      width: 180 
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 120 
    },
    { 
      field: 'applicationDate', 
      headerName: 'Applied', 
      width: 100,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => getStatusChip(params.value)
    },
    { 
      field: 'interviewScore', 
      headerName: 'Score', 
      width: 80,
      renderCell: (params) => params.value ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={params.value / 20} readOnly size="small" max={5} />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {params.value}%
          </Typography>
        </Box>
      ) : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewApplicant(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <Tooltip title="Shortlist">
              <IconButton 
                size="small" 
                color="info"
                onClick={() => handleUpdateStatus(params.row.id, 'shortlisted')}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'shortlisted' && (
            <Tooltip title="Schedule Interview">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleScheduleInterview(params.row)}
              >
                <Schedule fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'interviewed' && (
            <Tooltip title="Select">
              <IconButton 
                size="small" 
                color="success"
                onClick={() => handleConvertToEmployee(params.row)}
              >
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status !== 'selected' && params.row.status !== 'rejected' && (
            <Tooltip title="Reject">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleUpdateStatus(params.row.id, 'rejected')}
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" color="primary.main">
          Recruitment Management
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
            onClick={handleNewJob}
          >
            New Job Posting
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Open Jobs</Typography>
              <Typography variant="h5">{stats.openJobs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Applicants</Typography>
              <Typography variant="h5">{stats.totalApplicants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending</Typography>
              <Typography variant="h5" color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Shortlisted</Typography>
              <Typography variant="h5" color="info.main">{stats.shortlisted}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#C8E6C9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Selected</Typography>
              <Typography variant="h5" color="success.main">{stats.selected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Job Postings List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Postings
              </Typography>
              <DataGrid
                rows={jobPostings}
                columns={jobColumns}
                pageSize={5}
                autoHeight
                disableSelectionOnClick
                onRowClick={(params) => {
                  setSelectedJob(params.row);
                  setTabValue(0);
                }}
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    cursor: 'pointer',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Applicants List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="h6">
                  {selectedJob ? `Applicants - ${selectedJob.title}` : 'All Applicants'}
                </Typography>
                {selectedJob && (
                  <Button size="small" onClick={() => setSelectedJob(null)}>
                    Clear Filter
                  </Button>
                )}
              </Box>

              {/* Tabs */}
              <Paper sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="All" />
                  <Tab label="Pending" />
                  <Tab label="Shortlisted" />
                  <Tab label="Interviewed" />
                  <Tab label="Selected" />
                  <Tab label="Rejected" />
                </Tabs>
              </Paper>

              {/* Applicants Table */}
              <DataGrid
                rows={filteredApplicants}
                columns={applicantColumns}
                pageSize={5}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row.id}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Job Posting Dialog */}
      <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'new' ? 'New Job Posting' : 
           dialogMode === 'edit' ? 'Edit Job Posting' : 'Job Details'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'view' && selectedJob ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="h6">{selectedJob.title}</Typography>
                </Grid>
                <Grid item xs={4}>
                  {getJobStatusChip(selectedJob.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                  <Typography>{selectedJob.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                  <Chip 
                    size="small" 
                    label={selectedJob.employmentType === 'permanent' ? 'Permanent' : 'Temporary'} 
                    color={selectedJob.employmentType === 'permanent' ? 'success' : 'warning'}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Positions</Typography>
                  <Typography>{selectedJob.quantity}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Salary</Typography>
                  <Typography>{selectedJob.salary}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Posted Date</Typography>
                  <Typography>{format(new Date(selectedJob.postedDate), 'dd MMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Closing Date</Typography>
                  <Typography>{format(new Date(selectedJob.closingDate), 'dd MMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedJob.description}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Requirements</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography style={{ whiteSpace: 'pre-line' }}>{selectedJob.requirements}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Applicants Progress</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(selectedJob.interviewed / selectedJob.applicants) * 100} 
                    sx={{ mt: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Chip size="small" label={`${selectedJob.applicants} Total`} />
                    <Chip size="small" label={`${selectedJob.shortlisted} Shortlisted`} color="info" />
                    <Chip size="small" label={`${selectedJob.interviewed} Interviewed`} color="primary" />
                    <Chip size="small" label={`${selectedJob.selected} Selected`} color="success" />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={jobForm.positionId}
                    label="Position"
                    onChange={(e) => {
                      const pos = positions.find(p => p.id === e.target.value);
                      setJobForm({
                        ...jobForm, 
                        positionId: e.target.value,
                        department: pos?.department || ''
                      });
                    }}
                  >
                    {positions.map(pos => (
                      <MenuItem key={pos.id} value={pos.id}>{pos.name} ({pos.department})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    value={jobForm.employmentType}
                    label="Employment Type"
                    onChange={(e) => setJobForm({...jobForm, employmentType: e.target.value})}
                  >
                    <MenuItem value="temporary">Temporary</MenuItem>
                    <MenuItem value="permanent">Permanent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Positions"
                  value={jobForm.quantity}
                  onChange={(e) => setJobForm({...jobForm, quantity: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Salary Range"
                  placeholder="e.g., 150,000 - 200,000 CFA"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Closing Date"
                  value={jobForm.closingDate}
                  onChange={(e) => setJobForm({...jobForm, closingDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Job Description"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Requirements (one per line)"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                  placeholder="• Requirement 1&#10;• Requirement 2&#10;• Requirement 3"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Close</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveJob} variant="contained" color="primary">
              {dialogMode === 'new' ? 'Create Job' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Applicant Details Dialog */}
      <Dialog open={openApplicantDialog} onClose={() => setOpenApplicantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Applicant Details
        </DialogTitle>
        <DialogContent>
          {selectedApplicant && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                    {selectedApplicant.firstName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedApplicant.firstName} {selectedApplicant.lastName}
                    </Typography>
                    <Typography color="textSecondary">
                      {selectedApplicant.jobTitle}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  {getStatusChip(selectedApplicant.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Applied Date</Typography>
                  <Typography>{format(new Date(selectedApplicant.applicationDate), 'dd MMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography>{selectedApplicant.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography>{selectedApplicant.phone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                  <Typography>{selectedApplicant.address}</Typography>
                </Grid>
                
                {selectedApplicant.interviewDate && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" gutterBottom>Interview Details</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Interview Date</Typography>
                      <Typography>{format(new Date(selectedApplicant.interviewDate), 'dd MMM yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Score</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={selectedApplicant.interviewScore / 20} readOnly />
                        <Typography sx={{ ml: 1 }}>{selectedApplicant.interviewScore}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Feedback</Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography>{selectedApplicant.interviewFeedback}</Typography>
                      </Paper>
                    </Grid>
                  </>
                )}

                {selectedApplicant.notes && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                      <Typography>{selectedApplicant.notes}</Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="textSecondary">Resume</Typography>
                  <Button
                    startIcon={<Description />}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    View Resume
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApplicantDialog(false)}>Close</Button>
          {selectedApplicant?.status === 'shortlisted' && (
            <Button 
              onClick={() => {
                setOpenApplicantDialog(false);
                handleScheduleInterview(selectedApplicant);
              }} 
              variant="contained" 
              color="primary"
            >
              Schedule Interview
            </Button>
          )}
          {selectedApplicant?.status === 'interviewed' && (
            <Button 
              onClick={() => handleConvertToEmployee(selectedApplicant)} 
              variant="contained" 
              color="success"
            >
              Convert to Employee
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Interview Schedule Dialog */}
      <Dialog open={openInterviewDialog} onClose={() => setOpenInterviewDialog(false)}>
        <DialogTitle>
          Schedule Interview
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={interviewForm.date}
                onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={interviewForm.time}
                onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interviewer"
                value={interviewForm.interviewer}
                onChange={(e) => setInterviewForm({...interviewForm, interviewer: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes / Questions"
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInterviewDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveInterview} variant="contained" color="primary">
            Schedule Interview
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
