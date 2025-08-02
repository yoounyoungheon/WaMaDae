'use client';

import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import { useState } from 'react';

interface SwitcherValue {
  name: string;
  value: string;
}

interface ShopSwitcherProps {
  values: SwitcherValue[];
  onChange?: () => void;
}

export default function ShopSwitcher({ values, onChange }: ShopSwitcherProps) {
  const [value, setValue] = useState(values[0].value); 

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      setValue(newValue);
      onChange?.();
    }
  };

  const toggleButtons = values.map((item) => (
    <ToggleButton key={item.value} value={item.value}>
      {item.name}
    </ToggleButton>
  ));

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
        value={value}
        exclusive
        onChange={handleToggleChange}
        aria-label="shop switcher"
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
              '&:hover': {
                backgroundColor: 'white',
              },
            },
            '&.Mui-focusVisible': {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
            
          },
        }}
      >
        {toggleButtons}
      </ToggleButtonGroup>
    </Box>
  );
}