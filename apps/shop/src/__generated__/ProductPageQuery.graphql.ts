/**
 * @generated SignedSource<<7f8928ada3038200f11581dd3b420aae>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CurrencyCode = "AED" | "AFN" | "ALL" | "AMD" | "ANG" | "AOA" | "ARS" | "AUD" | "AWG" | "AZN" | "BAM" | "BBD" | "BDT" | "BGN" | "BHD" | "BIF" | "BMD" | "BND" | "BOB" | "BRL" | "BSD" | "BTN" | "BWP" | "BYN" | "BYR" | "BZD" | "CAD" | "CDF" | "CHF" | "CLP" | "CNY" | "COP" | "CRC" | "CVE" | "CZK" | "DJF" | "DKK" | "DOP" | "DZD" | "EGP" | "ERN" | "ETB" | "EUR" | "FJD" | "FKP" | "GBP" | "GEL" | "GHS" | "GIP" | "GMD" | "GNF" | "GTQ" | "GYD" | "HKD" | "HNL" | "HRK" | "HTG" | "HUF" | "IDR" | "ILS" | "INR" | "IQD" | "IRR" | "ISK" | "JEP" | "JMD" | "JOD" | "JPY" | "KES" | "KGS" | "KHR" | "KID" | "KMF" | "KRW" | "KWD" | "KYD" | "KZT" | "LAK" | "LBP" | "LKR" | "LRD" | "LSL" | "LTL" | "LVL" | "LYD" | "MAD" | "MDL" | "MGA" | "MKD" | "MMK" | "MNT" | "MOP" | "MRU" | "MUR" | "MVR" | "MWK" | "MXN" | "MYR" | "MZN" | "NAD" | "NGN" | "NIO" | "NOK" | "NPR" | "NZD" | "OMR" | "PAB" | "PEN" | "PGK" | "PHP" | "PKR" | "PLN" | "PYG" | "QAR" | "RON" | "RSD" | "RUB" | "RWF" | "SAR" | "SBD" | "SCR" | "SDG" | "SEK" | "SGD" | "SHP" | "SLL" | "SOS" | "SRD" | "SSP" | "STD" | "STN" | "SYP" | "SZL" | "THB" | "TJS" | "TMT" | "TND" | "TOP" | "TRY" | "TTD" | "TWD" | "TZS" | "UAH" | "UGX" | "USD" | "UYU" | "UZS" | "VED" | "VEF" | "VES" | "VND" | "VUV" | "WST" | "XAF" | "XCD" | "XCG" | "XOF" | "XPF" | "XXX" | "YER" | "ZAR" | "ZMW" | "%future added value";
export type ProductPageQuery$variables = {
  handle: string;
};
export type ProductPageQuery$data = {
  readonly product: {
    readonly availableForSale: boolean;
    readonly collections: {
      readonly nodes: ReadonlyArray<{
        readonly handle: string;
        readonly title: string;
      }>;
    };
    readonly descriptionHtml: any;
    readonly handle: string;
    readonly id: string;
    readonly images: {
      readonly nodes: ReadonlyArray<{
        readonly altText: string | null | undefined;
        readonly height: number | null | undefined;
        readonly url: any;
        readonly width: number | null | undefined;
      }>;
    };
    readonly options: ReadonlyArray<{
      readonly name: string;
      readonly optionValues: ReadonlyArray<{
        readonly name: string;
      }>;
    }>;
    readonly title: string;
    readonly variants: {
      readonly nodes: ReadonlyArray<{
        readonly availableForSale: boolean;
        readonly compareAtPrice: {
          readonly amount: any;
          readonly currencyCode: CurrencyCode;
        } | null | undefined;
        readonly id: string;
        readonly image: {
          readonly url: any;
        } | null | undefined;
        readonly price: {
          readonly amount: any;
          readonly currencyCode: CurrencyCode;
        };
        readonly selectedOptions: ReadonlyArray<{
          readonly name: string;
          readonly value: string;
        }>;
        readonly title: string;
      }>;
    };
    readonly vendor: string;
  } | null | undefined;
};
export type ProductPageQuery = {
  response: ProductPageQuery$data;
  variables: ProductPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "handle"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "handle",
    "variableName": "handle"
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
  "name": "vendor",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "descriptionHtml",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "availableForSale",
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v9 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "altText",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "width",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "height",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v15 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v16 = [
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
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "MoneyV2",
  "kind": "LinkedField",
  "name": "price",
  "plural": false,
  "selections": (v16/*:: as any*/),
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "MoneyV2",
  "kind": "LinkedField",
  "name": "compareAtPrice",
  "plural": false,
  "selections": (v16/*:: as any*/),
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": "SelectedOption",
  "kind": "LinkedField",
  "name": "selectedOptions",
  "plural": true,
  "selections": [
    (v14/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProductPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Product",
        "kind": "LinkedField",
        "name": "product",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": (v8/*:: as any*/),
            "concreteType": "CollectionConnection",
            "kind": "LinkedField",
            "name": "collections",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Collection",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v3/*:: as any*/),
                  (v4/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "collections(first:1)"
          },
          {
            "alias": null,
            "args": (v9/*:: as any*/),
            "concreteType": "ImageConnection",
            "kind": "LinkedField",
            "name": "images",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v10/*:: as any*/),
                  (v11/*:: as any*/),
                  (v12/*:: as any*/),
                  (v13/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "images(first:10)"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProductOption",
            "kind": "LinkedField",
            "name": "options",
            "plural": true,
            "selections": [
              (v14/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProductOptionValue",
                "kind": "LinkedField",
                "name": "optionValues",
                "plural": true,
                "selections": [
                  (v14/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v15/*:: as any*/),
            "concreteType": "ProductVariantConnection",
            "kind": "LinkedField",
            "name": "variants",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProductVariant",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v2/*:: as any*/),
                  (v4/*:: as any*/),
                  (v7/*:: as any*/),
                  (v17/*:: as any*/),
                  (v18/*:: as any*/),
                  (v19/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Image",
                    "kind": "LinkedField",
                    "name": "image",
                    "plural": false,
                    "selections": [
                      (v10/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "variants(first:100)"
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
    "name": "ProductPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "Product",
        "kind": "LinkedField",
        "name": "product",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": (v8/*:: as any*/),
            "concreteType": "CollectionConnection",
            "kind": "LinkedField",
            "name": "collections",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Collection",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v3/*:: as any*/),
                  (v4/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "collections(first:1)"
          },
          {
            "alias": null,
            "args": (v9/*:: as any*/),
            "concreteType": "ImageConnection",
            "kind": "LinkedField",
            "name": "images",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v10/*:: as any*/),
                  (v11/*:: as any*/),
                  (v12/*:: as any*/),
                  (v13/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "images(first:10)"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProductOption",
            "kind": "LinkedField",
            "name": "options",
            "plural": true,
            "selections": [
              (v14/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ProductOptionValue",
                "kind": "LinkedField",
                "name": "optionValues",
                "plural": true,
                "selections": [
                  (v14/*:: as any*/),
                  (v2/*:: as any*/)
                ],
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v15/*:: as any*/),
            "concreteType": "ProductVariantConnection",
            "kind": "LinkedField",
            "name": "variants",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProductVariant",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v2/*:: as any*/),
                  (v4/*:: as any*/),
                  (v7/*:: as any*/),
                  (v17/*:: as any*/),
                  (v18/*:: as any*/),
                  (v19/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Image",
                    "kind": "LinkedField",
                    "name": "image",
                    "plural": false,
                    "selections": [
                      (v10/*:: as any*/),
                      (v2/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "variants(first:100)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "390f69857232c5b0f39a36597eab9f7b",
    "id": null,
    "metadata": {},
    "name": "ProductPageQuery",
    "operationKind": "query",
    "text": "query ProductPageQuery(\n  $handle: String!\n) {\n  product(handle: $handle) {\n    id\n    handle\n    title\n    vendor\n    descriptionHtml\n    availableForSale\n    collections(first: 1) {\n      nodes {\n        handle\n        title\n        id\n      }\n    }\n    images(first: 10) {\n      nodes {\n        url\n        altText\n        width\n        height\n        id\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n        id\n      }\n      id\n    }\n    variants(first: 100) {\n      nodes {\n        id\n        title\n        availableForSale\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        image {\n          url\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fac1376545256a445c783112d17f3cc3";

export default node;
