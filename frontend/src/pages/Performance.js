import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Rating,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Star,
  StarBorder,
  TrendingUp,
  School,
  Assignment,
  ThumbUp,
  Warning,
  Visibility,
  Edit
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { API_URL } from '../config/api';

export default function Performance() {
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEvalDialog, setOpenEvalDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Evaluation form
  const [evalForm, setEvalForm] = useState({
    technicalSkills: 3,
    attendance: 3,
    teamwork: 3,
    quality: 3,
    comments: '',
    recommendation: 'continue'
  });

  // Mock data
  useEffect(() => {
    setEmployees([
      { 
        id: 1, 
        name: 'Marie Ndiaye', 
        code: 'EMP002', 
        position: 'Machine Operator', 
        line: 'Biscuit',
        status: 'permanent',
        hireDate: '2024-01-15',
        trainings: 3,
        attendance: 98,
        lastEvaluation: '2026-02-15',
        rating: 4.5
      },
      { 
        id: 2, 
        name: 'Pierre Kamga', 
        code: 'EMP001', 
        position: 'Quality Inspector', 
        line: 'Milk',
        status: 'permanent',
        hireDate: '2024-03-10',
        trainings: 2,
        attendance: 95,
        lastEvaluation: '2026-01-20',
        rating: 4.2
      },
      { 
        id: 3, 
        name: 'Paul Biyong', 
        code: 'EMP003', 
        position: 'Technician', 
        line: 'Candy',
        status: 'temporary',
        hireDate: '2024-06-01',
        trainings: 1,
        attendance: 88,
        lastEvaluation: null,
        rating: 3.8
      },
      { 
        id: 4, 
        name: 'Jean Mbarga', 
        code: 'EMP004', 
        position: 'Trainee', 
        line: 'Biscuit',
        status: 'temporary',
        hireDate: '2024-09-15',
        trainings: 1,
        attendance: 92,
        lastEvaluation: null,
        rating: null
      },
    ]);
    
    setEvaluations([
      { id: 1, employee: 'Marie Ndiaye', date: '2026-02-15', score: 4.5, evaluator: 'HR Manager' },
      { id: 2, employee: 'Pierre Kamga', date: '2026-01-20', score: 4.2, evaluator: 'Production Manager' },
    ]);
    
    setLoading(false);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEvaluate = (employee) => {
    setSelectedEmployee(employee);
    setEvalForm({
      technicalSkills: 3,
      attendance: 3,
      teamwork: 3,
      quality: 3,
      comments: '',
      recommendation: 'continue'
    });
    setOpenEvalDialog(true);
  };

  const handleSubmitEvaluation = () => {
    const totalScore = (
      evalForm.technicalSkills + 
      evalForm.attendance + 
      evalForm.teamwork + 
      evalForm.quality
    ) / 4;
    
    showSnackbar(`Evaluation submitted for ${selectedEmployee.name}. Score: ${totalScore.toFixed(1)}`, 'success');
    setOpenEvalDialog(false);
  };

  const getStatusChip = (status) => {
    return status === 'permanent' ? 
      <Chip size="small" label="Permanent" color="success" /> :
      <Chip size="small" label="Temporary" color="warning" />;
  };

  const getRecommendationChip = (rec) => {
    switch(rec) {
      case 'promote': return <Chip size="small" label="Promote" color="success" />;
      case 'train': return <Chip size="small" label="Training Needed" color="info" />;
      case 'terminate': return <Chip size="small" label="Review" color="error" />;
      default: return <Chip size="small" label="Continue" color="default" />;
    }
  };

  const stats = {
    total: employees.length,
    permanent: employees.filter(e => e.status === 'permanent').length,
    temporary: employees.filter(e => e.status === 'temporary').length,
    pendingReview: employees.filter(e => !e.lastEvaluation).length,
    highPerformers: employees.filter(e => e.rating >= 4).length
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" color="primary.main">
          Performance Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assignment />}
        >
          Generate Report
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Employees</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Permanent</Typography>
              <Typography variant="h4" color="success.main">{stats.permanent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Temporary</Typography>
              <Typography variant="h4" color="warning.main">{stats.temporary}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>High Performers</Typography>
              <Typography variant="h4" color="info.main">{stats.highPerformers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Employee Performance Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Attendance</TableCell>
                      <TableCell>Trainings</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                              {emp.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{emp.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {emp.code}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>{getStatusChip(emp.status)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={emp.attendance} 
                              sx={{ width: 60, mr: 1 }}
                            />
                            {emp.attendance}%
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={emp.trainings} 
                            icon={<School />}
                          />
                        </TableCell>
                        <TableCell>
                          {emp.rating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={emp.rating} precision={0.5} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({emp.rating})
                              </Typography>
                            </Box>
                          ) : (
                            <Chip size="small" label="Not rated" color="default" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEvaluate(emp)}
                            title="Evaluate"
                          >
                            <Assignment />
                          </IconButton>
                          <IconButton size="small" title="View Details">
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Evaluations & Recommendations */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Evaluations
              </Typography>
              {evaluations.map((eval_, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < evaluations.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Typography variant="subtitle2">{eval_.employee}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Rating value={eval_.score} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(eval_.date), 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    By: {eval_.evaluator}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ready for Conversion
              </Typography>
              {employees
                .filter(emp => emp.status === 'temporary' && emp.rating >= 4)
                .map((emp, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2">{emp.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {emp.position} - {emp.line} Line
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" color="success">
                      Convert
                    </Button>
                  </Box>
                ))}
              {employees.filter(emp => emp.status === 'temporary' && emp.rating >= 4).length === 0 && (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                  No employees ready for conversion
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Evaluation Dialog */}
        <Dialog open={openEvalDialog} onClose={() => setOpenEvalDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Performance Evaluation - {selectedEmployee?.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Technical Skills</Typography>
                <Rating
                  value={evalForm.technicalSkills}
                  onChange={(e, v) => setEvalForm({...evalForm, technicalSkills: v})}
                  size="large"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Attendance & Punctuality</Typography>
                <Rating
                  value={evalForm.attendance}
                  onChange={(e, v) => setEvalForm({...evalForm, attendance: v})}
                  size="large"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Teamwork & Collaboration</Typography>
                <Rating
                  value={evalForm.teamwork}
                  onChange={(e, v) => setEvalForm({...evalForm, teamwork: v})}
                  size="large"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Quality of Work</Typography>
                <Rating
                  value={evalForm.quality}
                  onChange={(e, v) => setEvalForm({...evalForm, quality: v})}
                  size="large"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comments & Feedback"
                  value={evalForm.comments}
                  onChange={(e) => setEvalForm({...evalForm, comments: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recommendation</InputLabel>
                  <Select
                    value={evalForm.recommendation}
                    label="Recommendation"
                    onChange={(e) => setEvalForm({...evalForm, recommendation: e.target.value})}
                  >
                    <MenuItem value="continue">Continue Current Role</MenuItem>
                    <MenuItem value="promote">Promote / Convert to Permanent</MenuItem>
                    <MenuItem value="train">Additional Training Required</MenuItem>
                    <MenuItem value="terminate">Performance Review Needed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEvalDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitEvaluation} variant="contained" color="primary">
              Submit Evaluation
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>

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
