import React from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  type SelectChangeEvent,
} from '@mui/material';
import { ICAO_CODES } from '../../types';

interface IcaoFilterProps {
  selectedIcaoCodes: string[];
  onIcaoCodesChange: (codes: string[]) => void;
  availableIcaoCodes?: string[];
  disabled?: boolean;
}

export const IcaoFilter: React.FC<IcaoFilterProps> = ({
  selectedIcaoCodes,
  onIcaoCodesChange,
  availableIcaoCodes,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onIcaoCodesChange(typeof value === 'string' ? value.split(',') : value);
  };

  const getIcaoName = (code: string) => {
    const icao = ICAO_CODES.find(item => item.code === code);
    return icao ? icao.name : code;
  };

  // Filter ICAO codes to only show available ones if provided
  const icaoOptions = availableIcaoCodes 
    ? ICAO_CODES.filter(icao => availableIcaoCodes.includes(icao.code))
    : ICAO_CODES;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Filter by Airport/FIR
        </Typography>
      </Box>

      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="icao-filter-label">Select ICAO Codes</InputLabel>
        <Select
          labelId="icao-filter-label"
          multiple
          value={selectedIcaoCodes}
          onChange={handleChange}
          input={<OutlinedInput label="Select ICAO Codes" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={value} 
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          {icaoOptions.map((icao) => (
            <MenuItem key={icao.code} value={icao.code}>
              <Box>
                <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
                  {icao.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {icao.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedIcaoCodes.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Filtering by: {selectedIcaoCodes.map(code => `${code} (${getIcaoName(code)})`).join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
