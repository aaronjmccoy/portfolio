/**
 * @generated SignedSource<<b135841d7c0647ab7f6994db5ac9d1f2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type HeaderSuggestionsQuery$variables = {
  q: string;
};
export type HeaderSuggestionsQuery$data = {
  readonly predictiveSearch: {
    readonly products: ReadonlyArray<{
      readonly featuredImage: {
        readonly altText: string | null | undefined;
        readonly height: number | null | undefined;
        readonly url: any;
        readonly width: number | null | undefined;
      } | null | undefined;
      readonly handle: string;
      readonly id: string;
      readonly title: string;
    }>;
  } | null | undefined;
};
export type HeaderSuggestionsQuery = {
  response: HeaderSuggestionsQuery$data;
  variables: HeaderSuggestionsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "q"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 6
  },
  {
    "kind": "Variable",
    "name": "query",
    "variableName": "q"
  },
  {
    "kind": "Literal",
    "name": "types",
    "value": [
      "PRODUCT"
    ]
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
  "kind": "ScalarField",
  "name": "handle",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "altText",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "width",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "height",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "HeaderSuggestionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "PredictiveSearchResult",
        "kind": "LinkedField",
        "name": "predictiveSearch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Product",
            "kind": "LinkedField",
            "name": "products",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "featuredImage",
                "plural": false,
                "selections": [
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  (v7/*:: as any*/),
                  (v8/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "name": "HeaderSuggestionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "PredictiveSearchResult",
        "kind": "LinkedField",
        "name": "predictiveSearch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Product",
            "kind": "LinkedField",
            "name": "products",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              (v4/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "featuredImage",
                "plural": false,
                "selections": [
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  (v7/*:: as any*/),
                  (v8/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d09c238e44d539a3b2cf77528ea017e5",
    "id": null,
    "metadata": {},
    "name": "HeaderSuggestionsQuery",
    "operationKind": "query",
    "text": "query HeaderSuggestionsQuery(\n  $q: String!\n) {\n  predictiveSearch(query: $q, limit: 6, types: [PRODUCT]) {\n    products {\n      id\n      handle\n      title\n      featuredImage {\n        url\n        altText\n        width\n        height\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a1c9c657627a6b644caa233543b127b3";

export default node;
