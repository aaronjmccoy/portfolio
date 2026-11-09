/**
 * @generated SignedSource<<41444115f251623214e8f0416fd98dd0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Mosaic_products$data = ReadonlyArray<{
  readonly featuredImage: {
    readonly height: number | null | undefined;
    readonly width: number | null | undefined;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"ProductCard_product">;
  readonly " $fragmentType": "Mosaic_products";
}>;
export type Mosaic_products$key = ReadonlyArray<{
  readonly " $data"?: Mosaic_products$data;
  readonly " $fragmentSpreads": FragmentRefs<"Mosaic_products">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "Mosaic_products",
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
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "featuredImage",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "width",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "height",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProductCard_product"
    }
  ],
  "type": "Product",
  "abstractKey": null
};

(node as any).hash = "63cb2759f403394e590d66b046b11a3e";

export default node;
