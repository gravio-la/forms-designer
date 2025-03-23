import { JsonSchema, Scopable, UISchemaElement } from '@jsonforms/core'
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

// export const exampleInitialState1: JsonFormsEditState = {
//   jsonSchema: {
//     type: 'object',
//     properties: {
//       name: {
//         type: 'string',
//       },
//       description: {
//         type: 'string',
//       },
//       done: {
//         type: 'boolean',
//       },
//       rating: {
//         type: 'integer',
//       },
//       customerSatisfaction: {
//         type: 'integer',
//       },
//       category: {
//         type: 'object',
//         properties: {
//           name: {
//             type: 'string',
//           },
//           description: {
//             type: 'string',
//           },
//         },
//       },
//       address: {
//         type: 'object',
//         properties: {
//           created: {
//             type: 'string',
//             format: 'date-time',
//           },
//           street: {
//             type: 'string',
//           },
//           city: {
//             type: 'string',
//           },
//           zip: {
//             type: 'string',
//             pattern: '[0-9]{5}',
//           },
//           country: {
//             type: 'string',
//             enum: ['Germany', 'France', 'UK', 'USA', 'Italy', 'Spain'],
//           },
//         },
//       },
//     },
//     required: ['name'],
//   },
//   uiSchema: {
//     type: 'VerticalLayout',
//     elements: [
//       {
//         type: 'Control',
//         scope: '#/properties/name',
//       },
//       {
//         type: 'HorizontalLayout',
//         elements: [
//           {
//             type: 'Control',
//             scope: '#/properties/rating',
//           },
//           {
//             type: 'Control',
//             scope: '#/properties/customerSatisfaction',
//           },
//         ],
//       },
//       {
//         type: 'Control',
//         scope: '#/properties/category/properties/name',
//       },
//       {
//         type: 'Control',
//         scope: '#/properties/category/properties/description',
//       },
//       {
//         type: 'Control',
//         scope: '#/properties/description',
//       },
//       {
//         type: 'Control',
//         scope: '#/properties/done',
//       },
//       {
//         type: 'Group',
//         label: 'Address',
//         elements: [
//           {
//             type: 'VerticalLayout',
//             elements: [
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/created',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/street',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/city',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/zip',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/country',
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// }

// export const exampleInitialState2: JsonFormsEditState = {
//   jsonSchema: {
//     type: 'object',
//     properties: {
//       address: {
//         type: 'object',
//         properties: {
//           created: {
//             type: 'string',
//             format: 'date-time',
//           },
//           street: {
//             type: 'string',
//           },
//           city: {
//             type: 'string',
//           },
//           zip: {
//             type: 'string',
//             pattern: '[0-9]{5}',
//           },
//           country: {
//             type: 'string',
//             enum: ['Germany', 'France', 'UK', 'USA', 'Italy', 'Spain'],
//           },
//         },
//       },
//     },
//   },
//   uiSchema: {
//     type: 'VerticalLayout',
//     elements: [
//       {
//         type: 'Group',
//         label: 'address',

//         elements: [
//           {
//             type: 'VerticalLayout',
//             elements: [
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/created',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/street',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/city',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/zip',
//               },
//               {
//                 type: 'Control',
//                 scope: '#/properties/address/properties/country',
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// }

export const exampleInitialState: JsonFormsEditState = {
  jsonSchema: {
    type: 'object',
    properties: {
      mainCharacter: {
        $ref: "#/definitions/Person"
      }
    },
  },
  uiSchema: { type: 'VerticalLayout', elements: [
    {
      type: "Control",
      scope: "#/properties/mainCharacter",
      options: {
        inline: true,
        context: {
          typeIRI: "http://schema.org/Person"
        }
      }
    
    }
  ] },
  definitions: {
    Person: {
      type: 'object',
      properties: {
        "givenName": {
          type: "string"
        },
        "jobTitle": {
          type: "string"
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
        }
      ]
    } 
  },
  selectedDefinition: 'Root',
  definitionsKey: "definitions"
}
