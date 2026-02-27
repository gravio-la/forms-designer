import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  useAppSelector,
  useAppDispatch,
  selectRootJsonSchema,
  selectUiSchema,
  selectUiSchemas,
  loadImportedSchema,
  clearPersistedJsonFormsEditState,
} from '@formswizard/state'
import { useDesignerTranslation } from '@formswizard/i18n'
import { useCallback, useEffect, useState, useRef } from 'react'

interface ImportSchemaModalProps {
  open: boolean
  onClose: () => void
}

export function ImportSchemaModal({ open, onClose }: ImportSchemaModalProps) {
  const { t } = useDesignerTranslation()
  const dispatch = useAppDispatch()
  const rootJsonSchema = useAppSelector(selectRootJsonSchema)
  const uiSchema = useAppSelector(selectUiSchema)
  const uiSchemas = useAppSelector(selectUiSchemas)

  const [editorContent, setEditorContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportFormatString = useCallback(() => {
    const exportData = {
      jsonSchema: rootJsonSchema,
      uiSchema,
      uiSchemas: uiSchemas || {},
    }
    return JSON.stringify(exportData, null, 2)
  }, [rootJsonSchema, uiSchema, uiSchemas])

  useEffect(() => {
    if (open) {
      setEditorContent(exportFormatString())
      setError(null)
    }
  }, [open, exportFormatString])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (!file || !file.name.endsWith('.json')) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setEditorContent(text)
      setError(null)
    }
    reader.readAsText(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setEditorContent(text)
      setError(null)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleLoad = useCallback(() => {
    setError(null)
    let data: { jsonSchema?: unknown; uiSchema?: unknown; uiSchemas?: unknown }
    try {
      data = JSON.parse(editorContent) as typeof data
    } catch {
      setError(t('importModal.parseError'))
      return
    }
    if (data.jsonSchema == null || data.uiSchema == null) {
      setError(t('importModal.missingKeysError'))
      return
    }
    clearPersistedJsonFormsEditState()
    dispatch(
      loadImportedSchema({
        jsonSchema: data.jsonSchema as import('@formswizard/types').JsonSchema,
        uiSchema: data.uiSchema,
        uiSchemas: data.uiSchemas as Record<string, unknown> | undefined,
      })
    )
    onClose()
  }, [editorContent, dispatch, onClose, t])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="span">
          {t('importModal.title')}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('importModal.dropOrUpload')}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            aria-hidden
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('importModal.chooseFile')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative', my: 1 }}>
          <Box
            component="textarea"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            sx={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 320,
              overflow: 'auto',
              p: 2,
              m: 0,
              borderRadius: 1,
              bgcolor: 'grey.900',
              color: 'grey.100',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              border: 1,
              borderColor: 'divider',
              resize: 'vertical',
            }}
            spellCheck={false}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<CloseIcon />}>
          {t('importModal.close')}
        </Button>
        <Button variant="contained" onClick={handleLoad}>
          {t('importModal.load')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
