# Adding work to the Maller Art shop

A walkthrough for listing paintings and setting up prints and trinkets. Nothing here needs code.

## How the shop is split

| Section on the site | What it holds | Who makes and ships it | Where you work |
| --- | --- | --- | --- |
| **Paintings** | Your originals | You | Shopify |
| **Prints** | Giclée prints of the paintings | Prodigi | Prodigi, plus one switch in Shopify |
| **Trinkets** | Stickers, clothing, hats, bags, anything that isn't a painting or a print | Printful | Printful, plus a quick check in Shopify |

Logins:

- Shopify admin: https://mallerart.myshopify.com/admin
- Prodigi: https://dashboard.prodigi.com
- Printful: https://www.printful.com/dashboard

Aaron looks after the connections between these accounts, billing, shipping rates and order settings. If a screen doesn't match these steps, a button has probably moved; the vendor help pages at the end are where these steps come from.

---

## Part 1: Paintings

### 1a. Finish the nine placeholder listings

Nine paintings are already in Shopify as placeholders: Starstuff, Feather Bedfellows Study, Flaunt, Little King, Mask Man, Peering, The Bishop, Three Brothers and Tough Guy. Each one has a made-up price of $5,000, a weight of 10 lb, and a description that starts "Original painting, one of a kind" followed by a line marked *Placeholder listing*. Replace all of that with the real details.

For each painting:

1. In Shopify, go to **Products** and click the painting.
2. **Title**: the painting's name as you want it shown.
3. **Description**: delete both placeholder lines and write the real one. Useful things to include:
   - size in inches, width × height, and the framed size if it's framed
   - medium and surface (oil on canvas, watercolour on paper…)
   - year
   - framed, ready to hang, or unframed
   - signed, and where
   - a sentence or two about the piece
4. **Media** (the photos):
   - The **first** photo is the main one. It shows in the grid on the site and opens the gallery when someone clicks. Make it the whole painting, straight on, cropped to the edge of the canvas, in even light with no glare.
   - After that, add details: close-ups of texture and brushwork, the edges, the signature, the back, the painting on a wall for scale.
   - Drag photos to reorder them. Whatever is first becomes the main photo.
   - Size: at least 2048 pixels on the long side, because the site has a magnifier that zooms in on hover. Shopify's limit is 25 megapixels and 20 MB per photo. A 4000 × 5000 photo is 20 megapixels and fine; 6000 × 6000 is 36 megapixels and will be refused. JPEG, PNG, WEBP and HEIC all work.
   - **Alt text** on every photo: click the photo, click **Add alt text**, type a short description, then **Save alt text**. Describe what's in the picture in under 125 characters, for example *"Black cockatoo in oils, head turned over its shoulder, gold flecks across dark blue feathers"* or *"Detail of the eye and pale beak"*. Screen readers read this aloud to people who can't see the image.
5. **Price**: the real price. Leave the compare-at price empty.
6. **Inventory**: turn on **Track quantity** and set **Available** to **1**. Leave the out-of-stock setting on **Stop selling when out of stock**. That way each painting sells once and then shows as *Sold* on the site. Starstuff is already set up like this; the other eight aren't yet.
7. **Shipping**: the packed weight, meaning the painting plus its packaging. Weigh it boxed if you can.
8. **Product organization**: already filled in on these nine. It should read Type **Original**, Vendor **Maller Art**, Collections **Paintings**, Tags **original**. Leave it as it is.
9. **Search engine listing**: click the pencil and check the **URL handle** reads well, like `three-brothers`. Settle this once. After prints of a painting exist, don't change its handle, because the prints are tied to it.
10. **Publishing**: make sure **Headless** is in the list. Headless is the new site; a painting that isn't published there won't appear.
11. **Status**: set to **Active** once everything is real. **Draft** keeps it off the site.
12. Click **Save**.

If a painting is too large or fragile for a normal courier, tell Aaron before you set it to Active so its shipping can be arranged.

### 1b. Adding a new painting

The quickest way is to copy a finished painting, so the organisation fields come along:

1. In **Products**, open any finished painting.
2. Click **More actions**, then **Duplicate product**.
3. Type the new painting's title, choose **Draft** as the status, and click **Duplicate product**.
4. On the copy, delete the old photos, then work through steps 3 to 12 above: description, photos and alt text, price, quantity 1, weight, URL handle, Active, Save.
5. Check **Product organization** still reads Original / Maller Art / Paintings / original.

You can also start from **Products → Add product**. If you do, fill in the Product organization fields yourself: Type **Original**, Vendor **Maller Art**, Collections **Paintings**, Tags **original**.

If the new painting should have prints, add it to your prints list for Aaron (Part 2b).

---

## Part 2: Prints with Prodigi

