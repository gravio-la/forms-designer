import { updateScopeOfUISchemaElement } from '@formswizard/utils'
import { DraggableElement } from '@formswizard/types'

export const draggableComponents: DraggableElement[] = [
  {
    name: 'label',
    ToolIconName: 'Label',
    jsonSchemaElement: {},
    uiSchema: {
      type: 'Label',
      //@ts-ignore
      text: 'Some Text',
    },
  },

  {
    name: 'alert',
    ToolIconName: 'Info',
    jsonSchemaElement: {},
    uiSchema: {
      type: 'Alert',
      //@ts-ignore
      text: 'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet',
    },
  },
  {
    name: 'textField',
    ToolIconName: 'TextFields',
    jsonSchemaElement: {
      type: 'string',
    },
  },
  {
    name: 'number',
    ToolIconName: 'Numbers',
    jsonSchemaElement: {
      type: 'integer',
    },
  },

  {
    name: 'dateField',
    ToolIconName: 'Date',
    jsonSchemaElement: {
      type: 'string',
      format: 'date',
    },
  },
  {
    name: 'dateTimeField',
    ToolIconName: 'DateTime',
    jsonSchemaElement: {
      type: 'string',
      format: 'date-time',
    },
  },
  {
    name: 'checkbox',
    ToolIconName: 'Checkbox',
    jsonSchemaElement: {
      type: 'boolean',
    },
  },
  {
    name: 'multilineTextField',
    ToolIconName: 'MultiLine',
    jsonSchemaElement: {
      type: 'string',
    },
    uiSchema: {
      type: 'Control',
      options: {
        multi: true,
      },
    },
  },
  {
    name: 'radioButtons',
    ToolIconName: 'RadioButton',
    jsonSchemaElement: {
      type: 'string',
      enum: ['One', 'Two', 'Three'],
    },
    uiSchema: {
      type: 'Control',
      options: {
        format: 'radio',
      },
    },
  },
  {
    name: 'multiselect',
    ToolIconName: 'SelectableList',
    jsonSchemaElement: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['foo', 'bar', 'foobar'],
      },
    },
    uiSchema: {
      type: 'Control',
      options: {
        format: 'combo',
      },
    },
  },
  {
    name: 'listOfObjects',
    ToolIconName: 'List',
    jsonSchemaElement: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
    uiSchema: {
      type: 'Control',
      options: {
        showSortButtons: true,
      },
    },
  },
  {
    name: 'horizontalLayout',
    category: 'layout',
    ToolIconName: 'ArrowHorizontal',
    uiSchema: {
      type: 'HorizontalLayout',
      //@ts-ignore
      elements: [],
    },
  },
  {
    name: 'verticalLayout',
    category: 'layout',
    ToolIconName: 'ArrowVertical',
    uiSchema: {
      type: 'VerticalLayout',
      //@ts-ignore
      label: 'Vertical Layout',
      elements: [],
    },
  },
  {
    name: 'group',
    category: 'layout',
    ToolIconName: 'Group',
    jsonSchemaElement: {
      type: 'object',
      properties: {},
    },
    uiSchema: updateScopeOfUISchemaElement('#', '#/properties/group', {
      type: 'Group',
      //@ts-ignore
      label: 'Group',
      elements: [
      ],
    }),
  },
  {
    name: 'categorization',
    category: 'layout',
    ToolIconName: 'Categorization',
    uiSchema: {
      type: 'Categorization',
      //@ts-ignore
      elements: [
        { type: 'Category', label: 'Tab 1', elements: [] },
        { type: 'Category', label: 'Tab 2', elements: [] },
      ],
    },
  },
]
