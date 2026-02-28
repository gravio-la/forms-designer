import { verticalLayoutTester, VerticalLayoutWithDropZoneRenderer } from './VerticalLayoutWithDropZoneRenderer'
import { horizontalLayoutTester, HorizontalLayoutWithDropZoneRenderer } from './HorizontalLayoutWithDropZoneRenderer'
import { materialEditableGroupTester, MaterialEditableGroupLayoutRenderer } from './MaterialEditableGroupLayout'
import { categorizationEditableTester, MaterialEditableCategorizationLayoutRenderer } from './MaterialEditableCategorizationLayout'
import {
  categorizationPreviewTester,
  MaterialPreviewCategorizationLayoutRenderer,
} from './MaterialEditableCategorizationLayout'

export * from './HorizontalLayoutWithDropZoneRenderer'
export * from './VerticalLayoutWithDropZoneRenderer'
export * from './MaterialEditableCategorizationLayout'

export const previewRenderer = [
  {
    tester: categorizationPreviewTester,
    renderer: MaterialPreviewCategorizationLayoutRenderer,
  },
]

export const dropRenderer = [
  {
    tester: verticalLayoutTester,
    renderer: VerticalLayoutWithDropZoneRenderer,
  },
  {
    tester: horizontalLayoutTester,
    renderer: HorizontalLayoutWithDropZoneRenderer,
  },
  {
    tester: materialEditableGroupTester,
    renderer: MaterialEditableGroupLayoutRenderer,
  },
  {
    tester: categorizationEditableTester,
    renderer: MaterialEditableCategorizationLayoutRenderer,
  },
]
