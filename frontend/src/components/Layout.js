import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccessTime,
  Schedule,
  BeachAccess,
  HowToReg,
  School,
  Notifications,
  ChevronLeft,
  Logout,
  Person
} from '@mui/icons-material';
import {
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import iulLogo from '../assets/iul-logo.svg';
import { MENU_ITEMS, getStoredUser } from '../config/access';

const drawerWidth = 260;

const menuIcons = {
  '/dashboard': <Dashboard />,
  '/employees': <People />,
  '/attendance': <AccessTime />,
  '/shifts': <Schedule />,
  '/leave': <BeachAccess />,
  '/recruitment': <HowToReg />,
  '/training': <School />,
  '/payroll': <AttachMoney />,
  '/performance': <TrendingUp />
};


export default function Layout() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsEl, setNotificationsEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenu = (event) => {
    setNotificationsEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('preAuthToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = getStoredUser();
  const menuItems = MENU_ITEMS
    .filter((item) => item.roles.includes(user.role))
    .map((item) => ({
      ...item,
      icon: menuIcons[item.path]
    }));

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src={iulLogo}
            alt="CodingHQ Logo"
            sx={{
              width: { xs: 120, sm: 140, md: 170 },
              height: { xs: 32, sm: 36, md: 40 },
              objectFit: 'contain',
              mr: { xs: 1, sm: 1.5 },
              bgcolor: 'white',
              borderRadius: 1,
              px: 0.5,
              py: 0.25
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontSize: { sm: '1rem', md: '1.25rem' } }}
          >
            CodingHQ Enterprise System
          </Typography>
          
          {/* Notifications */}
          <IconButton color="inherit" onClick={handleNotificationsMenu}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsEl}
            open={Boolean(notificationsEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>3 pending leave requests</MenuItem>
            <MenuItem onClick={handleClose}>2 new admission applications</MenuItem>
            <MenuItem onClick={handleClose}>Faculty training session tomorrow</MenuItem>
          </Menu>

          {/* User menu */}
          <IconButton onClick={handleProfileMenu} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {user.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              mt: { xs: 8, sm: 9 }
            }
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItemButton key={item.text} onClick={() => handleNavigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : theme.spacing(9),
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : theme.spacing(9),
              transition: theme.transitions.create('width'),
              overflowX: 'hidden',
              mt: 9
            }
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          mt: { xs: 8, sm: 9 },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          overflowX: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
