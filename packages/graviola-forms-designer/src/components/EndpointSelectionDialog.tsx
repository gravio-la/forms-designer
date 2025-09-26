import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  IconButton
} from '@mui/material'
import {
  Storage as StorageIcon,
  Add as AddIcon,
  CloudQueue as CloudIcon,
  Computer as ComputerIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { SparqlEndpoint } from '@graviola/edb-core-types'
import { useEndpoint } from '../context'
import { EndpointEditForm } from './EndpointEditForm'

interface EndpointSelectionDialogProps {
  open: boolean
  onClose?: () => void
}

const getProviderIcon = (provider?: string) => {
  switch (provider) {
    case 'oxigraph':
    case 'blazegraph':
    case 'virtuoso':
    case 'qlever':
      return <ComputerIcon />
    case 'rest':
      return <CloudIcon />
    default:
      return <StorageIcon />
  }
}

const getProviderColor = (provider?: string) => {
  switch (provider) {
    case 'oxigraph':
      return 'primary'
    case 'blazegraph':
      return 'secondary' 
    case 'virtuoso':
      return 'success'
    case 'rest':
      return 'info'
    default:
      return 'default'
  }
}

export function EndpointSelectionDialog({ open, onClose }: EndpointSelectionDialogProps) {
  const { savedEndpoints, setCurrentEndpoint, saveEndpoint } = useEndpoint()
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<SparqlEndpoint | null>(null)
  const [customEndpoint, setCustomEndpoint] = useState<Partial<SparqlEndpoint>>({
    active: true,
    provider: 'oxigraph'
  })

  const handleSelectEndpoint = (endpoint: SparqlEndpoint) => {
    setCurrentEndpoint(endpoint)
    onClose?.()
  }

  const handleCreateCustom = () => {
    setShowCustomForm(true)
  }

  const handleSaveCustomEndpoint = (endpoint: SparqlEndpoint) => {
    saveEndpoint(endpoint)
    setCurrentEndpoint(endpoint)
    onClose?.()
  }

  const handleCancelCustom = () => {
    setShowCustomForm(false)
    setCustomEndpoint({
      active: true,
      provider: 'oxigraph'
    })
  }

  const handleEditEndpoint = (endpoint: SparqlEndpoint, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingEndpoint(endpoint)
    setShowEditForm(true)
  }

  const handleSaveEditedEndpoint = (endpoint: SparqlEndpoint) => {
    saveEndpoint(endpoint)
    setCurrentEndpoint(endpoint)
    setShowEditForm(false)
    setEditingEndpoint(null)
    onClose?.()
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditingEndpoint(null)
  }

  if (showCustomForm) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            <Typography variant="h6" component="span">
              Configure Custom Endpoint
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure your custom SPARQL endpoint. All fields except URL are optional.
          </Alert>
          
          <EndpointEditForm
            data={customEndpoint}
            onChange={setCustomEndpoint}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancelCustom} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => handleSaveCustomEndpoint(customEndpoint as SparqlEndpoint)}
            variant="contained"
            disabled={!customEndpoint.endpoint}
          >
            Save & Use Endpoint
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (showEditForm && editingEndpoint) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            <Typography variant="h6" component="span">
              Edit Endpoint
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Edit the SPARQL endpoint configuration. All fields except URL are optional.
          </Alert>
          
          <EndpointEditForm
            data={editingEndpoint}
            onChange={setEditingEndpoint}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancelEdit} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => handleSaveEditedEndpoint(editingEndpoint)}
            variant="contained"
            disabled={!editingEndpoint.endpoint}
          >
            Save & Use Endpoint
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '50vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          <Typography variant="h6" component="span">
            Select SPARQL Endpoint
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Alert severity="info" sx={{ m: 2, mb: 3 }}>
          Choose a SPARQL endpoint to connect to your knowledge base.
        </Alert>
        
        <List sx={{ pt: 0 }}>
          {savedEndpoints.map((endpoint, index) => (
            <ListItem key={`${endpoint.endpoint}-${index}`} disablePadding>
              <ListItemButton onClick={() => handleSelectEndpoint(endpoint)}>
                <ListItemIcon>
                  {getProviderIcon(endpoint.provider)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {endpoint.label || 'Unnamed Endpoint'}
                      </Typography>
                      <Chip 
                        label={endpoint.provider || 'unknown'} 
                        size="small" 
                        color={getProviderColor(endpoint.provider) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {endpoint.endpoint}
                    </Typography>
                  }
                />
                <IconButton
                  onClick={(e) => handleEditEndpoint(endpoint, e)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem disablePadding>
            <ListItemButton onClick={handleCreateCustom}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText
                primary="Configure Custom Endpoint"
                secondary="Set up your own SPARQL endpoint"
              />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
