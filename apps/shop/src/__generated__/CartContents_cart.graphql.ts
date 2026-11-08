/**
 * @generated SignedSource<<fef0ca3a44bb8aeca314e9ff2d66b877>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type CurrencyCode = "AED" | "AFN" | "ALL" | "AMD" | "ANG" | "AOA" | "ARS" | "AUD" | "AWG" | "AZN" | "BAM" | "BBD" | "BDT" | "BGN" | "BHD" | "BIF" | "BMD" | "BND" | "BOB" | "BRL" | "BSD" | "BTN" | "BWP" | "BYN" | "BYR" | "BZD" | "CAD" | "CDF" | "CHF" | "CLP" | "CNY" | "COP" | "CRC" | "CVE" | "CZK" | "DJF" | "DKK" | "DOP" | "DZD" | "EGP" | "ERN" | "ETB" | "EUR" | "FJD" | "FKP" | "GBP" | "GEL" | "GHS" | "GIP" | "GMD" | "GNF" | "GTQ" | "GYD" | "HKD" | "HNL" | "HRK" | "HTG" | "HUF" | "IDR" | "ILS" | "INR" | "IQD" | "IRR" | "ISK" | "JEP" | "JMD" | "JOD" | "JPY" | "KES" | "KGS" | "KHR" | "KID" | "KMF" | "KRW" | "KWD" | "KYD" | "KZT" | "LAK" | "LBP" | "LKR" | "LRD" | "LSL" | "LTL" | "LVL" | "LYD" | "MAD" | "MDL" | "MGA" | "MKD" | "MMK" | "MNT" | "MOP" | "MRU" | "MUR" | "MVR" | "MWK" | "MXN" | "MYR" | "MZN" | "NAD" | "NGN" | "NIO" | "NOK" | "NPR" | "NZD" | "OMR" | "PAB" | "PEN" | "PGK" | "PHP" | "PKR" | "PLN" | "PYG" | "QAR" | "RON" | "RSD" | "RUB" | "RWF" | "SAR" | "SBD" | "SCR" | "SDG" | "SEK" | "SGD" | "SHP" | "SLL" | "SOS" | "SRD" | "SSP" | "STD" | "STN" | "SYP" | "SZL" | "THB" | "TJS" | "TMT" | "TND" | "TOP" | "TRY" | "TTD" | "TWD" | "TZS" | "UAH" | "UGX" | "USD" | "UYU" | "UZS" | "VED" | "VEF" | "VES" | "VND" | "VUV" | "WST" | "XAF" | "XCD" | "XCG" | "XOF" | "XPF" | "XXX" | "YER" | "ZAR" | "ZMW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type CartContents_cart$data = {
  readonly checkoutUrl: any;
  readonly cost: {
    readonly subtotalAmount: {
      readonly amount: any;
      readonly currencyCode: CurrencyCode;
    };
  };
  readonly id: string;
  readonly lines: {
    readonly nodes: ReadonlyArray<{
      readonly cost: {
        readonly totalAmount: {
          readonly amount: any;
          readonly currencyCode: CurrencyCode;
        };
      };
      readonly id: string;
      readonly merchandise: {
        readonly id?: string;
        readonly image?: {
          readonly altText: string | null | undefined;
          readonly height: number | null | undefined;
          readonly url: any;
          readonly width: number | null | undefined;
        } | null | undefined;
        readonly product?: {
          readonly handle: string;
          readonly title: string;
        };
        readonly selectedOptions?: ReadonlyArray<{
          readonly name: string;
          readonly value: string;
        }>;
        readonly title?: string;
      };
      readonly quantity: number;
    }>;
  };
  readonly totalQuantity: number;
  readonly " $fragmentType": "CartContents_cart";
};
export type CartContents_cart$key = {
  readonly " $data"?: CartContents_cart$data;
  readonly " $fragmentSpreads": FragmentRefs<"CartContents_cart">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CartContents_cart",
  "selections": [
    (v0/*:: as any*/),
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
          "selections": (v1/*:: as any*/),
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
            (v0/*:: as any*/),
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
                  "selections": (v1/*:: as any*/),
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
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v0/*:: as any*/),
                    (v2/*:: as any*/),
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
                        }
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
  "type": "Cart",
  "abstractKey": null
};
})();

(node as any).hash = "7a2cc6571972a3788d8bea3d6158a004";

export default node;
