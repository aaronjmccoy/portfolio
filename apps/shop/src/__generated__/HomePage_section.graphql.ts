/**
 * @generated SignedSource<<26555c873b8784208f39a137e05cf727>>
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
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"ProductCard_product">;
    }>;
  };
  readonly title: string;
  readonly " $fragmentType": "HomePage_section";
};
export type HomePage_section$key = {
  readonly " $data"?: HomePage_section$data;
  readonly " $fragmentSpreads": FragmentRefs<"HomePage_section">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HomePage_section",
  "selections": [
    (v0/*:: as any*/),
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
          "value": 6
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
            (v0/*:: as any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ProductCard_product"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "products(first:6)"
    }
  ],
  "type": "Collection",
  "abstractKey": null
};
})();

(node as any).hash = "821fef3966ce9339614dd3b8b9e4cf86";

export default node;
