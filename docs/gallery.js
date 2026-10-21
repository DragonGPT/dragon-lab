'use strict';
// The initial project remains usable if the manifest cannot load.
(async () => {
  const list = document.querySelector('#project-list');
  const filters = document.querySelector('#filters');
  const status = document.querySelector('#result-status');
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error('Manifest unavailable');
    const projects = await response.json();
    if (!Array.isArray(projects) || !projects.length || projects.some(p => !p.title || !p.category || !/^projects\/[a-z0-9-]+\/$/.test(p.url) || !Array.isArray(p.features))) throw new Error('Invalid manifest');
    const categories = ['全部作品', ...new Set(projects.map(p => p.category))];
    function render(category) {
      const selected = projects.filter(p => category === '全部作品' || p.category === category);
      list.replaceChildren(...selected.map(p => {
        const card = el('article', null, 'project-card');
        const visual = el('div', null, 'project-visual');
        visual.setAttribute('aria-hidden', 'true');
        visual.append(el('span', p.number + ' / ' + (p.id === 'relax' ? 'A LITTLE PAUSE' : 'LITTLE EXPERIMENT'), 'project-number'));
        const preview = el('div', null, 'breath-preview');
        if (p.id === 'relax') preview.append(el('span', '轻轻吸气'), el('strong', '00:30'), el('small', '把半分钟还给自己'));
        else preview.append(el('strong', '✧'), el('small', p.title));
        visual.append(preview, el('span', p.id === 'relax' ? '不催促，不打分。' : '一个认真做的小作品', 'visual-foot'));
        const body = el('div', null, 'project-body');
        const categoryText = el('p', p.category, 'project-category');
        categoryText.append(el('span', '现在可以体验'));
        const tags = el('ul', null, 'tags');
        tags.setAttribute('aria-label', '作品功能');
        p.features.forEach(feature => tags.append(el('li', feature)));
        const link = el('a', '立即体验 ↗', 'button primary');
        link.href = p.url;
        link.setAttribute('aria-label', '立即体验' + p.title);
        body.append(categoryText, el('h3', p.title), el('p', p.description, 'project-description'), tags, link, el('p', p.tip, 'project-tip'));
        card.append(visual, body);
        return card;
      }));
      for (const button of filters.children) button.setAttribute('aria-pressed', String(button.textContent === category));
      status.textContent = category + '，共 ' + selected.length + ' 个作品';
    }
    categories.forEach(category => {
      const button = el('button', category);
      button.type = 'button';
      button.addEventListener('click', () => render(category));
      filters.append(button);
    });
    render('全部作品');
    filters.hidden = false;
  } catch {
    // Static fallback deliberately stays visible, without a blocking error.
  }
})();
