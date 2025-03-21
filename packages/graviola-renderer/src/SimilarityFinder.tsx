import { FunctionComponent, useMemo } from "react";
import { EntityFinder } from "@graviola/entity-finder";
import { FinderKnowledgeBaseDescription, SimilarityFinderProps } from "@graviola/semantic-jsonform-types";
import { useAdbContext, useDataStore } from "@graviola/edb-state-hooks";
import { KBMainDatabase } from "@graviola/edb-advanced-components";

const useKnowledgeBases = () => {
  const { queryBuildOptions } = useAdbContext();
  const { dataStore } = useDataStore();
  const kbs: FinderKnowledgeBaseDescription[] = useMemo(
    () => dataStore ? [
      KBMainDatabase(dataStore, queryBuildOptions.primaryFields, queryBuildOptions.typeIRItoTypeName)
    ] : [],
    [dataStore, queryBuildOptions]
  );
  return kbs;
}

export const SimilarityFinder: FunctionComponent<SimilarityFinderProps> = (
  props,
) => {
  const allKnowledgeBases = useKnowledgeBases();

  return <EntityFinder {...props} allKnowledgeBases={allKnowledgeBases} />;
};
