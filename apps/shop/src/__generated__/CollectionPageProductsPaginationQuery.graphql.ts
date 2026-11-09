/**
 * @generated SignedSource<<7cbd6c83601022175d326a01379f1ae9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CollectionPageProductsPaginationQuery$variables = {
  after?: string | null | undefined;
  first: number;
  id: string;
};
export type CollectionPageProductsPaginationQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"CollectionPage_products">;
  } | null | undefined;
};
export type CollectionPageProductsPaginationQuery = {
  response: CollectionPageProductsPaginationQuery$data;
  variables: CollectionPageProductsPaginationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CollectionPageProductsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": (v2/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "CollectionPage_products"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "QueryRoot",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "CollectionPageProductsPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v2/*:: as any*/),
                "concreteType": "ProductConnection",
                "kind": "LinkedField",
                "name": "products",
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
                          (v4/*:: as any*/),
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
                              },
                              (v4/*:: as any*/),
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
                              }
                            ],
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
                            "name": "availableForSale",
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
                                "selections": (v5/*:: as any*/),
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "MoneyV2",
                                "kind": "LinkedField",
                                "name": "maxVariantPrice",
                                "plural": false,
                                "selections": (v5/*:: as any*/),
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v3/*:: as any*/)
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
              {
                "alias": null,
                "args": (v2/*:: as any*/),
                "filters": null,
                "handle": "connection",
                "key": "CollectionPage_products",
                "kind": "LinkedHandle",
                "name": "products"
              }
            ],
            "type": "Collection",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "21e643ae268734e6c566b34026283eb7",
    "id": null,
    "metadata": {},
    "name": "CollectionPageProductsPaginationQuery",
    "operationKind": "query",
    "text": "query CollectionPageProductsPaginationQuery(\n  $after: String\n  $first: Int!\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...CollectionPage_products_2HEEH6\n    id\n  }\n}\n\nfragment CollectionPage_products_2HEEH6 on Collection {\n  products(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        ...Mosaic_products\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n\nfragment Mosaic_products on Product {\n  id\n  featuredImage {\n    width\n    height\n    id\n  }\n  ...ProductCard_product\n}\n\nfragment ProductCard_product on Product {\n  id\n  handle\n  title\n  availableForSale\n  featuredImage {\n    url\n    altText\n    width\n    height\n    id\n  }\n  priceRange {\n    minVariantPrice {\n      amount\n      currencyCode\n    }\n    maxVariantPrice {\n      amount\n      currencyCode\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "49350d1cf72aa95e1c12f881d49c88b0";

export default node;
