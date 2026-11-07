# Transcriptions

One Markdown file per letter, named by letter key: `440.md`, `441a.md`. The server loads the
folder at startup and the reader shows the text beside the scans as their accessible equivalent.

Text comes from the author's books, chapter by chapter: the letter, its translation and the
author's commentary, in that order, separated by blank lines. Keep the author's wording.

Machine-read text (a fallback for letters the books do not print) is marked so the reader can
say so:

```
---
source: ocr
---
Liebe Eltern, ...
```

Files that are not named after a letter, like this one, are ignored.
