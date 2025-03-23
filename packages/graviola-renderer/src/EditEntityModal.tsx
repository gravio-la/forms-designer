import NiceModal, { NiceModalHocProps, useModal } from "@ebay/nice-modal-react";
import { useAdbContext, useTypeIRIFromEntity } from "@graviola/edb-state-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCRUDWithQueryClient,
} from "@graviola/edb-state-hooks";
import { selectUiSchema, useAppSelector } from '@formswizard/state'
import { Button, Stack } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import { PrimaryFieldResults } from "@graviola/edb-core-types";
import { cleanJSONLD } from "@graviola/jsonld-utils";
import { MuiEditDialog } from "@graviola/edb-basic-components";
import {
  applyToEachField,
  extractFieldIfString,
} from "@graviola/edb-data-mapping";
import { EditEntityModalProps } from "@graviola/semantic-jsonform-types";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import { materialCells } from "@jsonforms/material-renderers";
import isEqual from "lodash-es/isEqual";

export const EditEntityModal: (renderers: JsonFormsRendererRegistryEntry[]) => React.FC<EditEntityModalProps & NiceModalHocProps> = (renderers) => NiceModal.create(
  ({
    typeIRI,
    entityIRI,
    data: defaultData,
    disableLoad,
  }: EditEntityModalProps) => {
    const {
      jsonLDConfig,
      typeIRIToTypeName,
      queryBuildOptions: { primaryFieldExtracts },
      components: { SemanticJsonForm },
      createEntityIRI
    } = useAdbContext();
    const modal = useModal();
    const classIRI = useTypeIRIFromEntity(entityIRI, typeIRI, disableLoad);
    const typeName = useMemo(
      () => typeIRIToTypeName(classIRI),
      [classIRI, typeIRIToTypeName],
    );
    const uischema = useAppSelector(rootState => rootState.jsonFormsEdit.uiSchemas[typeName])
    const loadedSchema = useAppSelector(rootState => rootState.jsonFormsEdit.definitions[typeName] as JSONSchema7);
    const { loadQuery, saveMutation } = useCRUDWithQueryClient({
      entityIRI,
      typeIRI: classIRI,
      schema: loadedSchema,
      queryOptions: {
        enabled: !disableLoad,
        refetchOnWindowFocus: true,
        initialData: defaultData,
      },
      loadQueryKey: "show"
    });
    const [firstTimeSaved, setFirstTimeSaved] = useState(false);
    const [isStale, setIsStale] = useState(false);
    const data = loadQuery.data?.document || defaultData;
    const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
      const fieldDecl = primaryFieldExtracts[typeName];
      if (data && fieldDecl)
        return applyToEachField(data, fieldDecl, extractFieldIfString);
      return {
        label: null,
        description: null,
        image: null,
      };
    }, [typeName, data, primaryFieldExtracts]);

    const [ formData, setFormData ] = useState(data);


    const handleSaveSuccess = useCallback(() => {
      setFirstTimeSaved(true);
      setIsStale(false);
    }, [setFirstTimeSaved, setIsStale]);

    const handleSave = useCallback(
      async (saveSuccess?: () => void) => {
        console.log("save")
        saveMutation
          .mutateAsync(formData)
          .then(async (skipLoading?: boolean) => {
            !skipLoading && (await loadQuery.refetch());
            handleSaveSuccess();
            typeof saveSuccess === "function" && saveSuccess();
          })
          .catch((e) => {
            console.error("Error while saving " + e.message);
          });
      },
      [saveMutation, loadQuery, formData, handleSaveSuccess],
    );

    const handleAccept = useCallback(() => {
      const acceptCallback = async () => {
        let cleanedData = await cleanJSONLD(formData, loadedSchema, {
          jsonldContext: jsonLDConfig.jsonldContext,
          defaultPrefix: jsonLDConfig.defaultPrefix,
          keepContext: true,
        });
        const entityIRI = formData["@id"] || createEntityIRI(typeName)
        modal.resolve({
          entityIRI,
          data: cleanedData,
        });
        modal.remove();
      };
      return handleSave(acceptCallback);
    }, [formData, loadedSchema, handleSave, modal, jsonLDConfig, createEntityIRI, typeName]);


    const handleFormDataChange = useCallback(
      async (data: any) => {
        // Skip update if data is deeply equal to current formData
        // to prevent unnecessary state updates and re-renders
        if (isEqual(data, formData)) {
          return;
        }
        setFormData(data);
        console.log("formData", formData)
        setIsStale(true);
      },
      [setIsStale, setFormData, formData],
    );

    return (
      <MuiEditDialog
        open={modal.visible}
        onClose={() => modal.remove()}
        onSave={handleSave}
        title={cardInfo.label}
        editMode={true}
        actions={
          <Stack>
            <Button onClick={handleAccept}>
              {isStale || !firstTimeSaved ? "save and accept" : "accept"}
            </Button>
            <Button onClick={() => modal.remove()}>cancel</Button>
          </Stack>
        }
      >
      <JsonForms
        data={data}
        renderers={renderers}
        cells={materialCells}
        onChange={handleFormDataChange}
        schema={loadedSchema}
        uischema={uischema}
      />
      </MuiEditDialog>
    );
  },
);
