/**
 * @generated SignedSource<<534178ddf41a4d09ef115434413fedc9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type HeaderCartCountQuery$variables = {
  id: string;
};
export type HeaderCartCountQuery$data = {
  readonly cart: {
    readonly id: string;
    readonly totalQuantity: number;
  } | null | undefined;
};
export type HeaderCartCountQuery = {
  response: HeaderCartCountQuery$data;
  variables: HeaderCartCountQuery$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "Cart",
    "kind": "LinkedField",
    "name": "cart",
    "plural": false,
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
        "name": "totalQuantity",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "HeaderCartCountQuery",
    "selections": (v1/*:: as any*/),
    "type": "QueryRoot",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "HeaderCartCountQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "9ad0b7b83d6e954255d099efd16e3cbc",
    "id": null,
    "metadata": {},
    "name": "HeaderCartCountQuery",
    "operationKind": "query",
    "text": "query HeaderCartCountQuery(\n  $id: ID!\n) {\n  cart(id: $id) {\n    id\n    totalQuantity\n  }\n}\n"
  }
};
})();

(node as any).hash = "80dbac7b4f3f3fc4df8dfda9fc564740";

export default node;
