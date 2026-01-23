function attachFloatingInfoGlow(){
  const panels = document.querySelectorAll('.floatingInfo');
  panels.forEach(panel => {
    const updatePosition = (event) => {
      const rect = panel.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      panel.style.setProperty('--glow-x', `${x}%`);
      panel.style.setProperty('--glow-y', `${y}%`);
    };

    const activate = () => panel.classList.add('glow-active');
    const deactivate = () => panel.classList.remove('glow-active');

    panel.addEventListener('pointermove', updatePosition);
    panel.addEventListener('pointerenter', activate);
    panel.addEventListener('pointerleave', deactivate);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachFloatingInfoGlow);
} else {
  attachFloatingInfoGlow();
}
