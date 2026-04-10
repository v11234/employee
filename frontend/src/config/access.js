export const ROLE_HOME_ROUTE = {
  director: '/dashboard',
  hr: '/dashboard',
  production_manager: '/dashboard',
  shift_supervisor: '/attendance',
  department_head: '/training',
  worker: '/attendance'
};

export const ROUTE_ACCESS = {
  '/dashboard': ['director', 'hr', 'production_manager', 'shift_supervisor', 'department_head'],
  '/employees': ['director', 'hr', 'production_manager'],
  '/attendance': ['director', 'hr', 'production_manager', 'shift_supervisor', 'worker'],
  '/shifts': ['director', 'hr', 'production_manager', 'worker'],
  '/leave': ['director', 'hr', 'production_manager', 'shift_supervisor', 'department_head', 'worker'],
  '/recruitment': ['director', 'hr', 'production_manager'],
  '/training': ['director', 'hr', 'production_manager', 'department_head', 'worker'],
  '/payroll': ['director', 'hr'],
  '/performance': ['director', 'hr', 'production_manager', 'department_head']
};

export const MENU_ITEMS = [
  { text: 'Dashboard', path: '/dashboard', roles: ROUTE_ACCESS['/dashboard'] },
  { text: 'Employees', path: '/employees', roles: ROUTE_ACCESS['/employees'] },
  { text: 'Attendance', path: '/attendance', roles: ROUTE_ACCESS['/attendance'] },
  { text: 'Timetables', path: '/shifts', roles: ROUTE_ACCESS['/shifts'] },
  { text: 'Leave & Permissions', path: '/leave', roles: ROUTE_ACCESS['/leave'] },
  { text: 'Admissions', path: '/recruitment', roles: ROUTE_ACCESS['/recruitment'] },
  { text: 'Courses & Training', path: '/training', roles: ROUTE_ACCESS['/training'] },
  { text: 'Finance', path: '/payroll', roles: ROUTE_ACCESS['/payroll'] },
  { text: 'Academic Performance', path: '/performance', roles: ROUTE_ACCESS['/performance'] }
];

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

export const hasRouteAccess = (role, path) => {
  const allowedRoles = ROUTE_ACCESS[path];

  if (!allowedRoles) {
    return true;
  }

  return Boolean(role && allowedRoles.includes(role));
};

export const getDefaultRouteForRole = (role) =>
  ROLE_HOME_ROUTE[role] || '/dashboard';
