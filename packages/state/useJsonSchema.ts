import { useAppSelector } from "./hooks"
import { selectJsonSchema, selectJsonSchemaDefinitions } from "./wizard/jsonFormsEditSlice"
import { useMemo } from "react"

export const useJsonSchema = () => {
  const jsonSchema = useAppSelector(selectJsonSchema)
  const definitions = useAppSelector(selectJsonSchemaDefinitions)
  return useMemo(() => {
    return {
      definitions: definitions,
      ...jsonSchema
    }
  }, [definitions, jsonSchema])
}
