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
  Stepper,
  Step,
  StepLabel,
  Badge
} from '@mui/material';
import {
  Schedule,
  Refresh,
  Download,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
  Nightlight,
  Weekend,
  WbSunny,
  Brightness3,
  WbTwilight,
  CalendarToday,
  Autorenew,
  Save,
  Cancel,
  Person
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format, addWeeks, startOfWeek, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../config/api';
import { getStoredUser } from '../config/access';

export default function Shifts() {
  const user = getStoredUser();
  const isWorker = user.role === 'worker';
  // State
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [shifts, setShifts] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRotateDialog, setOpenRotateDialog] = useState(false);
  const [openDryWeekDialog, setOpenDryWeekDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rotationWeeks, setRotationWeeks] = useState(4);
  
  // Filters
  const [filters, setFilters] = useState({
    line: '',
    shift: ''
  });

  // Mock data
  const [productionLines, setProductionLines] = useState([
    { id: 1, name: 'Biscuit Line 1', color: '#E8F5E9' },
    { id: 2, name: 'Biscuit Line 2', color: '#E3F2FD' },
    { id: 3, name: 'Milk Line', color: '#FFF3E0' },
    { id: 4, name: 'Candy Line', color: '#F3E5F5' },
    { id: 5, name: 'Packaging', color: '#E1F5FE' }
  ]);

  const [shiftTypes, setShiftTypes] = useState([
    { id: 1, name: 'Morning', icon: <WbSunny />, color: '#FFB74D', time: '07:00 - 15:00' },
    { id: 2, name: 'Afternoon', icon: <WbTwilight />, color: '#FFA726', time: '15:00 - 23:00' },
    { id: 3, name: 'Night', icon: <Brightness3 />, color: '#5C6BC0', time: '23:00 - 07:00', bonus: 500 },
    { id: 4, name: 'Saturday Cleaning', icon: <Weekend />, color: '#66BB6A', time: '07:00 - 15:00' }
  ]);

  // Mock employees
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Pierre Kamga', code: 'EMP001', line: 1, status: 'permanent' },
    { id: 2, name: 'Marie Ndiaye', code: 'EMP002', line: 1, status: 'permanent' },
    { id: 3, name: 'Paul Biyong', code: 'EMP003', line: 2, status: 'permanent' },
    { id: 4, name: 'Jean Mbarga', code: 'EMP004', line: 2, status: 'temporary' },
    { id: 5, name: 'Claire Abena', code: 'EMP005', line: 3, status: 'permanent' },
    { id: 6, name: 'Luc Tchamba', code: 'EMP006', line: 3, status: 'temporary' },
    { id: 7, name: 'Sarah Nkeng', code: 'EMP007', line: 4, status: 'permanent' },
    { id: 8, name: 'David Eto', code: 'EMP008', line: 4, status: 'permanent' },
    { id: 9, name: 'Rosine Manga', code: 'EMP009', line: 5, status: 'temporary' },
    { id: 10, name: 'Franck Bile', code: 'EMP010', line: 5, status: 'permanent' }
  ]);

  useEffect(() => {
    if (isWorker) {
      fetchMySchedule();
      return;
    }

    generateMockData();
  }, [selectedWeek]);

  const fetchMySchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/shifts/my-schedule?weekStart=${selectedWeek}`, { headers });
      const scheduleData = response.data || [];

      setSchedules(scheduleData.map((schedule) => ({
        id: schedule.id,
        employeeId: schedule.employeeId,
        employeeName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'My Schedule',
        employeeCode: user.email || '',
        line: schedule.productionLine?.id || 0,
        lineName: schedule.productionLine?.name || '-',
        date: schedule.date,
        dayName: format(new Date(schedule.date), 'EEEE'),
        shiftId: schedule.shift?.id || 0,
        shiftName: schedule.shift?.name || '-',
        shiftTime: schedule.shift ? `${schedule.shift.startTime} - ${schedule.shift.endTime}` : '-',
        status: 'scheduled'
      })));
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to load schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    setLoading(true);
    
    // Generate 3-week rotation pattern
    const rotationPattern = [
      { week: 1, name: 'Week 1', shift: 'Morning', shiftId: 1 },
      { week: 2, name: 'Week 2', shift: 'Afternoon', shiftId: 2 },
      { week: 3, name: 'Week 3', shift: 'Night', shiftId: 3 },
      { week: 4, name: 'Week 4', shift: 'Morning', shiftId: 1 },
      { week: 5, name: 'Week 5', shift: 'Afternoon', shiftId: 2 },
      { week: 6, name: 'Week 6', shift: 'Night', shiftId: 3 },
    ];

    // Generate rotations for all employees
    const rotData = [];
    employees.forEach(emp => {
      for (let w = 0; w < 6; w++) {
        const weekDate = addWeeks(new Date(selectedWeek), w);
        const pattern = rotationPattern[w % 6];
        
        // Check if dry biscuit week (every 4 weeks)
        const isDryWeek = w % 4 === 3; // Mock: week 4,8,12 are dry
        let actualShift = pattern;
        
        if (isDryWeek && pattern.shift === 'Night') {
          actualShift = { ...pattern, shift: 'Morning', shiftId: 1 };
        }

        rotData.push({
          id: `${emp.id}-${w}`,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeCode: emp.code,
          line: emp.line,
          weekStart: format(weekDate, 'yyyy-MM-dd'),
          weekNumber: w + 1,
          shiftId: actualShift.shiftId,
          shiftName: actualShift.shift,
          isDryWeek,
          status: isDryWeek && emp.status === 'temporary' ? 'excluded' : 'scheduled'
        });
      }
    });
    setRotations(rotData);

    // Generate daily schedules for current week
    const scheduleData = [];
    const currentWeekStart = new Date(selectedWeek);
    
    employees.forEach(emp => {
      // Get rotation for this week
      const weekRotation = rotData.find(r => 
        r.employeeId === emp.id && 
        r.weekStart === selectedWeek
      );

      if (weekRotation && weekRotation.status !== 'excluded') {
        // Generate Monday to Friday
        for (let day = 0; day < 5; day++) {
          const date = addDays(currentWeekStart, day);
          scheduleData.push({
            id: `${emp.id}-${day}`,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeCode: emp.code,
            line: emp.line,
            date: format(date, 'yyyy-MM-dd'),
            dayName: format(date, 'EEEE'),
            shiftId: weekRotation.shiftId,
            shiftName: weekRotation.shiftName,
            checkIn: day === 2 ? '07:05' : day === 3 ? null : '06:55', // Mock some check-ins
            status: day === 3 ? 'absent' : day === 2 ? 'late' : 'present'
          });
        }
        // Add Saturday
        const saturday = addDays(currentWeekStart, 5);
        scheduleData.push({
          id: `${emp.id}-sat`,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeCode: emp.code,
          line: emp.line,
          date: format(saturday, 'yyyy-MM-dd'),
          dayName: 'Saturday',
          shiftId: 4,
          shiftName: 'Saturday Cleaning',
          checkIn: Math.random() > 0.2 ? '06:58' : null,
          status: Math.random() > 0.2 ? 'present' : 'absent'
        });
      }
    });
    setSchedules(scheduleData);

    // Generate shift summary
    const shiftSummary = [];
    for (let day = 0; day < 7; day++) {
      const date = addDays(currentWeekStart, day);
      const daySchedules = scheduleData.filter(s => s.date === format(date, 'yyyy-MM-dd'));
      
      const morning = daySchedules.filter(s => s.shiftId === 1).length;
      const afternoon = daySchedules.filter(s => s.shiftId === 2).length;
      const night = daySchedules.filter(s => s.shiftId === 3).length;
      const cleaning = daySchedules.filter(s => s.shiftId === 4).length;

      shiftSummary.push({
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEEE'),
        morning,
        afternoon,
        night,
        cleaning,
        total: daySchedules.length
      });
    }
    setShifts(shiftSummary);

    setLoading(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleGenerateRotation = () => {
    setOpenRotateDialog(true);
  };

  const handleConfirmRotation = () => {
    showSnackbar(`Generated ${rotationWeeks} weeks of shift rotations`, 'success');
    setOpenRotateDialog(false);
    generateMockData();
  };

  const handleDryBiscuitWeek = () => {
    setOpenDryWeekDialog(true);
  };

  const handleConfirmDryWeek = (week) => {
    showSnackbar(`Dry biscuit week applied. Night shifts disabled, temporary workers excluded.`, 'success');
    setOpenDryWeekDialog(false);
    generateMockData();
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleExport = () => {
    showSnackbar('Exporting schedule...', 'info');
  };

  const getShiftChip = (shiftId) => {
    const shift = shiftTypes.find(s => s.id === shiftId) || shiftTypes[0];
    return (
      <Chip
        icon={shift.icon}
        label={shift.name}
        size="small"
        sx={{ 
          bgcolor: shift.color,
          color: shiftId === 3 ? 'white' : 'black',
          fontWeight: 500
        }}
      />
    );
  };

  const getStatusChip = (status) => {
    const config = {
      present: { color: 'success', label: 'Present' },
      late: { color: 'warning', label: 'Late' },
      absent: { color: 'error', label: 'Absent' },
      scheduled: { color: 'info', label: 'Scheduled' },
      excluded: { color: 'default', label: 'Excluded' }
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" label={c.label} color={c.color} />;
  };

  const getLineColor = (lineId) => {
    return productionLines.find(l => l.id === lineId)?.color || '#f5f5f5';
  };

  // Calculate stats
  const stats = {
    totalEmployees: employees.length,
    permanent: employees.filter(e => e.status === 'permanent').length,
    temporary: employees.filter(e => e.status === 'temporary').length,
    nightShifts: schedules.filter(s => s.shiftId === 3).length,
    saturdayWorkers: schedules.filter(s => s.dayName === 'Saturday' && s.status !== 'absent').length,
    nightBonus: schedules.filter(s => s.shiftId === 3).length * 500
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesLine = filters.line === '' || s.line === parseInt(filters.line);
    const matchesShift = filters.shift === '' || s.shiftId === parseInt(filters.shift);
    return matchesLine && matchesShift;
  });

  const columns = [
    { 
      field: 'employeeName', 
      headerName: 'Employee', 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: getLineColor(params.row.line) }}>
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
      field: 'line', 
      headerName: 'Line', 
      width: 120,
      valueGetter: (params) => productionLines.find(l => l.id === params.value)?.name || 'N/A'
    },
    { 
      field: 'dayName', 
      headerName: 'Day', 
      width: 100 
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 100,
      valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
    },
    { 
      field: 'shiftName', 
      headerName: 'Shift', 
      width: 120,
      renderCell: (params) => getShiftChip(params.row.shiftId)
    },
    { 
      field: 'checkIn', 
      headerName: 'Check In', 
      width: 100,
      valueGetter: (params) => params.value || '-'
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
      width: 100,
      renderCell: (params) => (
        <Tooltip title="View Employee">
          <IconButton size="small" onClick={() => handleViewEmployee(params.row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  if (isWorker) {
    const workerColumns = [
      {
        field: 'date',
        headerName: 'Date',
        width: 120,
        valueGetter: (params) => format(new Date(params.value), 'dd/MM/yy')
      },
      { field: 'dayName', headerName: 'Day', width: 120 },
      {
        field: 'shiftName',
        headerName: 'Shift',
        width: 160,
        renderCell: (params) => getShiftChip(params.row.shiftId)
      },
      { field: 'shiftTime', headerName: 'Hours', width: 180 },
      { field: 'lineName', headerName: 'Line', width: 180 }
    ];

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h4" color="primary.main">
            My Schedule
          </Typography>
          <Button variant="contained" startIcon={<Refresh />} onClick={fetchMySchedule}>
            Refresh
          </Button>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Week Starting"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Alert severity="info">
                  This page shows only your personal weekly schedule.
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DataGrid
              rows={schedules}
              columns={workerColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              autoHeight
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row.id}
            />
          </CardContent>
        </Card>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" color="primary.main">
          Shift Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Autorenew />}
            onClick={handleGenerateRotation}
            sx={{ mr: 2 }}
          >
            Generate Rotation
          </Button>
          <Button
            variant="outlined"
            startIcon={<Weekend />}
            onClick={handleDryBiscuitWeek}
            sx={{ mr: 2 }}
            color="warning"
          >
            Dry Biscuit Week
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export Schedule
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Staff</Typography>
              <Typography variant="h5">{stats.totalEmployees}</Typography>
              <Typography variant="caption">
                {stats.permanent} perm / {stats.temporary} temp
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Morning</Typography>
              <Typography variant="h5">
                {schedules.filter(s => s.shiftId === 1).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Afternoon</Typography>
              <Typography variant="h5">
                {schedules.filter(s => s.shiftId === 2).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Night</Typography>
              <Typography variant="h5">
                {schedules.filter(s => s.shiftId === 3).length}
              </Typography>
              <Typography variant="caption">Bonus: {stats.nightBonus} CFA</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#F3E5F5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Saturday</Typography>
              <Typography variant="h5">{stats.saturdayWorkers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Week Selection and Rotation Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Week Starting"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Line</InputLabel>
                <Select
                  value={filters.line}
                  label="Line"
                  onChange={(e) => setFilters({...filters, line: e.target.value})}
                >
                  <MenuItem value="">All Lines</MenuItem>
                  {productionLines.map(line => (
                    <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>
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
                  <MenuItem value="">All Shifts</MenuItem>
                  {shiftTypes.map(shift => (
                    <MenuItem key={shift.id} value={shift.id}>{shift.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Alert severity="info" icon={<Autorenew />}>
                <strong>3-Week Rotation Cycle:</strong> Morning → Afternoon → Night → repeats
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Weekly Summary Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weekly Shift Distribution
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell align="center">Morning</TableCell>
                  <TableCell align="center">Afternoon</TableCell>
                  <TableCell align="center">Night</TableCell>
                  <TableCell align="center">Cleaning</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shifts.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>
                      <strong>{day.dayName}</strong>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {format(new Date(day.date), 'dd MMM')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={day.morning} 
                        sx={{ bgcolor: '#FFB74D', minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={day.afternoon} 
                        sx={{ bgcolor: '#FFA726', minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={day.night} 
                        sx={{ bgcolor: '#5C6BC0', color: 'white', minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={day.cleaning} 
                        sx={{ bgcolor: '#66BB6A', minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <strong>{day.total}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Daily Schedule */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Schedule - Week of {format(new Date(selectedWeek), 'dd MMM yyyy')}
          </Typography>
          <DataGrid
            rows={filteredSchedules}
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

      {/* Rotation Generator Dialog */}
      <Dialog open={openRotateDialog} onClose={() => setOpenRotateDialog(false)}>
        <DialogTitle>
          Generate Shift Rotation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" paragraph>
              This will generate a 3-week rotation cycle for all permanent employees.
              Temporary employees will be scheduled based on production needs.
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Number of Weeks</InputLabel>
              <Select
                value={rotationWeeks}
                label="Number of Weeks"
                onChange={(e) => setRotationWeeks(e.target.value)}
              >
                <MenuItem value={4}>4 weeks (1 cycle + 1 week)</MenuItem>
                <MenuItem value={6}>6 weeks (2 full cycles)</MenuItem>
                <MenuItem value={12}>12 weeks (4 full cycles)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Rotation Pattern:</Typography>
              <Stepper activeStep={-1} alternativeLabel>
                <Step><StepLabel>Week 1<br />Morning</StepLabel></Step>
                <Step><StepLabel>Week 2<br />Afternoon</StepLabel></Step>
                <Step><StepLabel>Week 3<br />Night</StepLabel></Step>
                <Step><StepLabel>Week 4<br />Morning</StepLabel></Step>
              </Stepper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRotateDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmRotation} variant="contained" color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dry Biscuit Week Dialog */}
      <Dialog open={openDryWeekDialog} onClose={() => setOpenDryWeekDialog(false)}>
        <DialogTitle>
          Configure Dry Biscuit Week
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              During dry biscuit weeks:
              <ul>
                <li>No night shifts</li>
                <li>Temporary workers do not work</li>
                <li>Production limited to day shifts</li>
              </ul>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Select Week</InputLabel>
              <Select
                value={selectedWeek}
                label="Select Week"
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                <MenuItem value={selectedWeek}>Current Week</MenuItem>
                <MenuItem value={format(addWeeks(new Date(selectedWeek), 1), 'yyyy-MM-dd')}>
                  Next Week
                </MenuItem>
                <MenuItem value={format(addWeeks(new Date(selectedWeek), 2), 'yyyy-MM-dd')}>
                  In 2 Weeks
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDryWeekDialog(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmDryWeek(selectedWeek)} variant="contained" color="warning">
            Apply Dry Week
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Employee Schedule - {selectedEmployee?.employeeName}
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                  <Typography variant="body1">{selectedEmployee.employeeName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Code</Typography>
                  <Typography variant="body1">{selectedEmployee.employeeCode}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Line</Typography>
                  <Typography variant="body1">
                    {productionLines.find(l => l.id === selectedEmployee.line)?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Shift</Typography>
                  {getShiftChip(selectedEmployee.shiftId)}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Weekly Schedule</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>Shift</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedules
                      .filter(s => s.employeeId === selectedEmployee.employeeId)
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{format(new Date(s.date), 'dd/MM/yy')}</TableCell>
                          <TableCell>{s.dayName}</TableCell>
                          <TableCell>{getShiftChip(s.shiftId)}</TableCell>
                          <TableCell>{s.checkIn || '-'}</TableCell>
                          <TableCell>{getStatusChip(s.status)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
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
