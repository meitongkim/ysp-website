/* YSP Winter MUN 2026 — shared subpage behaviour */
(function(){
  // Nav scrolled state
  const navWrap = document.getElementById('navWrap');
  if (navWrap){
    let last = -1;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || 0;
      if (y === last) return; last = y;
      if (y > 40) navWrap.classList.add('scrolled'); else navWrap.classList.remove('scrolled');
    }, { passive:true });
  }
  // Reveal observer
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold:0.1, rootMargin:'0px 0px -6% 0px' });
  document.querySelectorAll('.apple-reveal').forEach(el => io.observe(el));
})();
