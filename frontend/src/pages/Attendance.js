import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
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
  Badge,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Tooltip
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Warning,
  Error,
  QrCodeScanner,
  Search,
  Download,
  PictureAsPdf,
  Visibility,
  Edit,
  Delete,
  Person,
  Nightlight,
  Weekend,
  TrendingUp,
  Refresh,
  FilterList,
  CalendarToday,
  Assessment
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { toast } from 'react-toastify';
import { API_URL } from '../config/api';

export default function Attendance() {
  // State
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
    nightShifts: 0,
    sanctions: 0
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'edit', 'mark'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    line: '',
    shift: ''
  });

  // Master data
  const [productionLines, setProductionLines] = useState([
    { id: 1, name: 'Biscuit Line 1' },
    { id: 2, name: 'Biscuit Line 2' },
    { id: 3, name: 'Milk Line' },
    { id: 4, name: 'Candy Line' },
    { id: 5, name: 'Packaging' }
  ]);

  const [shifts, setShifts] = useState([
    { id: 1, name: 'Morning', time: '07:00 - 15:00' },
    { id: 2, name: 'Afternoon', time: '15:00 - 23:00' },
    { id: 3, name: 'Night', time: '23:00 - 07:00' },
    { id: 4, name: 'Saturday Cleaning', time: '07:00 - 15:00' }
  ]);

  // Form for manual entry
  const [formData, setFormData] = useState({
    employeeId: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    lateMinutes: 0,
    nightBonusEarned: false,
    sanctionApplied: false,
    sanctionAmount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // In real app, fetch from API
      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          employeeId: 2,
          employeeCode: 'EMP002',
          employeeName: 'Marie Ndiaye',
          position: 'Machine Operator',
          line: 'Biscuit Line 1',
          shift: 'Morning',
          checkIn: '2026-03-13T06:55:00',
          checkOut: '2026-03-13T15:05:00',
          status: 'present',
          lateMinutes: 0,
          nightBonus: false,
          sanction: false
        },
        {
          id: 2,
          employeeId: 1,
          employeeCode: 'EMP001',
          employeeName: 'Pierre Kamga',
          position: 'Quality Inspector',
          line: 'Milk Line',
          shift: 'Morning',
          checkIn: '2026-03-13T07:20:00',
          checkOut: null,
          status: 'late',
          lateMinutes: 20,
          nightBonus: false,
          sanction: false
        },
        {
          id: 3,
          employeeId: 3,
          employeeCode: 'EMP003',
          employeeName: 'Paul Biyong',
          position: 'Technician',
          line: 'Candy Line',
          shift: 'Afternoon',
          checkIn: null,
          checkOut: null,
          status: 'absent',
          lateMinutes: 0,
          nightBonus: false,
          sanction: true,
          sanctionAmount: 2500
        },
        {
          id: 4,
          employeeId: 4,
          employeeCode: 'EMP004',
          employeeName: 'Jean Mbarga',
          position: 'Trainee',
          line: 'Biscuit Line 2',
          shift: 'Night',
          checkIn: '2026-03-12T22:50:00',
          checkOut: '2026-03-13T07:10:00',
          status: 'present',
          lateMinutes: 0,
          nightBonus: true,
          sanction: false
        }
      ];

      setAttendanceRecords(mockData);
      
      // Calculate stats
      const stats = {
        total: mockData.length,
        present: mockData.filter(r => r.status === 'present').length,
        late: mockData.filter(r => r.status === 'late').length,
        absent: mockData.filter(r => r.status === 'absent').length,
        nightShifts: mockData.filter(r => r.nightBonus).length,
        sanctions: mockData.filter(r => r.sanction).length
      };
      setStats(stats);

    } catch (error) {
      showSnackbar('Failed to fetch attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCheckIn = async () => {
    if (!employeeCode) {
      showSnackbar('Please enter employee code', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/attendance/checkin`, 
        { employeeCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar('Check-in successful');
      setEmployeeCode('');
      fetchAttendance();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeCode) {
      showSnackbar('Please enter employee code', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/attendance/checkout`,
        { employeeCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar('Check-out successful');
      setEmployeeCode('');
      fetchAttendance();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = () => {
    setDialogMode('mark');
    setFormData({
      employeeId: '',
      status: 'absent',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId,
      checkInTime: record.checkIn ? format(parseISO(record.checkIn), 'HH:mm') : '',
      checkOutTime: record.checkOut ? format(parseISO(record.checkOut), 'HH:mm') : '',
      status: record.status,
      lateMinutes: record.lateMinutes,
      nightBonusEarned: record.nightBonus,
      sanctionApplied: record.sanction,
      sanctionAmount: record.sanctionAmount || 0,
      notes: record.notes || ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleSaveManual = () => {
    showSnackbar('Attendance record saved', 'success');
    setOpenDialog(false);
    fetchAttendance();
  };

  const handleExport = (format) => {
    showSnackbar(`Exporting to ${format}...`, 'info');
    // Implement export logic
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle sx={{ color: '#2E7D32' }} />;
      case 'late': return <Warning sx={{ color: '#F57C00' }} />;
      case 'absent': return <Error sx={{ color: '#C62828' }} />;
      default: return <AccessTime />;
    }
  };

  const getStatusChip = (status) => {
    const config = {
      present: { color: 'success', label: 'Present' },
      late: { color: 'warning', label: 'Late' },
      absent: { color: 'error', label: 'Absent' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesStatus = filters.status === '' || record.status === filters.status;
    const matchesLine = filters.line === '' || record.line?.includes(filters.line);
    const matchesShift = filters.shift === '' || record.shift === filters.shift;
    return matchesStatus && matchesLine && matchesShift;
  });

  const columns = [
    { 
      field: 'employeeName', 
      headerName: 'Employee', 
      width: 200,
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
    { field: 'position', headerName: 'Position', width: 150 },
    { field: 'line', headerName: 'Line', width: 130 },
    { field: 'shift', headerName: 'Shift', width: 120 },
    {
      field: 'checkIn',
      headerName: 'Check In',
      width: 100,
      valueGetter: (params) => params.value ? format(parseISO(params.value), 'HH:mm') : '-'
    },
    {
      field: 'checkOut',
      headerName: 'Check Out',
      width: 100,
      valueGetter: (params) => params.value ? format(parseISO(params.value), 'HH:mm') : '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'lateMinutes',
      headerName: 'Late',
      width: 80,
      valueGetter: (params) => params.value > 0 ? `${params.value} min` : '-'
    },
    {
      field: 'nightBonus',
      headerName: 'Night',
      width: 80,
      renderCell: (params) => params.value ? 
        <Chip size="small" label="500 CFA" color="primary" icon={<Nightlight />} /> : '-'
    },
    {
      field: 'sanction',
      headerName: 'Sanction',
      width: 100,
      renderCell: (params) => params.value ? 
        <Chip size="small" label={`${params.row.sanctionAmount} CFA`} color="error" /> : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewRecord(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditRecord(params.row)}>
              <Edit fontSize="small" />
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
          Attendance Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => handleExport('PDF')}
            sx={{ mr: 2 }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => handleExport('Report')}
            sx={{ mr: 2 }}
          >
            Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchAttendance}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Quick Check-in Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                <QrCodeScanner sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quick Check-in / Check-out
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter employee code"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                  }}
                  size="medium"
                />
                <Button
                  variant="contained"
                  onClick={handleCheckIn}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: 'white',
                    color: '#2E7D32',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    minWidth: 100
                  }}
                >
                  Check In
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCheckOut}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: 'white',
                    color: '#2E7D32',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    minWidth: 100
                  }}
                >
                  Check Out
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.present}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <CheckCircle sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Present
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.late}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Late
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.absent}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <Error sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Absent
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Present Rate</Typography>
                  <Typography variant="h4">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#E8F5E9', width: 48, height: 48 }}>
                  <CheckCircle sx={{ color: '#2E7D32' }} />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.total > 0 ? (stats.present / stats.total) * 100 : 0} 
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Late Rate</Typography>
                  <Typography variant="h4">
                    {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#FFF3E0', width: 48, height: 48 }}>
                  <Warning sx={{ color: '#F57C00' }} />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.total > 0 ? (stats.late / stats.total) * 100 : 0} 
                sx={{ mt: 2, '& .MuiLinearProgress-bar': { bgcolor: '#F57C00' } }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Night Bonuses</Typography>
                  <Typography variant="h4">{stats.nightShifts * 500} CFA</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#E3F2FD', width: 48, height: 48 }}>
                  <Nightlight sx={{ color: '#1976D2' }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {stats.nightShifts} night shifts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>Sanctions</Typography>
                  <Typography variant="h4">{stats.sanctions * 2500} CFA</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#FFEBEE', width: 48, height: 48 }}>
                  <Weekend sx={{ color: '#C62828' }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {stats.sanctions} Saturday absences
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Line</InputLabel>
                <Select
                  value={filters.line}
                  label="Line"
                  onChange={(e) => setFilters({...filters, line: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  {productionLines.map(line => (
                    <MenuItem key={line.id} value={line.name}>{line.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select
                  value={filters.shift}
                  label="Shift"
                  onChange={(e) => setFilters({...filters, shift: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  {shifts.map(shift => (
                    <MenuItem key={shift.id} value={shift.name}>{shift.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterList />}
                onClick={fetchAttendance}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6">
              Attendance Records - {format(new Date(selectedDate), 'dd MMMM yyyy')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleMarkAbsent}
            >
              Mark Absent
            </Button>
          </Box>
          
          <DataGrid
            rows={filteredRecords}
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

      {/* View/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' ? 'Attendance Details' : 
           dialogMode === 'edit' ? 'Edit Attendance Record' : 'Mark Absent'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'view' && selectedRecord && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                <Typography variant="body1">{selectedRecord.employeeName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Code</Typography>
                <Typography variant="body1">{selectedRecord.employeeCode}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Position</Typography>
                <Typography variant="body1">{selectedRecord.position}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Line</Typography>
                <Typography variant="body1">{selectedRecord.line}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Shift</Typography>
                <Typography variant="body1">{selectedRecord.shift}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                {getStatusChip(selectedRecord.status)}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Check In</Typography>
                <Typography variant="body1">
                  {selectedRecord.checkIn ? format(parseISO(selectedRecord.checkIn), 'HH:mm:ss') : '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Check Out</Typography>
                <Typography variant="body1">
                  {selectedRecord.checkOut ? format(parseISO(selectedRecord.checkOut), 'HH:mm:ss') : '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Late Minutes</Typography>
                <Typography variant="body1">{selectedRecord.lateMinutes || 0} min</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Night Bonus</Typography>
                <Typography variant="body1">
                  {selectedRecord.nightBonus ? '500 CFA' : 'None'}
                </Typography>
              </Grid>
              {selectedRecord.sanction && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    Saturday absence sanction: {selectedRecord.sanctionAmount} CFA will be deducted
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {dialogMode === 'edit' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check In Time"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check Out Time"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({...formData, checkOutTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Late Minutes"
                  type="number"
                  value={formData.lateMinutes}
                  onChange={(e) => setFormData({...formData, lateMinutes: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Night Bonus</InputLabel>
                  <Select
                    value={formData.nightBonusEarned}
                    label="Night Bonus"
                    onChange={(e) => setFormData({...formData, nightBonusEarned: e.target.value})}
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Yes (500 CFA)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Sanction Applied</InputLabel>
                  <Select
                    value={formData.sanctionApplied}
                    label="Sanction Applied"
                    onChange={(e) => setFormData({...formData, sanctionApplied: e.target.value})}
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Yes (2500 CFA)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </Grid>
            </Grid>
          )}

          {dialogMode === 'mark' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={formData.employeeId}
                    label="Employee"
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  >
                    <MenuItem value={1}>Pierre Kamga (EMP001)</MenuItem>
                    <MenuItem value={2}>Marie Ndiaye (EMP002)</MenuItem>
                    <MenuItem value={3}>Paul Biyong (EMP003)</MenuItem>
                    <MenuItem value={4}>Jean Mbarga (EMP004)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Reason for Absence"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Marking as absent will apply Saturday sanction (2500 CFA) if today is Saturday
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveManual} variant="contained" color="primary">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
