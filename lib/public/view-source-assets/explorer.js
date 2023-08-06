window.addEventListener('load', () => {
  const tree = JSON.parse(JSON.stringify(TREE));

  function renderTreeItem(item) {
    const icon = item.type === 'directory' ?
      item.open ? 'folder.svg' : 'folder-plus.svg' :
      'file-text.svg';
    const action = item.type === 'directory' ?
      `changeOpenFlag('${item.path}', ${!item.open})` :
      `openFile('${item.path}')`;
    return `
      <div style="padding-left:1em;text-wrap:nowrap;">
        <a href="javascript:${action}">
          <img src="/view-source-assets/${icon}" width="18" style="transform:translateY(3px);" /> ${item.name}
        </a>
        ${item.open ? item.children.map(i => renderTreeItem(i)).join('') : ''}
      </div>
    `;
  }
  function renderTree() {
    document.querySelector('#tree').innerHTML = `
      <div class="fz08">
        ${renderTreeItem(tree)}
      </div>
    `
  }
  function renderCode(code, ext = 'js') {
    document.querySelector('#code').innerHTML = `
    <pre><code class="language-${ext} fz08">${encodeHTMLTags(code)}</code></pre>
    `;
    setTimeout(() => Prism.highlightAll(), 10);
  }
  function renderPath(text) {
    document.querySelector('#path').innerHTML = '⇢ ' + text;
  }
  function findItem(treeItem, itemPath) {
    if (treeItem.path === itemPath) {
      return treeItem;
    } else {
      for (let i = 0; i < (treeItem.children || []).length; i++) {
        const item = findItem(treeItem.children[i], itemPath);
        if (item) {
          return item;
        }
      }
    }
  }
  function encodeHTMLTags(code) {
    return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  window.changeOpenFlag = (itemPath, value) => {
    const item = findItem(tree, itemPath);
    if (item) {
      item.open = value;
    } else {
      console.error(`Item ${itemPath} not found!`);
    }
    renderTree();
  }
  window.openFile = async (itemPath) => {
    const ext = itemPath.split('.').pop().toLowerCase();
    renderPath(itemPath);
    renderCode(`Loading ${itemPath} ...`, ext);
    const res = await fetch(ROUTE + itemPath);
    const code = await res.text();
    renderCode(code, ext);
  }

  tree.open = true;
  renderTree();
  renderCode(`// ${NAME} project`)
});