/**
 * @generated SignedSource<<fcd2747dda98d00730aa92b638d87c4e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CartLineInput = {
  attributes?: ReadonlyArray<AttributeInput> | null | undefined;
  merchandiseId: string;
  parent?: CartLineParentInput | null | undefined;
  quantity?: number | null | undefined;
  sellingPlanId?: string | null | undefined;
};
export type AttributeInput = {
  key: string;
  value: string;
};
export type CartLineParentInput = {
  lineId?: string | null | undefined;
  merchandiseId?: string | null | undefined;
};
export type CartContextCreateMutation$variables = {
  lines: ReadonlyArray<CartLineInput>;
};
export type CartContextCreateMutation$data = {
  readonly cartCreate: {
    readonly cart: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"CartContents_cart">;
    } | null | undefined;
    readonly userErrors: ReadonlyArray<{
      readonly message: string;
    }>;
  } | null | undefined;
};
export type CartContextCreateMutation = {
  response: CartContextCreateMutation$data;
  variables: CartContextCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "lines"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "lines",
        "variableName": "lines"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "CartUserError",
  "kind": "LinkedField",
  "name": "userErrors",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "message",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
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
    "name": "CartContextCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CartCreatePayload",
        "kind": "LinkedField",
        "name": "cartCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Cart",
            "kind": "LinkedField",
            "name": "cart",
            "plural": false,
            "selections": [
              (v2/*:: as any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "CartContents_cart"
              }
            ],
            "storageKey": null
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "CartContextCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CartCreatePayload",
        "kind": "LinkedField",
        "name": "cartCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
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
                    "selections": (v4/*:: as any*/),
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
                      (v5/*:: as any*/),
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
                            "selections": (v4/*:: as any*/),
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
                          (v5/*:: as any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*:: as any*/),
                              (v6/*:: as any*/),
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
                                  (v6/*:: as any*/),
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
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e0cd8fa9b4d9f3c4bd4fd25cf6285861",
    "id": null,
    "metadata": {},
    "name": "CartContextCreateMutation",
    "operationKind": "mutation",
    "text": "mutation CartContextCreateMutation(\n  $lines: [CartLineInput!]!\n) {\n  cartCreate(input: {lines: $lines}) {\n    cart {\n      id\n      ...CartContents_cart\n    }\n    userErrors {\n      message\n    }\n  }\n}\n\nfragment CartContents_cart on Cart {\n  id\n  checkoutUrl\n  totalQuantity\n  cost {\n    subtotalAmount {\n      amount\n      currencyCode\n    }\n  }\n  lines(first: 100) {\n    nodes {\n      __typename\n      id\n      quantity\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n      }\n      merchandise {\n        __typename\n        ... on ProductVariant {\n          id\n          title\n          product {\n            handle\n            title\n            id\n          }\n          image {\n            url\n            altText\n            width\n            height\n            id\n          }\n          selectedOptions {\n            name\n            value\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b8273d02a75f56c67ab679fb786e23f2";

export default node;
