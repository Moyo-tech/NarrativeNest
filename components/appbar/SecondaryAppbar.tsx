'use client'

import { AppBar, Toolbar } from '@mui/material';
import React from 'react';

export const SecondaryAppBar = ({ children }: { children: React.ReactNode }) => (
  <AppBar position="static" color="transparent">
    <Toolbar>
      {children}
    </Toolbar>
  </AppBar>
);