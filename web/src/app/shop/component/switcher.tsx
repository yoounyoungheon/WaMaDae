'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

interface SwitcherValue {
  name: string;
  value: string;
}

interface RoutingSwitcherProps {
  values: SwitcherValue[];
}

export default function RoutingSwitcher({ values }: RoutingSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // TODO: 쿼리 파라미터 네이밍 변경
  const initialValue = searchParams.get('type') || values[0].value; 
  
  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('type', newValue);
      router.push(`?${newSearchParams.toString()}`);
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
        value={initialValue}
        exclusive
        onChange={handleToggleChange}
        aria-label="shop switcher"
        size="small"
        sx={{
          gap: '10px',
          '& .MuiToggleButton-root': {
            width: '100px',
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