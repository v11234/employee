const dotenv = require('dotenv');
const {
  sequelize,
  User,
  Department,
  Position,
  ProductionLine,
  Shift,
  Employee,
  LeaveType,
  Recruitment,
  Applicant,
  Training,
  TrainingSession,
  TrainingEnrollment,
  WorkSchedule,
  Attendance,
  ShiftRotation
} = require('./src/models');

dotenv.config();

const findOrCreateRecord = async (Model, where, defaults = {}) => {
  const [record, created] = await Model.findOrCreate({
    where,
    defaults: { ...where, ...defaults }
  });
  return { record, created };
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to Neon database...');
    await sequelize.authenticate();
    console.log('Database connection successful.');

    await sequelize.sync();
    console.log('Schema is ready.');

    const productionLinesData = [
      { name: 'Biscuit Line 1', productType: 'biscuit' },
      { name: 'Milk Line', productType: 'milk' },
      { name: 'Candy Line', productType: 'candy' }
    ];

    const shiftsData = [
      { name: 'morning', startTime: '07:00', endTime: '15:00', nightBonusAmount: 0 },
      { name: 'afternoon', startTime: '15:00', endTime: '23:00', nightBonusAmount: 0 },
      { name: 'night', startTime: '23:00', endTime: '07:00', nightBonusAmount: 500 },
      { name: 'saturday_cleaning', startTime: '07:00', endTime: '15:00', nightBonusAmount: 0 }
    ];

    const departmentsData = [
      { name: 'Human Resources', description: 'Handles staffing, payroll, and employee relations.' },
      { name: 'Production', description: 'Runs daily production operations and line assignments.' },
      { name: 'Quality Control', description: 'Monitors product quality and compliance.' }
    ];

    const leaveTypesData = [
      { name: 'Annual Leave', daysPerYear: 30, isPaid: true, requiresMedicalBooklet: false },
      { name: 'Sick Leave', daysPerYear: 15, isPaid: true, requiresMedicalBooklet: true },
      { name: 'Unpaid Leave', daysPerYear: 10, isPaid: false, requiresMedicalBooklet: false }
    ];

    for (const line of productionLinesData) {
      await findOrCreateRecord(ProductionLine, { name: line.name }, line);
    }

    for (const shift of shiftsData) {
      await findOrCreateRecord(Shift, { name: shift.name }, shift);
    }

    const departments = {};
    for (const dept of departmentsData) {
      const { record } = await findOrCreateRecord(Department, { name: dept.name }, dept);
      departments[dept.name] = record;
    }

    const positionsConfig = [
      {
        name: 'HR Manager',
        departmentName: 'Human Resources',
        baseSalary: 65000,
        description: 'Leads HR policies, hiring, and employee development.'
      },
      {
        name: 'Line Supervisor',
        departmentName: 'Production',
        baseSalary: 42000,
        description: 'Supervises production line execution and staff.'
      },
      {
        name: 'Quality Inspector',
        departmentName: 'Quality Control',
        baseSalary: 38000,
        description: 'Performs quality checks and ensures standards.'
      },
      {
        name: 'Production Worker',
        departmentName: 'Production',
        baseSalary: 25000,
        description: 'Operates on assigned production lines.'
      }
    ];

    const positions = {};
    for (const positionData of positionsConfig) {
      const department = departments[positionData.departmentName];
      const { record } = await findOrCreateRecord(
        Position,
        { name: positionData.name, departmentId: department.id },
        {
          departmentId: department.id,
          baseSalary: positionData.baseSalary,
          description: positionData.description
        }
      );
      positions[positionData.name] = record;
    }

    const usersData = [
      {
        email: 'admin@iul.edu',
        password: 'admin123',
        role: 'director',
        firstName: 'Super',
        lastName: 'Admin'
      },
      {
        email: 'hr@iul.edu',
        password: 'hr123456',
        role: 'hr',
        firstName: 'Amine',
        lastName: 'Rahmani'
      },
      {
        email: 'supervisor@iul.edu',
        password: 'super123',
        role: 'shift_supervisor',
        firstName: 'Yasmine',
        lastName: 'Bennani'
      },
      {
        email: 'worker1@iul.edu',
        password: 'worker123',
        role: 'worker',
        firstName: 'Karim',
        lastName: 'El Idrissi'
      }
    ];

    const users = {};
    for (const userData of usersData) {
      const { record } = await findOrCreateRecord(User, { email: userData.email }, userData);
      users[userData.email] = record;
    }

    const productionLines = await ProductionLine.findAll();
    const shifts = await Shift.findAll();

    const lineMap = Object.fromEntries(productionLines.map((line) => [line.name, line]));
    const shiftMap = Object.fromEntries(shifts.map((shift) => [shift.name, shift]));

    const employeesData = [
      {
        employeeCode: 'EMP001',
        firstName: 'Amine',
        lastName: 'Rahmani',
        birthDate: '1990-05-12',
        hireDate: '2023-01-10',
        employmentStatus: 'permanent',
        departmentId: departments['Human Resources'].id,
        positionId: positions['HR Manager'].id,
        productionLineId: lineMap['Biscuit Line 1'].id,
        emergencyContactName: 'Sara Rahmani',
        emergencyContactPhone: '+212600000001',
        userId: users['hr@iul.edu'].id
      },
      {
        employeeCode: 'EMP002',
        firstName: 'Yasmine',
        lastName: 'Bennani',
        birthDate: '1989-09-08',
        hireDate: '2022-07-15',
        employmentStatus: 'permanent',
        departmentId: departments['Production'].id,
        positionId: positions['Line Supervisor'].id,
        productionLineId: lineMap['Milk Line'].id,
        emergencyContactName: 'Kamal Bennani',
        emergencyContactPhone: '+212600000002',
        userId: users['supervisor@iul.edu'].id
      },
      {
        employeeCode: 'EMP003',
        firstName: 'Karim',
        lastName: 'El Idrissi',
        birthDate: '1997-03-21',
        hireDate: '2024-02-01',
        employmentStatus: 'temporary',
        departmentId: departments['Production'].id,
        positionId: positions['Production Worker'].id,
        productionLineId: lineMap['Candy Line'].id,
        emergencyContactName: 'Fatima El Idrissi',
        emergencyContactPhone: '+212600000003',
        userId: users['worker1@iul.edu'].id
      }
    ];

    const employees = {};
    for (const employeeData of employeesData) {
      const { record } = await findOrCreateRecord(
        Employee,
        { employeeCode: employeeData.employeeCode },
        employeeData
      );
      employees[employeeData.employeeCode] = record;
    }

    const productionHead = employees['EMP002'];
    const productionDepartment = departments['Production'];
    if (productionDepartment.headEmployeeId !== productionHead.id) {
      await productionDepartment.update({ headEmployeeId: productionHead.id });
    }

    for (const leaveType of leaveTypesData) {
      await findOrCreateRecord(LeaveType, { name: leaveType.name }, leaveType);
    }

    const { record: recruitment } = await findOrCreateRecord(
      Recruitment,
      { title: 'Production Worker Recruitment - Q2' },
      {
        positionId: positions['Production Worker'].id,
        description: 'Hiring additional production workers for increased demand.',
        requirements: 'Basic manufacturing experience preferred.',
        quantity: 6,
        employmentType: 'temporary',
        status: 'open',
        postedDate: '2026-04-01',
        closingDate: '2026-05-15',
        createdBy: users['hr@iul.edu'].id
      }
    );

    const { record: applicant } = await findOrCreateRecord(
      Applicant,
      { email: 'candidate1@example.com', recruitmentId: recruitment.id },
      {
        recruitmentId: recruitment.id,
        firstName: 'Hassan',
        lastName: 'Alaoui',
        phone: '+212611111111',
        address: 'Casablanca',
        applicationDate: '2026-04-02',
        status: 'shortlisted'
      }
    );

    const { record: training } = await findOrCreateRecord(
      Training,
      { name: 'Food Safety Fundamentals' },
      {
        description: 'Core food safety and hygiene practices for all production staff.',
        departmentId: departments['Production'].id,
        durationDays: 3,
        createdBy: users['hr@iul.edu'].id,
        isMandatory: true
      }
    );

    const { record: trainingSession } = await findOrCreateRecord(
      TrainingSession,
      { trainingId: training.id, startDate: '2026-04-08' },
      {
        trainingId: training.id,
        endDate: '2026-04-10',
        trainerEmployeeId: productionHead.id,
        location: 'Training Room A',
        maxParticipants: 20,
        status: 'planned'
      }
    );

    await findOrCreateRecord(
      TrainingEnrollment,
      { sessionId: trainingSession.id, employeeId: employees['EMP003'].id },
      {
        sessionId: trainingSession.id,
        employeeId: employees['EMP003'].id,
        status: 'enrolled'
      }
    );

    await findOrCreateRecord(
      TrainingEnrollment,
      { sessionId: trainingSession.id, applicantId: applicant.id },
      {
        sessionId: trainingSession.id,
        applicantId: applicant.id,
        status: 'enrolled'
      }
    );

    await findOrCreateRecord(
      WorkSchedule,
      { employeeId: employees['EMP003'].id, date: '2026-04-06' },
      {
        employeeId: employees['EMP003'].id,
        date: '2026-04-06',
        shiftId: shiftMap.morning.id,
        productionLineId: lineMap['Candy Line'].id,
        isOvertime: false,
        createdBy: users['supervisor@iul.edu'].id
      }
    );

    await findOrCreateRecord(
      Attendance,
      { employeeId: employees['EMP003'].id, date: '2026-04-05' },
      {
        employeeId: employees['EMP003'].id,
        date: '2026-04-05',
        scheduledShiftId: shiftMap.morning.id,
        checkInTime: '2026-04-05T07:05:00.000Z',
        checkOutTime: '2026-04-05T15:02:00.000Z',
        status: 'late',
        lateMinutes: 5,
        recordedBy: users['supervisor@iul.edu'].id
      }
    );

    await findOrCreateRecord(
      ShiftRotation,
      { employeeId: employees['EMP003'].id, weekStartDate: '2026-04-06' },
      {
        employeeId: employees['EMP003'].id,
        weekStartDate: '2026-04-06',
        shiftId: shiftMap.afternoon.id,
        isDryBiscuitWeek: false
      }
    );

    const summary = await Promise.all([
      User.count(),
      Employee.count(),
      Department.count(),
      Position.count(),
      ProductionLine.count(),
      Shift.count(),
      LeaveType.count(),
      Recruitment.count(),
      Applicant.count(),
      Training.count(),
      TrainingSession.count(),
      TrainingEnrollment.count()
    ]);

    console.log('Seed completed successfully.');
    console.log({
      users: summary[0],
      employees: summary[1],
      departments: summary[2],
      positions: summary[3],
      productionLines: summary[4],
      shifts: summary[5],
      leaveTypes: summary[6],
      recruitments: summary[7],
      applicants: summary[8],
      trainings: summary[9],
      trainingSessions: summary[10],
      trainingEnrollments: summary[11]
    });
  } catch (error) {
    console.error('Seed failed:', error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
