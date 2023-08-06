![view-source](./view-source.png)

# view-source

An Express.js middleware/handler to render source code.

## Usage

Install it via `npm i view-source` (or `yarn add view-source`). Then the following:

```js
const express = require('express');
const { viewSource } = require('view-source');

const app = express();

viewSource({
  appTitle: 'My App Name',
  app,
  route: '/code',
  source: __dirname + '/../'
});
```

Where `route` is the path from which you'll access the viewer and `source` is the actual physical place where the files are located.
