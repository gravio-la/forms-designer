import { describe, test, expect } from 'bun:test'
import {
  buildBlockSchema,
  deduplicateBlockName,
  deriveGroupName,
  createBuildingBlock,
} from './buildingBlockHelper'
import type { ResolveSchemaFn } from './buildingBlockHelper'

const trivialResolve: ResolveSchemaFn = (_root, scope, _rootForResolving) => {
  const segments = scope
    .replace(/^#\/properties\//, '')
    .split('/properties/')
  let current: any = _root
  for (const seg of segments) {
    current = current?.properties?.[seg]
  }
  return current ?? {}
}

// ---------------------------------------------------------------------------
// buildBlockSchema
// ---------------------------------------------------------------------------
describe('buildBlockSchema', () => {
  test('single flat property', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    }
    const result = buildBlockSchema(
      ['#/properties/name'],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    })
  })

  test('multiple flat properties', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        age: { type: 'number' },
      },
    }
    const result = buildBlockSchema(
      ['#/properties/firstName', '#/properties/lastName', '#/properties/age'],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        age: { type: 'number' },
      },
    })
  })

  test('nested property builds intermediate object nodes', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
          },
        },
      },
    }
    const result = buildBlockSchema(
      ['#/properties/address/properties/street'],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
          },
        },
      },
    })
  })

  test('multiple nested properties sharing a common ancestor', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zip: { type: 'string' },
          },
        },
      },
    }
    const result = buildBlockSchema(
      [
        '#/properties/address/properties/street',
        '#/properties/address/properties/city',
      ],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    })
  })

  test('mixed flat and nested properties', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
          },
        },
      },
    }
    const result = buildBlockSchema(
      ['#/properties/name', '#/properties/address/properties/street'],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
          },
        },
      },
    })
  })

  test('deeply nested (3 levels)', () => {
    const rootSchema = {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: {
                c: { type: 'integer' },
              },
            },
          },
        },
      },
    }
    const result = buildBlockSchema(
      ['#/properties/a/properties/b/properties/c'],
      rootSchema,
      trivialResolve
    )
    expect(result).toEqual({
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: {
                c: { type: 'integer' },
              },
            },
          },
        },
      },
    })
  })

  test('empty scopes array produces empty properties', () => {
    const result = buildBlockSchema(
      [],
      { type: 'object', properties: {} },
      trivialResolve
    )
    expect(result).toEqual({ type: 'object', properties: {} })
  })

  test('invalid scope (no #/ prefix) is skipped', () => {
    const result = buildBlockSchema(
      ['properties/name'],
      { type: 'object', properties: { name: { type: 'string' } } },
      trivialResolve
    )
    expect(result).toEqual({ type: 'object', properties: {} })
  })

  test('deep clone prevents mutation of source schema', () => {
    const leafSchema = { type: 'string', minLength: 1 }
    const rootSchema = {
      type: 'object',
      properties: { name: leafSchema },
    }
    const result = buildBlockSchema(
      ['#/properties/name'],
      rootSchema,
      trivialResolve
    )
    ;(result as any).properties.name.minLength = 999
    expect(leafSchema.minLength).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// deduplicateBlockName
// ---------------------------------------------------------------------------
describe('deduplicateBlockName', () => {
  test('returns candidate when no conflict', () => {
    expect(deduplicateBlockName('Address', ['Name', 'Phone'])).toBe('Address')
  })

  test('appends _1 on first conflict', () => {
    expect(deduplicateBlockName('Name', ['Name'])).toBe('Name_1')
  })

  test('increments until unique', () => {
    expect(deduplicateBlockName('Name', ['Name', 'Name_1', 'Name_2'])).toBe(
      'Name_3'
    )
  })

  test('works with empty existing list', () => {
    expect(deduplicateBlockName('Foo', [])).toBe('Foo')
  })
})

// ---------------------------------------------------------------------------
// deriveGroupName
// ---------------------------------------------------------------------------
describe('deriveGroupName', () => {
  test('prefers label', () => {
    expect(
      deriveGroupName({ type: 'Group', label: 'My Group', scope: '#/properties/foo' } as any)
    ).toBe('My Group')
  })

  test('falls back to last scope segment', () => {
    expect(
      deriveGroupName({ type: 'Group', scope: '#/properties/address/properties/street' } as any)
    ).toBe('street')
  })

  test('falls back to Untitled if no label or scope', () => {
    expect(deriveGroupName({ type: 'Group' } as any)).toBe('Untitled')
  })
})

// ---------------------------------------------------------------------------
// createBuildingBlock (integration)
// ---------------------------------------------------------------------------
describe('createBuildingBlock', () => {
  test('produces a complete building block with flat controls', () => {
    const payload = {
      item: {
        componentMeta: {
          uiSchema: {
            type: 'Group',
            label: 'Person',
            elements: [
              { type: 'Control', scope: '#/properties/firstName' },
              { type: 'Control', scope: '#/properties/lastName' },
            ],
          },
        },
      },
      jsonSchema: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
      ToolIconName: 'Person',
    }

    const result = createBuildingBlock(payload, [], trivialResolve)
    expect(result.name).toBe('Person')
    expect(result.ToolIconName).toBe('Person')
    expect(result.jsonSchemaElement).toEqual({
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    })
    expect(result.uiSchema).toBe(payload.item.componentMeta.uiSchema)
  })

  test('deduplicates name against existing blocks', () => {
    const payload = {
      item: {
        componentMeta: {
          uiSchema: {
            type: 'Group',
            label: 'Address',
            elements: [
              { type: 'Control', scope: '#/properties/street' },
            ],
          },
        },
      },
      jsonSchema: {
        type: 'object',
        properties: { street: { type: 'string' } },
      },
    }

    const result = createBuildingBlock(
      payload,
      ['Address', 'Address_1'],
      trivialResolve
    )
    expect(result.name).toBe('Address_2')
  })

  test('handles nested controls correctly', () => {
    const payload = {
      item: {
        componentMeta: {
          uiSchema: {
            type: 'Group',
            label: 'Full Address',
            elements: [
              { type: 'Control', scope: '#/properties/address/properties/street' },
              { type: 'Control', scope: '#/properties/address/properties/city' },
            ],
          },
        },
      },
      jsonSchema: {
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
          },
        },
      },
    }

    const result = createBuildingBlock(payload, [], trivialResolve)
    expect(result.jsonSchemaElement).toEqual({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    })
  })
})
