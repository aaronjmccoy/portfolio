/**
 * @generated SignedSource<<2e4192d5e9946635620eb07108fae2d1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SectionsPageQuery$variables = Record<PropertyKey, never>;
export type SectionsPageQuery$data = {
  readonly sections: ReadonlyArray<{
    readonly chapter: number | null | undefined;
    readonly id: string;
    readonly key: string;
    readonly letterCount: number;
    readonly title: string;
  }>;
};
export type SectionsPageQuery = {
  response: SectionsPageQuery$data;
  variables: SectionsPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Section",
    "kind": "LinkedField",
    "name": "sections",
    "plural": true,
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
        "name": "key",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "chapter",
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
        "name": "letterCount",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SectionsPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SectionsPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "bb5360d8b9c6eeb18da9b3e6a428f480",
    "id": null,
    "metadata": {},
    "name": "SectionsPageQuery",
    "operationKind": "query",
    "text": "query SectionsPageQuery {\n  sections {\n    id\n    key\n    chapter\n    title\n    letterCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a12f54d762a6b981b1f7ab343bb7bb8";

export default node;
