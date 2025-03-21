import { isObjectArrayControl, rankWith, UISchemaElement } from "@jsonforms/core";
import isEmpty from "lodash-es/isEmpty";

export const inlineDropdownRendererTester = rankWith(15, (uischema: UISchemaElement, schema, ctx): boolean => {
      if (isEmpty(uischema) || isObjectArrayControl(uischema, schema, ctx)) {
        return false;
      }
      const options = uischema.options || {};
      return !isEmpty(options) && options["dropdown"] === true;
    })