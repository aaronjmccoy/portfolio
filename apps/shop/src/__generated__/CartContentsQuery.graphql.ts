/**
 * @generated SignedSource<<1a4bf3c3e821d10324383c05d3c9c09a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CartContentsQuery$variables = {
  id: string;
};
export type CartContentsQuery$data = {
  readonly cart: {
    readonly " $fragmentSpreads": FragmentRefs<"CartContents_cart">;
  } | null | undefined;
};
export type CartContentsQuery = {
  response: CartContentsQuery$data;
  variables: CartContentsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CartContentsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Cart",
        "kind": "LinkedField",
        "name": "cart",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CartContents_cart"
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
    "name": "CartContentsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Cart",
        "kind": "LinkedField",
        "name": "cart",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "checkoutUrl",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalQuantity",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "CartCost",
            "kind": "LinkedField",
            "name": "cost",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "MoneyV2",
                "kind": "LinkedField",
                "name": "subtotalAmount",
                "plural": false,
                "selections": (v3/*:: as any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 100
              }
            ],
            "concreteType": "BaseCartLineConnection",
            "kind": "LinkedField",
            "name": "lines",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "quantity",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CartLineCost",
                    "kind": "LinkedField",
                    "name": "cost",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "MoneyV2",
                        "kind": "LinkedField",
                        "name": "totalAmount",
                        "plural": false,
                        "selections": (v3/*:: as any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "merchandise",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v2/*:: as any*/),
                          (v5/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Product",
                            "kind": "LinkedField",
                            "name": "product",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "handle",
                                "storageKey": null
                              },
                              (v5/*:: as any*/),
                              (v2/*:: as any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Image",
                            "kind": "LinkedField",
                            "name": "image",
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
                              (v2/*:: as any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SelectedOption",
                            "kind": "LinkedField",
                            "name": "selectedOptions",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "value",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "ProductVariant",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v2/*:: as any*/)
                        ],
                        "type": "Node",
                        "abstractKey": "__isNode"
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "lines(first:100)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "656afd4434f4c77e42f6aa790c160ef3",
    "id": null,
    "metadata": {},
    "name": "CartContentsQuery",
    "operationKind": "query",
    "text": "query CartContentsQuery(\n  $id: ID!\n) {\n  cart(id: $id) {\n    ...CartContents_cart\n    id\n  }\n}\n\nfragment CartContents_cart on Cart {\n  id\n  checkoutUrl\n  totalQuantity\n  cost {\n    subtotalAmount {\n      amount\n      currencyCode\n    }\n  }\n  lines(first: 100) {\n    nodes {\n      __typename\n      id\n      quantity\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n      }\n      merchandise {\n        __typename\n        ... on ProductVariant {\n          id\n          title\n          product {\n            handle\n            title\n            id\n          }\n          image {\n            url\n            altText\n            width\n            height\n            id\n          }\n          selectedOptions {\n            name\n            value\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "588a12f839ac616a53aa221a89a340b6";

export default node;
