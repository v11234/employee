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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tab,
  Tabs
} from '@mui/material';
import {
  Calculate,
  Download,
  PictureAsPdf,
  TableChart,
  Visibility,
  CheckCircle,
  Warning,
  AttachMoney,
  Nightlight,
  Weekend
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { API_URL } from '../config/api';

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openPayslipDialog, setOpenPayslipDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Mock data for demonstration
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Marie Ndiaye', code: 'EMP002', position: 'Machine Operator', line: 'Biscuit', baseSalary: 150000 },
    { id: 2, name: 'Pierre Kamga', code: 'EMP001', position: 'Quality Inspector', line: 'Milk', baseSalary: 175000 },
    { id: 3, name: 'Paul Biyong', code: 'EMP003', position: 'Technician', line: 'Candy', baseSalary: 200000 },
  ]);

  const [attendance, setAttendance] = useState({
    'EMP002': { present: 22, absent: 2, late: 1, nightShifts: 8 },
    'EMP001': { present: 20, absent: 4, late: 2, nightShifts: 5 },
    'EMP003': { present: 24, absent: 0, late: 0, nightShifts: 12 },
  });

  useEffect(() => {
    calculatePayroll();
  }, [selectedMonth, selectedYear]);

  const calculatePayroll = () => {
    setLoading(true);
    
    const calculated = employees.map(emp => {
      const att = attendance[emp.code] || { present: 0, absent: 0, late: 0, nightShifts: 0 };
      
      // Calculations
      const dailyRate = emp.baseSalary / 30;
      const nightBonus = att.nightShifts * 500;
      const saturdayAbsences = att.absent; // In real app, count Saturday absences
      const sanctions = saturdayAbsences * 2500;
      
      const grossSalary = emp.baseSalary + nightBonus;
      const deductions = sanctions;
      const netSalary = grossSalary - deductions;
      
      return {
        ...emp,
        ...att,
        dailyRate,
        nightBonus,
        sanctions,
        grossSalary,
        deductions,
        netSalary
      };
    });
    
    setPayrollData(calculated);
    setLoading(false);
  };

  const handleExport = (format) => {
    showSnackbar(`Exporting to ${format}...`, 'info');
    // Implement export logic
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewPayslip = (employee) => {
    setSelectedEmployee(employee);
    setOpenPayslipDialog(true);
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026'];

  const totals = payrollData.reduce((acc, emp) => ({
    gross: acc.gross + emp.grossSalary,
    deductions: acc.deductions + emp.deductions,
    net: acc.net + emp.netSalary,
    nightBonuses: acc.nightBonuses + emp.nightBonus,
    sanctions: acc.sanctions + emp.sanctions
  }), { gross: 0, deductions: 0, net: 0, nightBonuses: 0, sanctions: 0 });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" color="primary.main">
          Payroll Management
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
            startIcon={<TableChart />}
            onClick={() => handleExport('Excel')}
            sx={{ mr: 2 }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Calculate />}
            onClick={calculatePayroll}
          >
            Calculate
          </Button>
        </Box>
      </Box>

      {/* Month/Year Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">
                Night Bonus: 500 CFA per night | Saturday Absence Sanction: 2500 CFA
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Gross</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {totals.gross.toLocaleString()} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Night Bonuses</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F57C00' }}>
                {totals.nightBonuses.toLocaleString()} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFEBEE' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Sanctions</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#C62828' }}>
                {totals.sanctions.toLocaleString()} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Net Payroll</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                {totals.net.toLocaleString()} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Payroll Summary" />
          <Tab label="Night Bonus Details" />
          <Tab label="Sanctions" />
          <Tab label="Payslips" />
        </Tabs>
      </Paper>

      {/* Payroll Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell align="right">Present</TableCell>
                  <TableCell align="right">Absent</TableCell>
                  <TableCell align="right">Night Shifts</TableCell>
                  <TableCell align="right">Night Bonus</TableCell>
                  <TableCell align="right">Sanctions</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollData.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.code}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell align="right">{emp.present}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        size="small" 
                        label={emp.absent}
                        color={emp.absent > 0 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        size="small" 
                        label={emp.nightShifts}
                        icon={<Nightlight />}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">{emp.nightBonus} CFA</TableCell>
                    <TableCell align="right">
                      {emp.sanctions > 0 ? (
                        <Chip 
                          size="small" 
                          label={`${emp.sanctions} CFA`}
                          color="error"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <strong>{emp.netSalary.toLocaleString()} CFA</strong>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewPayslip(emp)}
                        title="View Payslip"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Download">
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      <Dialog open={openPayslipDialog} onClose={() => setOpenPayslipDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Payslip - {selectedEmployee?.name}
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 3, backgroundColor: '#fafafa' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                    <Typography variant="body1">{selectedEmployee.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Code</Typography>
                    <Typography variant="body1">{selectedEmployee.code}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Position</Typography>
                    <Typography variant="body1">{selectedEmployee.position}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Period</Typography>
                    <Typography variant="body1">
                      {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Earnings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Base Salary</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">{selectedEmployee.baseSalary} CFA</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Night Bonus ({selectedEmployee.nightShifts} nights)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right" color="success.main">+ {selectedEmployee.nightBonus} CFA</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>Deductions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Saturday Absence Sanctions</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right" color="error.main">- {selectedEmployee.sanctions} CFA</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">NET SALARY</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right" color="primary">
                      {selectedEmployee.netSalary} CFA
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayslipDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download PDF
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
