const { Attendance, Employee, Shift, WorkSchedule, Sanction, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// @desc    Check-in employee
// @route   POST /api/attendance/checkin
// @access  Private (Supervisor, Manager, HR)
const checkIn = async (req, res) => {
  try {
    const { employeeCode, notes } = req.body;
    
    // Find employee by code
    const employee = await Employee.findOne({ 
      where: { employeeCode, isActive: true },
      include: ['productionLine']
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const today = moment().format('YYYY-MM-DD');
    const currentTime = moment();
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: today
      }
    });
    
    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ message: 'Employee already checked in today' });
    }
    
    // Get today's schedule
    const schedule = await WorkSchedule.findOne({
      where: {
        employeeId: employee.id,
        date: today
      },
      include: ['shift']
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found for today' });
    }
    
    // Calculate late minutes
    const shiftStart = moment(schedule.shift.startTime, 'HH:mm:ss');
    const scheduledStart = moment(today + ' ' + schedule.shift.startTime);
    const lateMinutes = Math.max(0, moment.duration(currentTime.diff(scheduledStart)).asMinutes());
    
    // Determine status
    let status = 'present';
    let sanctionAmount = 0;
    let sanctionApplied = false;
    
    // Rule: Late after 15min grace period
    if (lateMinutes > 15) {
      status = 'late';
    }
    
    // Rule: Absent if more than 2 hours late
    if (lateMinutes > 120) {
      status = 'absent';
    }
    
    // Rule: Saturday absence sanction (2500F)
    const isSaturday = moment(today).day() === 6; // 6 = Saturday
    if (isSaturday && status === 'absent') {
      sanctionAmount = 2500;
      sanctionApplied = true;
    }
    
    // Check if night shift for bonus
    const isNightShift = schedule.shift.name === 'night';
    const nightBonusEarned = isNightShift && status !== 'absent';
    
    // Create or update attendance
    let attendance;
    if (existingAttendance) {
      attendance = await existingAttendance.update({
        checkInTime: currentTime.toDate(),
        status,
        lateMinutes,
        nightBonusEarned,
        sanctionApplied,
        sanctionAmount,
        notes: notes || existingAttendance.notes,
        recordedBy: req.user.id
      });
    } else {
      attendance = await Attendance.create({
        employeeId: employee.id,
        date: today,
        scheduledShiftId: schedule.shiftId,
        checkInTime: currentTime.toDate(),
        status,
        lateMinutes,
        nightBonusEarned,
        sanctionApplied,
        sanctionAmount,
        notes,
        recordedBy: req.user.id
      });
    }
    
    // Create sanction if needed
    if (sanctionApplied && sanctionAmount > 0) {
      await Sanction.create({
        employeeId: employee.id,
        sanctionType: 'absence',
        incidentDate: today,
        description: 'Saturday absence',
        amount: sanctionAmount,
        appliedDate: moment().format('YYYY-MM-DD'),
        appliedBy: req.user.id,
        notes: 'Automatic sanction for Saturday absence'
      });
    }
    
    res.json({
      message: 'Check-in successful',
      attendance: {
        id: attendance.id,
        employee: `${employee.firstName} ${employee.lastName}`,
        checkInTime: attendance.checkInTime,
        status: attendance.status,
        lateMinutes: attendance.lateMinutes,
        nightBonusEarned: attendance.nightBonusEarned,
        sanctionApplied: attendance.sanctionApplied,
        sanctionAmount: attendance.sanctionAmount
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-out employee
// @route   POST /api/attendance/checkout
// @access  Private (Supervisor, Manager, HR)
const checkOut = async (req, res) => {
  try {
    const { employeeCode } = req.body;
    
    // Find employee by code
    const employee = await Employee.findOne({ 
      where: { employeeCode, isActive: true }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const today = moment().format('YYYY-MM-DD');
    const currentTime = moment();
    
    // Find today's attendance
    const attendance = await Attendance.findOne({
      where: {
        employeeId: employee.id,
        date: today
      }
    });
    
    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }
    
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    
    // Update checkout time
    await attendance.update({
      checkOutTime: currentTime.toDate()
    });
    
    res.json({
      message: 'Check-out successful',
      attendance: {
        id: attendance.id,
        employee: `${employee.firstName} ${employee.lastName}`,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark absence manually
// @route   POST /api/attendance/mark-absent
// @access  Private (HR, Manager, Director)
const markAbsent = async (req, res) => {
  try {
    const { employeeId, date, reason } = req.body;
    
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const attendanceDate = date || moment().format('YYYY-MM-DD');
    const isSaturday = moment(attendanceDate).day() === 6;
    
    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      where: {
        employeeId,
        date: attendanceDate
      }
    });
    
    const sanctionAmount = isSaturday ? 2500 : 0;
    const sanctionApplied = isSaturday;
    
    if (attendance) {
      await attendance.update({
        status: 'absent',
        absenceReason: reason,
        sanctionApplied,
        sanctionAmount,
        recordedBy: req.user.id
      });
    } else {
      attendance = await Attendance.create({
        employeeId,
        date: attendanceDate,
        status: 'absent',
        absenceReason: reason,
        sanctionApplied,
        sanctionAmount,
        recordedBy: req.user.id
      });
    }
    
    // Create sanction if Saturday
    if (isSaturday) {
      await Sanction.create({
        employeeId,
        sanctionType: 'absence',
        incidentDate: attendanceDate,
        description: reason || 'Saturday absence',
        amount: 2500,
        appliedDate: moment().format('YYYY-MM-DD'),
        appliedBy: req.user.id
      });
    }
    
    res.json({
      message: 'Absence marked successfully',
      attendance
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private (Supervisor, Manager, HR, Director)
const getTodayAttendance = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    const attendance = await Attendance.findAll({
      where: { date: today },
      include: [
        { 
          model: Employee, 
          as: 'employee',
          include: ['productionLine', 'position']
        },
        { model: Shift, as: 'scheduledShift' }
      ],
      order: [['checkInTime', 'ASC']]
    });
    
    // Group by status
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      notCheckedIn: 0 // Will calculate below
    };
    
    // Get total employees expected today
    const schedules = await WorkSchedule.findAll({
      where: { date: today },
      include: ['employee']
    });
    
    summary.notCheckedIn = schedules.length - attendance.filter(a => a.checkInTime).length;
    
    res.json({
      date: today,
      summary,
      details: attendance
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private (HR, Director)
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, lineId } = req.query;
    
    const start = startDate || moment().startOf('month').format('YYYY-MM-DD');
    const end = endDate || moment().endOf('month').format('YYYY-MM-DD');
    
    let whereClause = {
      date: {
        [Op.between]: [start, end]
      }
    };
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        { 
          model: Employee, 
          as: 'employee',
          where: lineId ? { productionLineId: lineId } : {},
          include: ['productionLine', 'position']
        }
      ],
      order: [['date', 'DESC'], ['employeeId', 'ASC']]
    });
    
    // Calculate summary statistics
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      totalLateMinutes: attendance.reduce((sum, a) => sum + a.lateMinutes, 0),
      totalSanctions: attendance.filter(a => a.sanctionApplied).length,
      totalSanctionAmount: attendance.reduce((sum, a) => sum + a.sanctionAmount, 0),
      totalNightBonuses: attendance.filter(a => a.nightBonusEarned).length
    };
    
    // Group by employee for individual stats
    const byEmployee = {};
    attendance.forEach(record => {
      const empId = record.employee.id;
      if (!byEmployee[empId]) {
        byEmployee[empId] = {
          employee: `${record.employee.firstName} ${record.employee.lastName}`,
          line: record.employee.productionLine?.name,
          position: record.employee.position?.name,
          present: 0,
          late: 0,
          absent: 0,
          lateMinutes: 0,
          sanctions: 0,
          sanctionAmount: 0,
          nightBonuses: 0
        };
      }
      
      byEmployee[empId][record.status]++;
      byEmployee[empId].lateMinutes += record.lateMinutes;
      if (record.sanctionApplied) {
        byEmployee[empId].sanctions++;
        byEmployee[empId].sanctionAmount += record.sanctionAmount;
      }
      if (record.nightBonusEarned) {
        byEmployee[empId].nightBonuses++;
      }
    });
    
    res.json({
      period: { start, end },
      summary,
      byEmployee: Object.values(byEmployee)
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Employee)
const getMyAttendance = async (req, res) => {
  try {
    // Find employee associated with user
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }
    
    const { month, year } = req.query;
    const start = moment(`${year || 2024}-${month || 3}-01`).startOf('month');
    const end = moment(start).endOf('month');
    
    const attendance = await Attendance.findAll({
      where: {
        employeeId: employee.id,
        date: {
          [Op.between]: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
        }
      },
      include: ['scheduledShift'],
      order: [['date', 'ASC']]
    });
    
    // Calculate monthly stats
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      lateMinutes: attendance.reduce((sum, a) => sum + a.lateMinutes, 0),
      nightBonuses: attendance.filter(a => a.nightBonusEarned).length,
      sanctions: attendance.filter(a => a.sanctionApplied).length,
      sanctionAmount: attendance.reduce((sum, a) => sum + a.sanctionAmount, 0)
    };
    
    res.json({
      month: start.format('MMMM YYYY'),
      stats,
      records: attendance
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate monthly night bonus for payroll
// @route   GET /api/attendance/night-bonus/:month/:year
// @access  Private (HR, Director)
const calculateNightBonus = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const start = moment(`${year}-${month}-01`).startOf('month');
    const end = moment(start).endOf('month');
    
    const nightShifts = await Attendance.findAll({
      where: {
        nightBonusEarned: true,
        date: {
          [Op.between]: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
        }
      },
      include: [
        { 
          model: Employee, 
          as: 'employee',
          include: ['productionLine', 'position']
        }
      ],
      order: [['employeeId', 'ASC']]
    });
    
    // Group by employee
    const bonusByEmployee = {};
    nightShifts.forEach(record => {
      const empId = record.employee.id;
      if (!bonusByEmployee[empId]) {
        bonusByEmployee[empId] = {
          employee: `${record.employee.firstName} ${record.employee.lastName}`,
          line: record.employee.productionLine?.name,
          position: record.employee.position?.name,
          nightShifts: 0,
          totalBonus: 0
        };
      }
      bonusByEmployee[empId].nightShifts++;
      bonusByEmployee[empId].totalBonus += 500; // 500F per night
    });
    
    res.json({
      month: start.format('MMMM YYYY'),
      totalEmployees: Object.keys(bonusByEmployee).length,
      totalNightShifts: nightShifts.length,
      totalBonusAmount: nightShifts.length * 500,
      details: Object.values(bonusByEmployee)
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  markAbsent,
  getTodayAttendance,
  getAttendanceReport,
  getMyAttendance,
  calculateNightBonus
};