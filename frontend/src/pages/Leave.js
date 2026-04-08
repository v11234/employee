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
  StepContent
} from '@mui/material';
import {
  BeachAccess,
  Add,
  Refresh,
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  History,
  Event,
  Person,
  Description,
  AttachFile,
  MedicalServices,
  TrendingUp,
  FilterList,
  Download,
  CalendarToday
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';

export default function Leave() {
  // State
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'new', 'approve'
  const [openMedicalDialog, setOpenMedicalDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    reason: '',
    medicalBooklet: null
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    employee: ''
  });

  // Mock data - Leave Types
  useEffect(() => {
    setLeaveTypes([
      { id: 1, name: 'Annual Leave', daysPerYear: 22, icon: <BeachAccess />, color: '#2E7D32', requiresMedical: false, paid: true },
      { id: 2, name: 'Sick Leave', daysPerYear: 30, icon: <MedicalServices />, color: '#F57C00', requiresMedical: true, paid: true },
      { id: 3, name: 'Unpaid Leave', daysPerYear: 0, icon: <Cancel />, color: '#9E9E9E', requiresMedical: false, paid: false },
      { id: 4, name: 'Maternity Leave', daysPerYear: 98, icon: <Person />, color: '#C2185B', requiresMedical: true, paid: true },
      { id: 5, name: 'Paternity Leave', daysPerYear: 10, icon: <Person />, color: '#1565C0', requiresMedical: false, paid: true }
    ]);

    // Mock leave requests
    setLeaveRequests([
      {
        id: 1,
        employeeId: 2,
        employeeName: 'Marie Ndiaye',
        employeeCode: 'EMP002',
        position: 'Machine Operator',
        line: 'Biscuit Line 1',
        leaveTypeId: 1,
        leaveType: 'Annual Leave',
        startDate: '2026-04-01',
        endDate: '2026-04-10',
        days: 10,
        reason: 'Family vacation',
        status: 'approved',
        appliedDate: '2026-03-01',
        approvedBy: 'HR Manager',
        approvedDate: '2026-03-02',
        medicalBooklet: null
      },
      {
        id: 2,
        employeeId: 1,
        employeeName: 'Pierre Kamga',
        employeeCode: 'EMP001',
        position: 'Quality Inspector',
        line: 'Milk Line',
        leaveTypeId: 2,
        leaveType: 'Sick Leave',
        startDate: '2026-03-15',
        endDate: '2026-03-18',
        days: 4,
        reason: 'Malaria',
        status: 'pending',
        appliedDate: '2026-03-14',
        approvedBy: null,
        approvedDate: null,
        medicalBooklet: 'medical_001.pdf'
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: 'Paul Biyong',
        employeeCode: 'EMP003',
        position: 'Technician',
        line: 'Candy Line',
        leaveTypeId: 3,
        leaveType: 'Unpaid Leave',
        startDate: '2026-04-20',
        endDate: '2026-04-25',
        days: 6,
        reason: 'Personal matters',
        status: 'rejected',
        appliedDate: '2026-03-10',
        approvedBy: 'HR Manager',
        approvedDate: '2026-03-12',
        rejectionReason: 'Insufficient staff during that week',
        medicalBooklet: null
      },
      {
        id: 4,
        employeeId: 4,
        employeeName: 'Jean Mbarga',
        employeeCode: 'EMP004',
        position: 'Trainee',
        line: 'Biscuit Line 2',
        leaveTypeId: 1,
        leaveType: 'Annual Leave',
        startDate: '2026-05-01',
        endDate: '2026-05-07',
        days: 7,
        reason: 'Wedding',
        status: 'approved',
        appliedDate: '2026-03-05',
        approvedBy: 'HR Manager',
        approvedDate: '2026-03-06',
        medicalBooklet: null
      },
      {
        id: 5,
        employeeId: 5,
        employeeName: 'Claire Abena',
        employeeCode: 'EMP005',
        position: 'Line Supervisor',
        line: 'Milk Line',
        leaveTypeId: 2,
        leaveType: 'Sick Leave',
        startDate: '2026-03-20',
        endDate: '2026-03-22',
        days: 3,
        reason: 'Medical appointment',
        status: 'pending',
        appliedDate: '2026-03-18',
        approvedBy: null,
        approvedDate: null,
        medicalBooklet: 'medical_002.pdf'
      }
    ]);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleNewRequest = () => {
    setFormData({
      leaveTypeId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      reason: '',
      medicalBooklet: null
    });
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setDialogMode('approve');
    setOpenDialog(true);
  };

  const handleRejectRequest = (request) => {
    if (window.confirm(`Reject leave request for ${request.employeeName}?`)) {
      // In real app, call API
      showSnackbar(`Leave request rejected`, 'info');
      // Update local state
      setLeaveRequests(prev => prev.map(r => 
        r.id === request.id ? { ...r, status: 'rejected', approvedBy: 'Current User', approvedDate: format(new Date(), 'yyyy-MM-dd') } : r
      ));
    }
  };

  const handleConfirmApprove = (rejectionReason) => {
    if (selectedRequest) {
      showSnackbar(`Leave request approved for ${selectedRequest.employeeName}`, 'success');
      // Update local state
      setLeaveRequests(prev => prev.map(r => 
        r.id === selectedRequest.id ? { ...r, status: 'approved', approvedBy: 'Current User', approvedDate: format(new Date(), 'yyyy-MM-dd') } : r
      ));
      setOpenDialog(false);
    }
  };

  const handleSubmitRequest = () => {
    // Validate
    if (!formData.leaveTypeId) {
      showSnackbar('Please select leave type', 'warning');
      return;
    }

    const leaveType = leaveTypes.find(t => t.id === formData.leaveTypeId);
    
    // Check if medical booklet required
    if (leaveType?.requiresMedical && !formData.medicalBooklet) {
      setOpenMedicalDialog(true);
      return;
    }

    // Calculate days
    const days = differenceInDays(new Date(formData.endDate), new Date(formData.startDate)) + 1;
    
    // In real app, call API
    showSnackbar(`Leave request submitted for ${days} days`, 'success');
    
    // Add to list (mock)
    const newRequest = {
      id: leaveRequests.length + 1,
      employeeId: 2, // Current user's employee ID
      employeeName: 'Marie Ndiaye', // Current user
      employeeCode: 'EMP002',
      position: 'Machine Operator',
      line: 'Biscuit Line 1',
      leaveTypeId: formData.leaveTypeId,
      leaveType: leaveType.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: days,
      reason: formData.reason,
      status: 'pending',
      appliedDate: format(new Date(), 'yyyy-MM-dd'),
      approvedBy: null,
      approvedDate: null,
      medicalBooklet: formData.medicalBooklet ? 'uploaded.pdf' : null
    };
    
    setLeaveRequests(prev => [newRequest, ...prev]);
    setOpenDialog(false);
  };

  const handleMedicalUpload = () => {
    setOpenMedicalDialog(false);
    showSnackbar('Medical booklet uploaded', 'success');
    // Continue with submission
    handleSubmitRequest();
  };

  const handleExport = () => {
    showSnackbar('Exporting leave report...', 'info');
  };

  const getStatusChip = (status) => {
    const config = {
      pending: { color: 'warning', icon: <Pending />, label: 'Pending' },
      approved: { color: 'success', icon: <CheckCircle />, label: 'Approved' },
      rejected: { color: 'error', icon: <Cancel />, label: 'Rejected' }
    };
    const c = config[status] || { color: 'default', label: status };
    return (
      <Chip
        icon={c.icon}
        label={c.label}
        size="small"
        color={c.color}
      />
    );
  };

  const getLeaveTypeChip = (typeId) => {
    const type = leaveTypes.find(t => t.id === typeId) || leaveTypes[0];
    return (
      <Chip
        icon={type.icon}
        label={type.name}
        size="small"
        sx={{ bgcolor: type.color, color: 'white' }}
      />
    );
  };

  // Calculate statistics
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    totalDays: leaveRequests.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.days, 0),
    sickLeave: leaveRequests.filter(r => r.leaveType === 'Sick Leave' && r.status === 'approved').length
  };

  // Filter requests based on tab and filters
  const filteredRequests = leaveRequests.filter(r => {
    // Tab filter
    if (tabValue === 1 && r.status !== 'pending') return false;
    if (tabValue === 2 && r.status !== 'approved') return false;
    if (tabValue === 3 && r.status !== 'rejected') return false;
    
    // Filter by status
    const matchesStatus = filters.status === '' || r.status === filters.status;
    const matchesType = filters.type === '' || r.leaveTypeId === parseInt(filters.type);
    const matchesEmployee = filters.employee === '' || 
      r.employeeName.toLowerCase().includes(filters.employee.toLowerCase());
    
    return matchesStatus && matchesType && matchesEmployee;
  });

  const columns = [
    { 
      field: 'employeeName', 
      headerName: 'Employee', 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
            {params.value.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.employeeCode}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'leaveType', 
      headerName: 'Leave Type', 
      width: 150,
      renderCell: (params) => getLeaveTypeChip(params.row.leaveTypeId)
    },
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
    { 
      field: 'days', 
      headerName: 'Days', 
      width: 70,
      align: 'center'
    },
    { 
      field: 'reason', 
      headerName: 'Reason', 
      width: 150,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 130 }}>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 110,
      renderCell: (params) => getStatusChip(params.value)
    },
    { 
      field: 'appliedDate', 
      headerName: 'Applied', 
      width: 90,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewRequest(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton 
                  size="small" 
                  color="success"
                  onClick={() => handleApproveRequest(params.row)}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleRejectRequest(params.row)}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.medicalBooklet && (
            <Tooltip title="View Medical Booklet">
              <IconButton size="small" color="info">
                <MedicalServices fontSize="small" />
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
          Leave Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ mr: 2 }}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewRequest}
          >
            New Request
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Requests</Typography>
              <Typography variant="h5">{stats.total}</Typography>
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
              <Typography color="textSecondary" gutterBottom>Approved</Typography>
              <Typography variant="h5" color="success.main">{stats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#FFEBEE' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Rejected</Typography>
              <Typography variant="h5" color="error.main">{stats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Days</Typography>
              <Typography variant="h5" color="info.main">{stats.totalDays}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Requests" />
          <Tab 
            label={
              <Badge badgeContent={stats.pending} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Leave Type"
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {leaveTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employee..."
                value={filters.employee}
                onChange={(e) => setFilters({...filters, employee: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setFilters({ status: '', type: '', employee: '' })}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardContent>
          <DataGrid
            rows={filteredRequests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            loading={loading}
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

      {/* New Request Dialog */}
      <Dialog open={openDialog && dialogMode === 'new'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          New Leave Request
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leaveTypeId}
                  label="Leave Type"
                  onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
                >
                  {leaveTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.name}</Typography>
                        <Chip 
                          size="small" 
                          label={type.paid ? 'Paid' : 'Unpaid'} 
                          color={type.paid ? 'success' : 'default'}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Leave"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Leave Balance:</strong> Annual: 15 days | Sick: 22 days
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={openDialog && dialogMode === 'view'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Leave Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                  <Typography variant="body1">{selectedRequest.employeeName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Code</Typography>
                  <Typography variant="body1">{selectedRequest.employeeCode}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Position</Typography>
                  <Typography variant="body1">{selectedRequest.position}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Line</Typography>
                  <Typography variant="body1">{selectedRequest.line}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                  {getLeaveTypeChip(selectedRequest.leaveTypeId)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  {getStatusChip(selectedRequest.status)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                  <Typography variant="body1">{format(new Date(selectedRequest.startDate), 'dd MMMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                  <Typography variant="body1">{format(new Date(selectedRequest.endDate), 'dd MMMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                  <Typography variant="body1">{selectedRequest.days} days</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Applied On</Typography>
                  <Typography variant="body1">{format(new Date(selectedRequest.appliedDate), 'dd MMMM yyyy')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>{selectedRequest.reason}</Typography>
                  </Paper>
                </Grid>
                {selectedRequest.medicalBooklet && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<MedicalServices />}>
                      Medical booklet attached: {selectedRequest.medicalBooklet}
                    </Alert>
                  </Grid>
                )}
                {selectedRequest.status !== 'pending' && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Approved/Rejected By</Typography>
                      <Typography variant="body1">{selectedRequest.approvedBy || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedRequest.approvedDate ? format(new Date(selectedRequest.approvedDate), 'dd MMMM yyyy') : 'N/A'}
                      </Typography>
                    </Grid>
                    {selectedRequest.rejectionReason && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Rejection Reason</Typography>
                        <Alert severity="error">{selectedRequest.rejectionReason}</Alert>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                onClick={() => handleApproveRequest(selectedRequest)} 
                variant="contained" 
                color="success"
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleRejectRequest(selectedRequest)} 
                variant="contained" 
                color="error"
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Medical Booklet Dialog */}
      <Dialog open={openMedicalDialog} onClose={() => setOpenMedicalDialog(false)}>
        <DialogTitle>
          Medical Booklet Required
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Sick leave requires a medical booklet
            </Alert>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<AttachFile />}
              sx={{ py: 1.5 }}
            >
              Upload Medical Booklet
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  setFormData({...formData, medicalBooklet: e.target.files[0]});
                  handleMedicalUpload();
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMedicalDialog(false)}>Cancel</Button>
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
