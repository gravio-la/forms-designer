import React, { useState, useEffect, useCallback } from 'react'
import { JsonForms } from '@jsonforms/react'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import { JsonSchema7 } from '@jsonforms/core'
import { SparqlEndpoint } from '@graviola/edb-core-types'

// JSON Schema for SparqlEndpoint based on the type definition
const sparqlEndpointSchema: JsonSchema7 = {
  type: 'object',
  properties: {
    label: {
      type: 'string',
      title: 'Label',
      description: 'Human-readable name for this endpoint'
    },
    endpoint: {
      type: 'string',
      title: 'Endpoint URL',
      description: 'SPARQL endpoint URL',
      format: 'uri'
    },
    active: {
      type: 'boolean',
      title: 'Active',
      default: true
    },
    provider: {
      type: 'string',
      title: 'Provider',
      enum: ['allegro', 'oxigraph', 'worker', 'blazegraph', 'virtuoso', 'qlever', 'rest'],
      default: 'oxigraph'
    },
    defaultUpdateGraph: {
      type: 'string',
      title: 'Default Update Graph',
      description: 'Default graph for update operations',
      format: 'uri'
    },
    auth: {
      type: 'object',
      title: 'Authentication',
      properties: {
        type: {
          type: 'string',
          enum: ['basic', 'bearer', 'oauth'],
          title: 'Auth Type'
        },
        username: {
          type: 'string',
          title: 'Username'
        },
        password: {
          type: 'string',
          title: 'Password',
          format: 'password'
        },
        token: {
          type: 'string',
          title: 'Token'
        }
      }
    },
    additionalHeaders: {
      type: 'array',
      title: 'Additional Headers',
      description: 'Additional HTTP headers to send with requests',
      items: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            title: 'Header Name'
          },
          value: {
            type: 'string',
            title: 'Header Value'
          }
        },
        required: ['key', 'value']
      }
    }
  },
  required: ['endpoint', 'active']
}

// UI Schema for better form layout
const uiSchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/label'
    },
    {
      type: 'Control',
      scope: '#/properties/endpoint'
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/provider'
        },
        {
          type: 'Control',
          scope: '#/properties/active'
        }
      ]
    },
    {
      type: 'Control',
      scope: '#/properties/defaultUpdateGraph'
    },
    {
      type: 'Group',
      label: 'Authentication (Optional)',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/auth/properties/type'
        },
        {
          type: 'Control',
          scope: '#/properties/auth/properties/username',
          rule: {
            effect: 'SHOW',
            condition: {
              scope: '#/properties/auth/properties/type',
              schema: { const: 'basic' }
            }
          }
        },
        {
          type: 'Control',
          scope: '#/properties/auth/properties/password',
          rule: {
            effect: 'SHOW',
            condition: {
              scope: '#/properties/auth/properties/type',
              schema: { const: 'basic' }
            }
          }
        },
        {
          type: 'Control',
          scope: '#/properties/auth/properties/token',
          rule: {
            effect: 'SHOW',
            condition: {
              scope: '#/properties/auth/properties/type',
              schema: { 
                anyOf: [
                  { const: 'bearer' },
                  { const: 'oauth' }
                ]
              }
            }
          }
        }
      ]
    },
    {
      type: 'Control',
      scope: '#/properties/additionalHeaders',
      options: {
        showSortButtons: true,
        elementLabelProp: 'key'
      }
    }
  ]
}

// Helper functions to convert between array and object formats
function headersObjectToArray(headers?: Record<string, string>): { key: string; value: string }[] {
  if (!headers) return []
  return Object.entries(headers).map(([key, value]) => ({ key, value }))
}

function headersArrayToObject(headers?: { key: string; value: string }[]): Record<string, string> | undefined {
  if (!headers || headers.length === 0) return undefined
  return Object.fromEntries(headers.map(({ key, value }) => [key, value]))
}

// Internal data format for the form (with array-based headers)
interface EndpointFormData extends Omit<SparqlEndpoint, 'additionalHeaders'> {
  additionalHeaders?: { key: string; value: string }[]
}

interface EndpointEditFormProps {
  data: Partial<SparqlEndpoint>
  onChange: (data: SparqlEndpoint) => void
}

export function EndpointEditForm({ data, onChange }: EndpointEditFormProps) {
  // Internal form state to prevent input deletion issues
  const [formData, setFormData] = useState<Partial<EndpointFormData>>(() => ({
    ...data,
    additionalHeaders: headersObjectToArray(data.additionalHeaders)
  }))

  // Update form data when external data changes (but not during typing)
  useEffect(() => {
    const newFormData = {
      ...data,
      additionalHeaders: headersObjectToArray(data.additionalHeaders)
    }
    
    // Only update if the data is significantly different (avoid updating during typing)
    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData)
    }
  }, [data]) // Remove formData from deps to avoid infinite loop

  // Debounced onChange to avoid excessive updates
  const handleChange = useCallback(({ data: newData, errors }: any) => {
    if (newData) {
      const newFormData = newData as EndpointFormData
      setFormData(newFormData)
      
      // Only call onChange if there are no errors and data is valid
      if (!errors?.length && newFormData.endpoint) {
        // Convert form data back to SparqlEndpoint format (array headers -> object headers)
        const endpointData: SparqlEndpoint = {
          ...newFormData,
          additionalHeaders: headersArrayToObject(newFormData.additionalHeaders)
        }
        onChange(endpointData)
      }
    }
  }, [onChange])

  return (
    <JsonForms
      schema={sparqlEndpointSchema}
      uischema={uiSchema}
      data={formData}
      renderers={materialRenderers}
      cells={materialCells}
      onChange={handleChange}
    />
  )
}
