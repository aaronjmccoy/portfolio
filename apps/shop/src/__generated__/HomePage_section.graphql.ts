/**
 * @generated SignedSource<<7a42dd69a518f27e22aa2ec3a0b0be05>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HomePage_section$data = {
  readonly description: string;
  readonly handle: string;
  readonly id: string;
  readonly products: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"Mosaic_products">;
    }>;
  };
  readonly title: string;
  readonly " $fragmentType": "HomePage_section";
};
export type HomePage_section$key = {
  readonly " $data"?: HomePage_section$data;
  readonly " $fragmentSpreads": FragmentRefs<"HomePage_section">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HomePage_section",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "handle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 8
        }
      ],
      "concreteType": "ProductConnection",
      "kind": "LinkedField",
      "name": "products",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Product",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Mosaic_products"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "products(first:8)"
    }
  ],
  "type": "Collection",
  "abstractKey": null
};

(node as any).hash = "169e16549f281fb382d9d47170d67def";

export default node;
