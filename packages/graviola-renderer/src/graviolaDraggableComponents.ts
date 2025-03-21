import { DraggableComponent } from "@formswizard/types";
import { updateScopeOfUISchemaElement } from "@formswizard/utils";

export const graviolaDraggableComponents: DraggableComponent[] = [
  {
    name: 'one-to-many',
    ToolIconName: 'DeviceHub',
    jsonSchemaElement: {
    '$ref': '#/definitions/NewDefinition',
  },
  uiSchema: updateScopeOfUISchemaElement('#', '#/properties/oneToMany', {
    type: 'Control',
    //@ts-ignore
    scope: '#/properties/oneToMany',
    options: {
      inline: true,
      context: {
        '$ref': '#/definitions/NewDefinition',
        typeIRI: 'http://schema.org/Person',
      }
    },
    }),
  },
]
