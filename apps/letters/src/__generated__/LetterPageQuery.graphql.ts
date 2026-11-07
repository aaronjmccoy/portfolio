/**
 * @generated SignedSource<<271b27a09dc6c7bb75d49fb0747755a6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LetterPageQuery$variables = {
  key: string;
};
export type LetterPageQuery$data = {
  readonly letter: {
    readonly companions: ReadonlyArray<{
      readonly ext: string;
      readonly id: string;
      readonly original: string;
      readonly page: string;
    }>;
    readonly group: string | null | undefined;
    readonly id: string;
    readonly key: string;
    readonly next: {
      readonly key: string;
      readonly number: number;
      readonly variant: string | null | undefined;
    } | null | undefined;
    readonly number: number;
    readonly pages: ReadonlyArray<{
      readonly id: string;
      readonly image: {
        readonly src: string;
        readonly srcset: string;
      } | null | undefined;
      readonly order: number;
      readonly original: string;
      readonly page: string;
    }>;
    readonly previous: {
      readonly key: string;
      readonly number: number;
      readonly variant: string | null | undefined;
    } | null | undefined;
    readonly section: {
      readonly chapter: number | null | undefined;
      readonly key: string;
      readonly title: string;
    };
    readonly transcription: {
      readonly markdown: string;
      readonly source: string;
    } | null | undefined;
    readonly variant: string | null | undefined;
  } | null | undefined;
};
export type LetterPageQuery = {
  response: LetterPageQuery$data;
  variables: LetterPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "key"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "key",
    "variableName": "key"
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
  "name": "key",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "variant",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "chapter",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "page",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "original",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "Page",
  "kind": "LinkedField",
  "name": "pages",
  "plural": true,
  "selections": [
    (v2/*:: as any*/),
    (v9/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "order",
      "storageKey": null
    },
    (v10/*:: as any*/),
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
          "name": "src",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "srcset",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Page",
  "kind": "LinkedField",
  "name": "companions",
  "plural": true,
  "selections": [
    (v2/*:: as any*/),
    (v9/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ext",
      "storageKey": null
    },
    (v10/*:: as any*/)
  ],
  "storageKey": null
},
v13 = {
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
      "name": "markdown",
      "storageKey": null
    },
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
v14 = [
  (v3/*:: as any*/),
  (v4/*:: as any*/),
  (v5/*:: as any*/)
],
v15 = [
  (v3/*:: as any*/),
  (v4/*:: as any*/),
  (v5/*:: as any*/),
  (v2/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LetterPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Letter",
        "kind": "LinkedField",
        "name": "letter",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Section",
            "kind": "LinkedField",
            "name": "section",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              (v7/*:: as any*/),
              (v8/*:: as any*/)
            ],
            "storageKey": null
          },
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Letter",
            "kind": "LinkedField",
            "name": "previous",
            "plural": false,
            "selections": (v14/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Letter",
            "kind": "LinkedField",
            "name": "next",
            "plural": false,
            "selections": (v14/*:: as any*/),
            "storageKey": null
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LetterPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Letter",
        "kind": "LinkedField",
        "name": "letter",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Section",
            "kind": "LinkedField",
            "name": "section",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              (v7/*:: as any*/),
              (v8/*:: as any*/),
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Letter",
            "kind": "LinkedField",
            "name": "previous",
            "plural": false,
            "selections": (v15/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Letter",
            "kind": "LinkedField",
            "name": "next",
            "plural": false,
            "selections": (v15/*:: as any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "377b9fab15ed85a16a231a3c09dd68fc",
    "id": null,
    "metadata": {},
    "name": "LetterPageQuery",
    "operationKind": "query",
    "text": "query LetterPageQuery(\n  $key: String!\n) {\n  letter(key: $key) {\n    id\n    key\n    number\n    variant\n    group\n    section {\n      key\n      chapter\n      title\n      id\n    }\n    pages {\n      id\n      page\n      order\n      original\n      image {\n        src\n        srcset\n      }\n    }\n    companions {\n      id\n      page\n      ext\n      original\n    }\n    transcription {\n      markdown\n      source\n    }\n    previous {\n      key\n      number\n      variant\n      id\n    }\n    next {\n      key\n      number\n      variant\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1271c0a69dd1867ade44060e5cb97663";

export default node;
