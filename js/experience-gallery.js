// "Experiências médicas pelo mundo": the Circular Gallery (React Bits) with the institutions' photographs. The photo in
// focus drives the counter and the programme panel below; the arrows, a drag, the keyboard or a tap move it. Without
// WebGL 2 the section stays as the editorial list, every programme with its own photograph.
import { createCircularGallery, supportsCircularGallery } from './circular-gallery.js';
import { medicalExperiences } from './medical-experiences.js';

const pad = value => String(value).padStart(2, '0');

export function createMedicalExperiences(root) {
  const host = root.querySelector('[data-experience-gallery]');
  const panels = [...root.querySelectorAll('[data-experience-panel]')];
  const controls = root.querySelector('[data-experience-controls]');
  const counter = root.querySelector('[data-experience-counter]');
  const status = root.querySelector('[data-experience-status]');
  const noop = { update() {}, setVisible() {}, dispose() {} };
  if (!host || !medicalExperiences.length || !supportsCircularGallery()) {
    root.dataset.state = 'static';
    panels.forEach(panel => { panel.hidden = false; });
    host?.remove();
    return noop;
  }

  const count = medicalExperiences.length;
  let current = -1;
  const show = index => {
    if (index === current) return;
    current = index;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (counter) counter.textContent = `${pad(index + 1)} / ${pad(count)}`;
    if (status) status.textContent = `${medicalExperiences[index].name}, ${index + 1} de ${count}`;
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mount = document.createElement('div');
  host.replaceChildren(mount);
  const gallery = createCircularGallery(mount, {
    items: medicalExperiences.map(item => ({ image: item.image, text: item.shortName, description: item.photoCaption, alt: item.imageAlt })),
    bend: 3,
    textColor: '#f3eee6',
    borderRadius: 0.05,
    font: '400 30px Roobert, Geist, Arial, sans-serif',
    itemAspect: 0.78,
    gap: 0.26,
    wave: 1,
    fadeEdges: 0.12,
    shadow: 0.25,
    scrollSpeed: 2,
    scrollEase: 0.05,
    autoScroll: reduced ? 0 : 0.35,
    label: 'Experiências médicas pelo mundo',
    closeLabel: 'Fechar a foto',
    onActiveChange: show,
  });
  // On a narrow screen the cards are smaller, so two and a part of the third are in view.
  const narrow = matchMedia('(max-width: 700px)');
  const fit = () => gallery?.set({ itemSize: narrow.matches ? 0.8 : 1 });
  if (!gallery) {
    root.dataset.state = 'static';
    panels.forEach(panel => { panel.hidden = false; });
    host.remove();
    return noop;
  }

  fit();
  narrow.addEventListener?.('change', fit);
  root.dataset.state = 'interactive';
  root.dataset.renderMode = 'gallery';
  show(0);
  if (controls) controls.hidden = false;
  const prev = root.querySelector('[data-experience-prev]');
  const next = root.querySelector('[data-experience-next]');
  const back = () => gallery.step(-1);
  const forward = () => gallery.step(1);
  prev?.addEventListener('click', back);
  next?.addEventListener('click', forward);

  return {
    update() {},
    setVisible(visible) { if (visible) gallery.wake(); },
    dispose() {
      prev?.removeEventListener('click', back);
      next?.removeEventListener('click', forward);
      narrow.removeEventListener?.('change', fit);
      gallery.dispose();
    },
  };
}
