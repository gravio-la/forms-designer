import { DraggableComponent } from "@formswizard/types";
import { updateScopeOfUISchemaElement } from "@formswizard/utils";

export const graviolaDraggableComponents: DraggableComponent[] = [
  {
    name: 'one-to-many',
    ToolIconName: 'OneToMany',
    jsonSchemaElement: {
      '$ref': '#/definitions/Root',
    },
    uiSchema: updateScopeOfUISchemaElement('#', '#/properties/oneToMany', {
      type: 'Control',
      //@ts-ignore
      scope: '#/properties/oneToMany',
      options: {
        inline: true,
        context: {
          typeIRI: 'http://schema.org/Person',
        }
      },
    }),
  },
  {
    name: 'many-to-many',
    ToolIconName: 'ManyToMany',
    jsonSchemaElement: {
      type: 'array',
      items: {
        '$ref': '#/definitions/Root',
      },
    },
    uiSchema: updateScopeOfUISchemaElement('#', '#/properties/manyToMany', {
      type: 'Control',
      //@ts-ignore
      scope: '#/properties/manyToMany',
      options: {
        inline: true,
        context: {
          typeIRI: 'http://schema.org/Person',
        }
      },
    }),
  }
]