**How it works.** For each painting you want to sell as prints, Aaron creates a listing in Shopify called "*Painting name* Print", with one option per size at the prices you choose and the painting's photos copied across. It arrives as a **Draft**, so nobody can buy it yet. You then tell Prodigi which paper and size each option is and give it the high-resolution file. When your sample looks right, you switch the listing to Active.

### 2a. Choose the paper (once)

1. Order Prodigi's fine art sample pack from your Prodigi account. It's £10 plus tax with free shipping, and it ships from their US facility. It has their bestselling papers printed with stock images, so you can compare paper side by side.
2. Look at the papers in daylight next to the originals. The ones worth comparing for paintings:
   - **Hahnemühle German Etching**, 310 gsm: velvety matte, textured, warm white
   - **Hahnemühle Photo Rag**, 308 gsm: smooth matte cotton with a light felt texture
   - **Cold press watercolour**, 315 gsm: matte cotton, strong texture
   - **Enhanced Matte Art**, 200 gsm: smooth matte, natural white, no optical brighteners; the budget option
3. Then order one real print of one of your paintings on your top two papers. Prodigi refunds half the cost of one sample per product type if you email the order number to support@prodigi.com.

### 2b. Choose sizes and prices for each painting

The print sizes have to match the painting's shape, or the print gets cropped. Divide the painting's width by its height and pick print sizes that give the same number:

- a 16 × 20 in painting is 0.8, so 8 × 10 and 16 × 20 keep the whole image
- a 12 × 18 in painting is 0.67, so 8 × 12, 12 × 18 and 20 × 30 keep it
- a square painting needs square sizes

Prodigi's dashboard shows its own price for each paper and size. Your price has to cover that plus shipping.

Send Aaron a list like this. He'll create the print listings from it.

| Painting | Paper | Size | Your price |
| --- | --- | --- | --- |
| Starstuff | Hahnemühle German Etching | 8 × 12 in | $ |
| Starstuff | Hahnemühle German Etching | 12 × 18 in | $ |
| Flaunt | … | … | $ |

### 2c. Prepare the print files

The print file is not the listing photo. It needs a high-resolution scan or photograph of the painting.

- **Resolution**: 300 DPI at the largest size you sell. For a 16 × 20 in print that's 4800 × 6000 pixels. For comparison, a photo 4000 pixels wide only covers about 13 inches at 300 DPI.
- **Colour**: RGB.
- **Format**: JPG is safest. Prodigi accepts JPG, PNG or PDF, but some papers only take JPG or PDF.
- One file usually covers every size of the same shape. Prodigi's uploader shows the exact pixel size each product wants, and warns you if a file is too small.
- Prodigi's product pages offer ICC profiles. They're meant for checking a proof against a real print, not for on-screen soft proofing.

### 2d. Set up the prints in Prodigi

When Aaron says the print listings are in Shopify, give it a few minutes; they can take up to an hour to show up in Prodigi.

1. Log in to Prodigi and click **Sales channels** in the left menu.
2. Click **Configure** on the Shopify store connection.
3. You'll see every product in the shop, including the paintings and any Printful items. Find "*Painting name* Print" and turn its **purple toggle** on. Leave everything else off; a grey product is one Prodigi won't make.
4. Click **Configure** on that print. Each size appears as a variant.
5. On the first size, click **Choose product**, search the catalogue, and pick your paper in that size. Answer any questions about finish. Then upload the print file and click **Save**.
6. Click the **three dots** on the right to copy that product and image to all the other sizes. Then, on each other size, click **Change product** and pick the matching size.
7. Click the **Shipping** tile and choose **Standard**. Budget is cheaper and slower, Express faster and dearer. It saves by itself.

### 2e. Check a sample, then go live

1. Order one finished print from your Prodigi account and check it against the painting.
2. When it's right, go to Shopify, open "*Painting name* Print", set **Status** to **Active**, and **Save**.

Two things to leave alone in Shopify on print listings:

- **Sizes and options.** Changing or deleting a size in Shopify can make Prodigi treat the listing as new and lose your setup. Ask Aaron instead.
- **The description.** It comes from one shared template so all prints read the same. Ask Aaron to change the wording and it changes for every print.

---

## Part 3: Trinkets with Printful

Trinkets is everything that isn't a painting or a print: stickers, shirts, hoodies, hats, totes and the rest.

### 3a. Prepare the artwork

- **PNG with a transparent background.** A JPG prints as a white box.
- **sRGB colour**, specifically the profile called *sRGB IEC61966-2.1*.
- **Resolution**: at least 150 DPI at the printed size. Stickers, phone cases and DTFlex products need 300 DPI. There's no gain above 300.
- **Avoid soft edges.** Semi-transparent edges, fades and drop shadows print unevenly on fabric.
- Every product in Printful's catalogue has a **File guidelines** tab with its print area and any special rules. Check it before you design.
- On blends and heather colours the fabric shows through the ink, which mutes colour. Plain 100% cotton gives the truest colour with DTG.

