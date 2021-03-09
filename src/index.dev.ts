import './index';
// @ts-ignore
import Stats from 'stats.js';

function runStats() {
  const stats = new Stats();
  stats.dom.style.top = '50px';
  stats.dom.style.right = '20px';
  stats.dom.style.left = '';
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function runEditor() {
  const editor = document.createElement('erd-editor');
  document.body.appendChild(editor);

  window.addEventListener('resize', () => {
    editor.width = window.innerWidth;
  });

  window.dispatchEvent(new Event('resize'));
}

runStats();
runEditor();
