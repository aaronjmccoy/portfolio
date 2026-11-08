/**
 * @generated SignedSource<<c38fdfe14b91062c4b887253b837bf47>>
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
export type CartContextLinesAddMutation$variables = {
  cartId: string;
  lines: ReadonlyArray<CartLineInput>;
};
export type CartContextLinesAddMutation$data = {
  readonly cartLinesAdd: {
    readonly cart: {
      readonly " $fragmentSpreads": FragmentRefs<"CartContents_cart">;
    } | null | undefined;
    readonly userErrors: ReadonlyArray<{
      readonly message: string;
    }>;
  } | null | undefined;
};
export type CartContextLinesAddMutation = {
  response: CartContextLinesAddMutation$data;
  variables: CartContextLinesAddMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cartId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "lines"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "cartId",
    "variableName": "cartId"
  },
  {
    "kind": "Variable",
    "name": "lines",
    "variableName": "lines"
  }
],
v2 = {
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    "name": "CartContextLinesAddMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CartLinesAddPayload",
        "kind": "LinkedField",
        "name": "cartLinesAdd",
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
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "CartContents_cart"
              }
            ],
            "storageKey": null
          },
          (v2/*:: as any*/)
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
    "name": "CartContextLinesAddMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CartLinesAddPayload",
        "kind": "LinkedField",
        "name": "cartLinesAdd",
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
              (v3/*:: as any*/),
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
                      (v3/*:: as any*/),
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
                              (v3/*:: as any*/),
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
                                  (v3/*:: as any*/)
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
                                  (v3/*:: as any*/)
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
                              (v3/*:: as any*/)
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
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ca0e7a7b08b83de94204581778920a9c",
    "id": null,
    "metadata": {},
    "name": "CartContextLinesAddMutation",
    "operationKind": "mutation",
    "text": "mutation CartContextLinesAddMutation(\n  $cartId: ID!\n  $lines: [CartLineInput!]!\n) {\n  cartLinesAdd(cartId: $cartId, lines: $lines) {\n    cart {\n      ...CartContents_cart\n      id\n    }\n    userErrors {\n      message\n    }\n  }\n}\n\nfragment CartContents_cart on Cart {\n  id\n  checkoutUrl\n  totalQuantity\n  cost {\n    subtotalAmount {\n      amount\n      currencyCode\n    }\n  }\n  lines(first: 100) {\n    nodes {\n      __typename\n      id\n      quantity\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n      }\n      merchandise {\n        __typename\n        ... on ProductVariant {\n          id\n          title\n          product {\n            handle\n            title\n            id\n          }\n          image {\n            url\n            altText\n            width\n            height\n            id\n          }\n          selectedOptions {\n            name\n            value\n          }\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f7d0b0587a13d7997d611e516e6fd165";

export default node;
