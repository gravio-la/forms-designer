import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Step,
  StepButton,
  Stepper,
  Button,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type {
  Categorization,
  Category,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  LayoutProps,
  RankedTester,
  UISchemaElement,
} from '@jsonforms/core'
import {
  and,
  categorizationHasCategory,
  rankWith,
  uiTypeIs,
  isLayout,
} from '@jsonforms/core'
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react'
import { useAppDispatch, useAppSelector, selectSelectedPath, selectPath } from '@formswizard/state'
import { LayoutWithDropZoneRenderer, type MaterialLayoutRendererProps } from './LayoutWithDropZoneRenderer'

export const categorizationPreviewTester: RankedTester = rankWith(
  10,
  and(uiTypeIs('Categorization'), categorizationHasCategory)
)

export const categorizationEditableTester: RankedTester = rankWith(
  11,
  and(uiTypeIs('Categorization'), categorizationHasCategory)
)

function categoryHasControls(elements: UISchemaElement[]): boolean {
  return elements.some(
    (el) =>
      el.type === 'Control' ||
      (isLayout(el) && categoryHasControls((el as any).elements ?? []))
  )
}

export type CategoryContentRendererProps = {
  category: Category
  schema: JsonSchema
  path: string
  visible: boolean
  uischema: UISchemaElement
  renderers?: JsonFormsRendererRegistryEntry[]
  cells?: JsonFormsCellRendererRegistryEntry[]
  enabled?: boolean
}

export type CategorizationShellProps = LayoutProps & {
  renderContent: (props: CategoryContentRendererProps) => React.ReactNode
}

export const CategorizationShell = ({
  uischema,
  schema,
  path,
  visible,
  renderers,
  cells,
  enabled,
  renderContent,
}: CategorizationShellProps) => {
  const [activeCategory, setActiveCategory] = useState(0)
  const dispatch = useAppDispatch()
  const selectedPath = useAppSelector(selectSelectedPath)
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))

  const categorization = uischema as Categorization
  const variant: string = (uischema as any).options?.variant ?? 'stepper'
  const showNavButtons: boolean = (uischema as any).options?.showNavButtons === true

  const categories = useMemo(
    () => categorization.elements as Category[],
    [categorization.elements]
  )

  const safeActive = Math.min(activeCategory, Math.max(categories.length - 1, 0))

  const handleSelect = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      dispatch(selectPath((uischema as any).path))
    },
    [dispatch, uischema]
  )

  if (!visible) return null

  const activeEl = categories[safeActive]
  const isSelected = selectedPath === (uischema as any).path

  const renderStepper = () => (
    <Stepper
      activeStep={safeActive}
      nonLinear
      orientation={isNarrow ? 'vertical' : 'horizontal'}
    >
      {categories.map((cat, idx) => (
        <Step key={idx}>
          <StepButton onClick={() => setActiveCategory(idx)}>
            {cat.label ?? `Tab ${idx + 1}`}
          </StepButton>
        </Step>
      ))}
    </Stepper>
  )

  const renderTabs = () => (
    <Tabs
      value={safeActive}
      onChange={(_e, newVal) => setActiveCategory(newVal)}
      variant="scrollable"
      scrollButtons="auto"
    >
      {categories.map((cat, idx) => (
        <Tab key={idx} label={cat.label ?? `Tab ${idx + 1}`} />
      ))}
    </Tabs>
  )

  return (
    <Box
      onClick={handleSelect}
      sx={{
        cursor: 'pointer',
        marginBottom: '10px',
        transition: (t) =>
          t.transitions.create(['background-color', 'box-shadow'], {
            duration: t.transitions.duration.short,
          }),
        backgroundColor: (t) =>
          isSelected ? t.palette.action.selected : 'inherit',
        '&:hover': {
          backgroundColor: (t) => t.palette.action.hover,
        },
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 1,
        p: 1,
      }}
    >
      {variant === 'tabs' ? renderTabs() : renderStepper()}
      <Box sx={{ mt: 1, minHeight: 80 }}>
        {activeEl &&
          renderContent({
            category: activeEl,
            schema,
            path,
            visible,
            uischema: activeEl as UISchemaElement,
            renderers,
            cells,
            enabled,
          })}
      </Box>
      {showNavButtons && (
        <Box sx={{ textAlign: 'right', width: '100%', mt: 1 }}>
          <Button
            color="secondary"
            variant="contained"
            disabled={safeActive <= 0}
            onClick={() => setActiveCategory(safeActive - 1)}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={safeActive >= categories.length - 1}
            onClick={() => setActiveCategory(safeActive + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  )
}

const DropZoneCategoryContent = ({
  category,
  schema,
  path,
  visible,
  uischema,
  renderers,
  cells,
}: CategoryContentRendererProps) => {
  const childProps: MaterialLayoutRendererProps = {
    elements: category.elements,
    schema,
    path,
    direction: 'column',
    visible,
    uischema,
  }
  return <LayoutWithDropZoneRenderer {...childProps} renderers={renderers} cells={cells} />
}

const PreviewCategoryContent = ({
  category,
  schema,
  path,
  renderers,
  cells,
  enabled,
}: CategoryContentRendererProps) => (
  <>
    {category.elements.map((child, idx) => (
      <JsonFormsDispatch
        key={idx}
        uischema={child}
        schema={schema}
        path={path}
        enabled={enabled}
        renderers={renderers}
        cells={cells}
      />
    ))}
  </>
)

const EditableCategorizationLayoutRenderer = (props: LayoutProps) => (
  <CategorizationShell {...props} renderContent={DropZoneCategoryContent} />
)

const PreviewCategorizationLayoutRenderer = (props: LayoutProps) => (
  <CategorizationShell {...props} renderContent={PreviewCategoryContent} />
)

export const MaterialEditableCategorizationLayoutRenderer =
  withJsonFormsLayoutProps(EditableCategorizationLayoutRenderer)

export const MaterialPreviewCategorizationLayoutRenderer =
  withJsonFormsLayoutProps(PreviewCategorizationLayoutRenderer)

export { categoryHasControls }
