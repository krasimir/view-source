const fs = require('fs');
const path = require('path');
const express = require('express');

const defaultAppTitle = 'App';

function viewSource({ app, route, source, appTitle }) {
  app.use(express.static(__dirname + '/lib/public', { maxAge: 604800000 }));
  app.use(path.join('/' + route, '@'), express.static(path.normalize(source), { maxAge: 604800000 }));

  const ROOT_DIR = path.normalize(source);

  function buildTree() {
    const root = {
      name: appTitle || defaultAppTitle,
      path: path.normalize(route),
      type: 'directory',
      children: []
    };

    function traverseDirectory(dirPath, parentNode) {
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        const node = {
          name: file,
          path: filePath.replace(ROOT_DIR, ''),
          type: stats.isDirectory() ? 'directory' : 'file',
          children: []
        };

        if (stats.isDirectory()) {
          traverseDirectory(filePath, node);
        }

        parentNode.children.push(node);
      });
    }

    traverseDirectory(ROOT_DIR, root);

    return root;
  }

  const content = buildTree(route, path.normalize(source));

  app.get(route, (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(page(
      `
      <script>
        const TREE = ${JSON.stringify(content)};
        const NAME = "${appTitle || defaultAppTitle}";
        const ROUTE = "${route}/@/";
      </script>
      <script src="/view-source-assets/explorer.js"></script>
      `,
      `
      <div class="max1600 px1 my3 mxauto">
        <div class="grid grid300x1fr gap1">
          <div id="tree"></div>
          <div>
            <p id="path"></p>
            <div id="code" class="overflowXScroll"></div>
          </div>
        </div>
      </div>
      `
    ))
  });
}

function page(head = '', content = '') {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${head}
        <link rel="stylesheet" href="/view-source-assets/prism.css" />
        <script src="/view-source-assets/prism.js"></script>
        <style>
          body {
            width: 100%;
            heigth: 100%;
            margin: 0;
            padding: 0;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 16px;
          }
          code[class*=language-], pre[class*=language-] {
            font-size: 1em !important;
            line-height: 1.4em !important;
          }
          .max1600 { max-width: 1600px; }
          .px1 { padding: 0 1rem; }
          .my3 { margin-top: 3rem; margin-bottom: 3rem; }
          .mxauto { margin-left: auto; margin-right: auto; }
          .grid { display: grid; }
          .grid300x1fr { grid-template-columns: 300px 1fr; }
          .gap1 { gap: 1rem; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

module.exports = {
  viewSource
}