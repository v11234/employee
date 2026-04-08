import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button
} from '@mui/material';
import {
  People,
  AccessTime,
  Schedule,
  BeachAccess,
  TrendingUp,
  Warning,
  CheckCircle,
  Person
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    present: 0,
    absent: 0,
    leave: 0,
    nightShifts: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch employees
      const employeesRes = await axios.get(`${API_URL}/employees`, { headers });

      // Fetch today's attendance
      const attendanceRes = await axios.get(`${API_URL}/attendance/today`, { headers });

      // Fetch schedules
      const today = format(new Date(), 'yyyy-MM-dd');
      const schedulesRes = await axios.get(`${API_URL}/shifts/schedules?weekStart=${today}`, { headers });

      const employees = employeesRes.data.data || [];
      const attendance = attendanceRes.data.details || [];

      setStats({
        employees: employees.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        leave: attendance.filter(a => a.status === 'leave').length,
        nightShifts: schedulesRes.data.total || 0
      });

      setRecentAttendance(attendance.slice(0, 5));

      // Mock upcoming shifts for now
      setUpcomingShifts([
        { employee: 'Dr VETRAN', shift: 'Morning', time: '08:00 - 12:00', line: 'Level1/2' },
        { employee: 'Mr ALEX', shift: 'Afternoon', time: '1:00 - 5:00', line: 'Level1/2' },
        { employee: 'Dr SAM', shift: 'Night', time: '5:00 - 9:00', line: 'Level 3' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, bgColor }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: bgColor, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats.employees}
            icon={<People />}
            bgColor="#E8F5E9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Present Today"
            value={stats.present}
            icon={<CheckCircle />}
            bgColor="#E8F5E9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absent"
            value={stats.absent}
            icon={<Warning />}
            bgColor="#FFEBEE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Night Bonus"
            value={`${stats.nightShifts * 500} CFA`}
            icon={<Schedule />}
            bgColor="#FFF3E0"
          />
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Attendance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Attendance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { day: 'Mon', present: 12, absent: 2 },
                    { day: 'Tue', present: 14, absent: 0 },
                    { day: 'Wed', present: 13, absent: 1 },
                    { day: 'Thu', present: 11, absent: 3 },
                    { day: 'Fri', present: 14, absent: 0 },
                    { day: 'Sat', present: 10, absent: 4 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#2E7D32" />
                  <Bar dataKey="absent" fill="#F57C00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attendance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Check-ins
              </Typography>
              <List>
                {recentAttendance.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No recent check-ins" />
                  </ListItem>
                ) : (
                  recentAttendance.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.employee?.firstName + ' ' + item.employee?.lastName}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="textSecondary">
                                {item.checkInTime ? format(parseISO(item.checkInTime), 'HH:mm') : 'Not checked in'}
                              </Typography>
                              <Chip
                                size="small"
                                label={item.status}
                                color={item.status === 'present' ? 'success' : item.status === 'late' ? 'warning' : 'error'}
                                sx={{ ml: 1 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                      {index < recentAttendance.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Shifts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Shifts
              </Typography>
              <List>
                {upcomingShifts.map((shift, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={shift.employee}
                        secondary={`${shift.shift} (${shift.time}) - ${shift.line} Line`}
                      />
                      <Chip label="On Time" size="small" color="success" />
                    </ListItem>
                    {index < upcomingShifts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccessTime />}
                    onClick={() => window.location.href = '/attendance'}
                  >
                    Mark Attendance
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BeachAccess />}
                    onClick={() => window.location.href = '/leave'}
                  >
                    Leave Request
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => window.location.href = '/employees'}
                  >
                    New Employee
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => window.location.href = '/training'}
                  >
                    Training
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}