### 3b. DTG or DTFlex?

These are the two ways Printful prints a full-colour image on clothing.

| | **DTG** (direct to garment) | **DTFlex** (Printful's direct-to-film) |
| --- | --- | --- |
| How | Ink printed straight into the fabric | Image printed on film, then heat-pressed on top |
| Feel | Soft, almost no feel, breathes | Slightly thicker, a little raised, less breathable on big prints |
| Fabrics | 100% cotton | Cotton, polyester, fleece, nylon, blends, hats |
| Colour | Good, fine detail and gradients | The most vivid |
| Washing | Fades gradually over time | Holds colour longest; if it fails, edges crack or lift |
| Watch out for | Colours look duller on blends | Black on black fabric comes out dark grey |

When bright colour that lasts matters most, choose DTFlex. When the shirt is cotton and the soft feel matters most, choose DTG. DTFlex is only on some products; Printful's catalogue has a **DTFlex products** collection, including the Unisex Staple T-Shirt, Unisex Premium Hoodie and several caps. If you're unsure, sample the same design both ways.

### 3c. Make the product in Printful

1. In the Printful Dashboard, go to **Stores** and click **Add product**. Some accounts show **My products → Create product** instead. Choose the Maller Art store if asked.
2. Pick the product from the catalogue.
3. Click **Start designing** to open the Design Maker. Upload your file and position it.
4. Choose the colours and sizes to offer, then click **Proceed to mockups**.
5. Pick the mockups customers will see. Basic ones are plain backgrounds; custom ones are styled scenes.
6. **Product details**: Printful fills in a description. Add the painting's name and a line about it. A title pattern that keeps the shop tidy is *Painting name* plus the item, like "Flaunt Tee" or "Starstuff Sticker".
7. **Pricing**: Printful shows its cost and a suggested price. Set your retail price. Printful's cost doesn't include shipping or tax. Leave **Free shipping on my storefront** off unless you and Aaron have agreed otherwise, because shipping is charged in Shopify.
8. Click **Submit to store**.

### 3d. Finish it in Shopify

1. In Shopify, go to **Products** and open the new item.
2. **Status**: set it to **Draft** while you order a sample from Printful.
3. In **Product organization**, click the **+** next to **Collections** and choose **Trinkets**.
4. In **Publishing**, make sure **Headless** is in the list.
5. Click **Save**.
6. When the sample is right, set **Status** to **Active** and **Save**.

To add or remove colours or sizes later, do it in Printful, not in Shopify, so the two stay in step.

---

## Checklists

**A painting is ready when** it has real title, description, price and packed weight; the whole painting is the first photo; every photo has alt text; Track quantity is on with 1 available; it's in Paintings and published to Headless; and it's Active.

**A print is ready when** its paper and sizes are chosen; the print file is 300 DPI at the largest size; every size is set up in Prodigi with the toggle on and Standard shipping; a sample has passed; and it's Active in Shopify.

**A trinket is ready when** the artwork follows the file guidelines; it's priced in Printful and submitted; it's in Trinkets and published to Headless; a sample has passed; and it's Active in Shopify.

---

## If a button has moved

These are the vendor pages the steps above come from:

- Shopify: [adding and editing products](https://help.shopify.com/en/manual/products/add-update-products), [adding photos](https://help.shopify.com/en/manual/products/product-media/add-media), [alt text](https://help.shopify.com/en/manual/products/product-media/add-alt-text), [tracking quantity](https://help.shopify.com/en/manual/products/inventory/getting-started-with-inventory/set-up-inventory-tracking), [adding a product to a collection](https://help.shopify.com/en/manual/products/collections/manual-shopify-collection)
- Prodigi: [setting up Shopify products](https://www.prodigi.com/shopify-print-on-demand-app/support/configure-your-products/), [Shopify questions](https://www.prodigi.com/faq/shopify/), [paper guide](https://www.prodigi.com/blog/how-to-choose-the-best-fine-art-or-photography-paper-for-your-print/), [preparing wall art files](https://www.prodigi.com/blog/create-print-on-demand-wall-art/), [samples](https://www.prodigi.com/start/samples/)
- Printful: [adding products to a store](https://www.printful.com/blog/how-to-start-an-online-store-with-printful), [preparing a DTG file](https://www.printful.com/creating-dtg-file), [preparing a DTF file](https://www.printful.com/blog/preparing-dtf-print-file), [printing methods compared](https://www.printful.com/blog/types-of-shirt-printing)
