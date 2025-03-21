import { isObjectArrayControl, rankWith, UISchemaElement } from "@jsonforms/core";
import isEmpty from "lodash-es/isEmpty";

export const inlineSemanticFormsRendererTester = rankWith(15, (uischema: UISchemaElement, schema, ctx): boolean => {
  if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
    return false;
  }
  return !isEmpty(uischema.options) && uischema?.options?.["inline"];
});