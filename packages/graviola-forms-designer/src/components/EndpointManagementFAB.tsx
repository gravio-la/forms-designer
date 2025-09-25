import React, { useState } from 'react'
import {
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { SparqlEndpoint } from '@graviola/edb-core-types'
import { useEndpoint } from '../context'
import { EndpointSelectionDialog } from './EndpointSelectionDialog'

interface EndpointManagementFABProps {
  loading?: boolean
}

export function EndpointManagementFAB({ loading = false }: EndpointManagementFABProps) {
  const { currentEndpoint, savedEndpoints, setCurrentEndpoint } = useEndpoint()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelectEndpoint = (endpoint: SparqlEndpoint) => {
    setCurrentEndpoint(endpoint)
    handleClose()
  }

  const handleManageEndpoints = () => {
    setDialogOpen(true)
    handleClose()
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  // Position FAB on the right side, below the TrashFAB
  return (
    <>
      <Tooltip 
        title={currentEndpoint ? `Connected to ${currentEndpoint.label || 'Endpoint'}` : 'Configure SPARQL Endpoint'}
        placement="left"
      >
        <Fab
          color={currentEndpoint ? 'primary' : 'default'}
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 100, // Position above TrashFAB (which is typically at bottom: 16)
            right: 16,
            zIndex: 1000,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : currentEndpoint ? (
            <CheckCircleIcon />
          ) : (
            <StorageIcon />
          )}
        </Fab>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxWidth: 400,
          }
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {currentEndpoint && (
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Current Endpoint
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="subtitle2" noWrap>
                {currentEndpoint.label || 'Unnamed'}
              </Typography>
              <Chip 
                label={currentEndpoint.provider || 'unknown'} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" color="text.secondary" noWrap>
              {currentEndpoint.endpoint}
            </Typography>
          </Box>
        )}

        {savedEndpoints
          .filter(ep => ep.endpoint !== currentEndpoint?.endpoint)
          .slice(0, 5) // Show max 5 quick-switch options
          .map((endpoint, index) => (
            <MenuItem 
              key={`${endpoint.endpoint}-${index}`}
              onClick={() => handleSelectEndpoint(endpoint)}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={endpoint.label || 'Unnamed Endpoint'}
                secondary={
                  <Typography variant="caption" noWrap>
                    {endpoint.endpoint}
                  </Typography>
                }
              />
            </MenuItem>
          ))}

        <MenuItem onClick={handleManageEndpoints}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Manage Endpoints" />
        </MenuItem>
      </Menu>

      <EndpointSelectionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </>
  )
}
