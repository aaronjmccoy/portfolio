/**
 * @generated SignedSource<<c1a6afd22b4050b5687f10ddc61996ea>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChapterPageQuery$variables = {
  after?: string | null | undefined;
  first: number;
  key: string;
};
export type ChapterPageQuery$data = {
  readonly section: {
    readonly chapter: number | null | undefined;
    readonly id: string;
    readonly letterCount: number;
    readonly title: string;
    readonly " $fragmentSpreads": FragmentRefs<"ChapterPage_letters">;
  } | null | undefined;
};
export type ChapterPageQuery = {
  response: ChapterPageQuery$data;
  variables: ChapterPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "key"
},
v3 = [
  {
    "kind": "Variable",
    "name": "key",
    "variableName": "key"
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
  "name": "chapter",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "letterCount",
  "storageKey": null
},
v8 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ChapterPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "Section",
        "kind": "LinkedField",
        "name": "section",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          {
            "args": (v8/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "ChapterPage_letters"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "ChapterPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "Section",
        "kind": "LinkedField",
        "name": "section",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": (v8/*:: as any*/),
            "concreteType": "SectionLettersConnection",
            "kind": "LinkedField",
            "name": "letters",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SectionLettersConnectionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Letter",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
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
                        "name": "number",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "variant",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "group",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pageCount",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Transcription",
                        "kind": "LinkedField",
                        "name": "transcription",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "source",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
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
            "args": (v8/*:: as any*/),
            "filters": null,
            "handle": "connection",
            "key": "ChapterPage_letters",
            "kind": "LinkedHandle",
            "name": "letters"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ec45b54d7462240dc15a77716b922cdf",
    "id": null,
    "metadata": {},
    "name": "ChapterPageQuery",
    "operationKind": "query",
    "text": "query ChapterPageQuery(\n  $key: String!\n  $first: Int!\n  $after: String\n) {\n  section(key: $key) {\n    id\n    chapter\n    title\n    letterCount\n    ...ChapterPage_letters_2HEEH6\n  }\n}\n\nfragment ChapterPage_letters_2HEEH6 on Section {\n  letters(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        key\n        number\n        variant\n        group\n        pageCount\n        transcription {\n          source\n        }\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n"
  }
};
})();

(node as any).hash = "e6e24b8c96ce4961bc98bc5e1294dcdb";

export default node;
