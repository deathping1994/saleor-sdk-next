import { useContext } from "react";
import { DocumentNode, QueryResult, useQuery } from "@apollo/client";
import { SaleorContext } from "../components/SaleorProvider";

const CreateSaleorStateHook = <TData, TVariables>(
  query: DocumentNode
): QueryResult<TData, TVariables> => {
  const saleorClient = useContext(SaleorContext);

  if (!saleorClient) {
    throw new Error(
      "Could not find saleor's apollo client in the context. Did you forget to wrap the root component in a <SaleorProvider>?"
    );
  }

  return useQuery<TData, TVariables>(query, {
    client: saleorClient._internal.apolloClient,
    fetchPolicy: "cache-only",
    // REST-persisted checkout lines omit optional fields (line.data,
    // variant.quantityAvailable) that GET_LOCAL_CHECKOUT selects. Without this,
    // a missing-field error makes the whole read return undefined and the cart
    // renders empty. Partial data returns the lines we do have.
    returnPartialData: true,
  });
};

export const hookStateFactory = <TData, TVariables>(
  query: DocumentNode
): QueryResult<TData, TVariables> =>
  CreateSaleorStateHook<TData, TVariables>(query);
