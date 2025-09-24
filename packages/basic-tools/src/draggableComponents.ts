import { updateScopeOfUISchemaElement } from '@formswizard/utils'
import { DraggableElement } from '@formswizard/types'

export const draggableComponents: DraggableElement[] = [
  {
    name: 'Label',
    ToolIconName: 'Label',
    jsonSchemaElement: {},
    uiSchema: {
      type: 'Label',
      //@ts-ignore
      text: 'Some Text',
    },
  },

  {
    name: 'Alert',
    ToolIconName: 'Info',
    jsonSchemaElement: {},
    uiSchema: {
      type: 'Alert',
      //@ts-ignore
      text: 'lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet',
    },
  },
  {
    name: 'Textfeld',
    ToolIconName: 'TextFields',
    jsonSchemaElement: {
      type: 'string',
    },
  },
  {
    name: 'Number',
    ToolIconName: 'Numbers',
    jsonSchemaElement: {
      type: 'integer',
    },
  },

  {
    name: 'Datumsfeld',
    ToolIconName: 'Date',
    jsonSchemaElement: {
      type: 'string',
      format: 'date',
    },
  },
  {
    name: 'Datumszeitfeld',
    ToolIconName: 'DateTime',
    jsonSchemaElement: {
      type: 'string',
      format: 'date-time',
    },
  },
  {
    name: 'Checkbox',
    ToolIconName: 'Checkbox',
    jsonSchemaElement: {
      type: 'boolean',
    },
  },
  {
    name: 'Mehrzeiliges Textfeld',
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
    name: 'Radio Buttons',
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
    name: 'Multiselect',
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
    name: 'List of Objects',
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
    name: 'horizontales layout',
    ToolIconName: 'ArrowHorizontal',
    uiSchema: {
      type: 'HorizontalLayout',
      //@ts-ignore
      elements: [],
    },
  },
  {
    name: 'vertikales layout',
    ToolIconName: 'ArrowVertical',
    uiSchema: {
      type: 'VerticalLayout',
      //@ts-ignore
      label: 'Vertikales Layout',
      elements: [],
    },
  },
  {
    name: 'Gruppe',
    ToolIconName: 'Group',
    jsonSchemaElement: {
      type: 'object',
      properties: {},
    },
    uiSchema: updateScopeOfUISchemaElement('#', '#/properties/gruppe', {
      type: 'Group',
      //@ts-ignore
      label: 'Gruppe',
      elements: [
      ],
    }),
  },
]
