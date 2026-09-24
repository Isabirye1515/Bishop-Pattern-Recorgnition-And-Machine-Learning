import React from "react";

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Collapse
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AccountCircle,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";

import { Chapters, type Chapter } from "../utils";

const drawerWidth = 320;

interface ChapterItemProps {
  chapter: Chapter;
  level?: number;
  onNavigate: () => void;
}

const ChapterItem = ({
  chapter,
  level = 0,
  onNavigate,
}: ChapterItemProps) => {
  const [open, setOpen] = React.useState(false);

  const hasChildren =
    Boolean(chapter.children && chapter.children.length > 0);

  const handleClick = () => {
    if (hasChildren) {
      setOpen((previous) => !previous);
    }
  };

  return (
    <>
      <ListItemButton
        component={hasChildren ? "div" : RouterLink}
        onClick={hasChildren ? handleClick : onNavigate}
        {...(!hasChildren && {
          to: chapter.link,
        })}
        sx={{
          pl: 2 + level * 2,
        }}
      >
        <ListItemText
          primary={`${chapter.number}. ${chapter.name}`}
          secondary={chapter.description}
        />

        {hasChildren &&
          (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {chapter.children?.map((child) => (
              <ChapterItem
                key={child.link}
                chapter={child}
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const HeaderPage = () => {
  const [auth] = React.useState(true);

  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const [drawerOpen, setDrawerOpen] =
    React.useState(false);

  const handleMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      {/* Top navigation */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open navigation"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Bishop Pattern Recognition And Machine Learning
          </Typography>

          {/* Account menu */}
          {auth && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  Profile
                </MenuItem>

                <MenuItem onClick={handleClose}>
                  My account
                </MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* Side navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: drawerWidth }}
          component="nav"
          aria-label="chapter navigation"
        >
          <Toolbar>
            <Typography variant="h6">
              PRML Chapters
            </Typography>
          </Toolbar>

          <List>
            {Chapters.map((chapter) => (
              <ChapterItem
                key={chapter.link}
                chapter={chapter}
                onNavigate={() => setDrawerOpen(false)}
              />
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default HeaderPage;
