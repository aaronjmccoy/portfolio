/**
 * @generated SignedSource<<2844b951c7efa9c4ed3664877162c9cf>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HomePageQuery$variables = Record<PropertyKey, never>;
export type HomePageQuery$data = {
  readonly originals: {
    readonly " $fragmentSpreads": FragmentRefs<"HomePage_section">;
  } | null | undefined;
  readonly prints: {
    readonly " $fragmentSpreads": FragmentRefs<"HomePage_section">;
  } | null | undefined;
  readonly stickers: {
    readonly " $fragmentSpreads": FragmentRefs<"HomePage_section">;
  } | null | undefined;
};
export type HomePageQuery = {
  response: HomePageQuery$data;
  variables: HomePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "handle",
    "value": "originals"
  }
],
v1 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "HomePage_section"
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "handle",
    "value": "prints"
  }
],
v3 = [
  {
    "kind": "Literal",
    "name": "handle",
    "value": "stickers"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "handle",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "amount",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "currencyCode",
    "storageKey": null
  }
],
v8 = [
  (v4/*:: as any*/),
  (v5/*:: as any*/),
  (v6/*:: as any*/),
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
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "availableForSale",
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
                "name": "url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "altText",
                "storageKey": null
              },
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
              },
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProductPriceRange",
            "kind": "LinkedField",
            "name": "priceRange",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "MoneyV2",
                "kind": "LinkedField",
                "name": "minVariantPrice",
                "plural": false,
                "selections": (v7/*:: as any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MoneyV2",
                "kind": "LinkedField",
                "name": "maxVariantPrice",
                "plural": false,
                "selections": (v7/*:: as any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "products(first:6)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "HomePageQuery",
    "selections": [
      {
        "alias": "originals",
        "args": (v0/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": "collection(handle:\"originals\")"
      },
      {
        "alias": "prints",
        "args": (v2/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": "collection(handle:\"prints\")"
      },
      {
        "alias": "stickers",
        "args": (v3/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": "collection(handle:\"stickers\")"
      }
    ],
    "type": "QueryRoot",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "HomePageQuery",
    "selections": [
      {
        "alias": "originals",
        "args": (v0/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v8/*:: as any*/),
        "storageKey": "collection(handle:\"originals\")"
      },
      {
        "alias": "prints",
        "args": (v2/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v8/*:: as any*/),
        "storageKey": "collection(handle:\"prints\")"
      },
      {
        "alias": "stickers",
        "args": (v3/*:: as any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v8/*:: as any*/),
        "storageKey": "collection(handle:\"stickers\")"
      }
    ]
  },
  "params": {
    "cacheID": "c5554056df5e0efa9e4e5c834dfdf5a6",
    "id": null,
    "metadata": {},
    "name": "HomePageQuery",
    "operationKind": "query",
    "text": "query HomePageQuery {\n  originals: collection(handle: \"originals\") {\n    ...HomePage_section\n    id\n  }\n  prints: collection(handle: \"prints\") {\n    ...HomePage_section\n    id\n  }\n  stickers: collection(handle: \"stickers\") {\n    ...HomePage_section\n    id\n  }\n}\n\nfragment HomePage_section on Collection {\n  id\n  handle\n  title\n  description\n  products(first: 6) {\n    nodes {\n      id\n      ...ProductCard_product\n    }\n  }\n}\n\nfragment ProductCard_product on Product {\n  id\n  handle\n  title\n  availableForSale\n  featuredImage {\n    url\n    altText\n    width\n    height\n    id\n  }\n  priceRange {\n    minVariantPrice {\n      amount\n      currencyCode\n    }\n    maxVariantPrice {\n      amount\n      currencyCode\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b491ef365fb12792db8cb825468713d7";

export default node;
