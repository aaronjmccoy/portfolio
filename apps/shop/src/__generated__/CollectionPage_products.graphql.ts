/**
 * @generated SignedSource<<4655c65a29763501b0ce5c372f2d02f1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CollectionPage_products$data = {
  readonly id: string;
  readonly products: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"Mosaic_products">;
      };
    }>;
  };
  readonly " $fragmentType": "CollectionPage_products";
};
export type CollectionPage_products$key = {
  readonly " $data"?: CollectionPage_products$data;
  readonly " $fragmentSpreads": FragmentRefs<"CollectionPage_products">;
};

import CollectionPageProductsPaginationQuery_graphql from './CollectionPageProductsPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "products"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "after"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*:: as any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": CollectionPageProductsPaginationQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "CollectionPage_products",
  "selections": [
    {
      "alias": "products",
      "args": null,
      "concreteType": "ProductConnection",
      "kind": "LinkedField",
      "name": "__CollectionPage_products_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProductEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Product",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*:: as any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "Mosaic_products"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v1/*:: as any*/)
  ],
  "type": "Collection",
  "abstractKey": null
};
})();

(node as any).hash = "49350d1cf72aa95e1c12f881d49c88b0";

export default node;
