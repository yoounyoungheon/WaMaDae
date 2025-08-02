'use client';

import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import { useState } from 'react';

export default function ExclusiveSelection() {
  const [view, setView] = useState('list'); 

  return (
    <Box
      sx={{
        display: 'inline-flex',
        p: 0.5,
        m: 0.5,
        borderRadius: 25, 
        backgroundColor: '#EDEDED', 
      }}
    >
      <ToggleButtonGroup
        value={view}
        onChange={()=> setView(view === 'list' ? 'store' : 'list')}
        aria-label="text alignment"
        size="small"
        
        sx={{
          gap: '20px',
          '& .MuiToggleButton-root': {
            width: '120px',
            fontSize: '10px',
            borderRadius: '25px !important', 
            border: 'none',
            '&.Mui-selected': { 
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <ToggleButton value="list">
          전체 와인 리스트
        </ToggleButton>
        <ToggleButton value="store">
          우리 매장 와인
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}