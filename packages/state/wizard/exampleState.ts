import { JsonSchema } from '@formswizard/types'
export type JsonFormsEditState = {
  jsonSchema: JsonSchema
  definitions: Record<string, JsonSchema>
  uiSchema?: any
  // selectedElementKey?: string | null
  selectedPath?: string
  uiSchemas: Record<string, any>
  selectedDefinition: string,
  definitionsKey: "definitions" | "$defs"
}

export const exampleBaseIRI = "http://forms-designer.winzlieb.eu/example#"
const typeNameToTypeIRI = (typeName: string) => `${exampleBaseIRI}${typeName}`

export const exampleInitialState: JsonFormsEditState = {
  jsonSchema: {
    type: 'object',
    properties: {
      "@id": {
        type: "string",
      },
      "@type": {
        const: typeNameToTypeIRI("Root")
      },
      mainCharacter: {
        $ref: "#/definitions/Person"
      },
      sideCharacters: {
        type: 'array',
        items: {
          $ref: "#/definitions/Person"
        }
      },
      "knows": {
        type: "array",
        items: {
          $ref: "#/definitions/Person"
        }
      }
    },
  },
  uiSchema: { type: 'VerticalLayout', elements: [
    {
      type: "Group",
      label: "Characters",
      elements: [
      ]
    },
    {
      type: "Control",
      scope: "#/properties/mainCharacter",
      options: {
        inline: true,
        dropdown: true,
        context: {
          typeIRI: typeNameToTypeIRI("Person")
        }
      }
    },
    {
      type: "Control",
      scope: "#/properties/sideCharacters",
      options: {
        inline: true,
        dropdown: true,
        context: {
          typeIRI: typeNameToTypeIRI("Person")
        }
      }
    },
    {
      type: "Control",
      scope: "#/properties/knows",
      options: {
        inline: true,
        chips: true,
        context: {
          typeIRI: typeNameToTypeIRI("Person")
        }
      }
    }
  ] },
  definitions: {
    Person: {
      type: 'object',
      properties: {
        "@id": {
          type: "string",
        },
        "@type": {
          const: typeNameToTypeIRI("Person")
        },
        "givenName": {
          type: "string"
        },
        "jobTitle": {
          type: "string"
        },
        "image": {
          type: "string",
          format: "uri"
        },
        "knows": {
          type: "array",
          items: {
            $ref: "#/definitions/Person"
          }
        }
      }
    }
  },
  uiSchemas: {
    "Person": {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/givenName"
        },
        {
          type: "Control",
          scope: "#/properties/jobTitle"
        },
        {
          type: "Control",
          scope: "#/properties/image"
        },
        {
          type: "Control",
          scope: "#/properties/knows",
          options: {
            inline: true,
            dropdown: true,
            chips: true,
            context: {
              typeIRI: typeNameToTypeIRI("Person")
            }
          }
        }
      ]
    } 
  },
  selectedDefinition: 'Root',
  definitionsKey: "definitions"
}
