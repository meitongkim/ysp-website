(function(){
  var nav=document.querySelector('.nav-wrap .nav')||document.querySelector('nav.nav');
  if(!nav||nav.querySelector('.mnav-btn'))return;
  var links=nav.querySelector('.nav-links');if(!links)return;
  var cta=nav.querySelector(':scope > a.btn');
  var css=document.createElement('style');
  css.textContent='.mnav-btn{display:none;align-items:center;justify-content:center;gap:8px;min-width:44px;height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(31,42,34,.14);background:rgba(255,255,255,.85);color:#1f2a22;font:500 14px/1 Inter,system-ui,sans-serif;cursor:pointer;flex-shrink:0}'+
  '.mnav-btn .bars{position:relative;width:18px;height:12px}.mnav-btn .bars i{position:absolute;left:0;right:0;height:1.6px;border-radius:2px;background:currentColor;transition:transform .3s,opacity .2s,top .3s}.mnav-btn .bars i:nth-child(1){top:0}.mnav-btn .bars i:nth-child(2){top:5px}.mnav-btn .bars i:nth-child(3){top:10px}'+
  '.mnav-open .mnav-btn .bars i:nth-child(1){top:5px;transform:rotate(45deg)}.mnav-open .mnav-btn .bars i:nth-child(2){opacity:0}.mnav-open .mnav-btn .bars i:nth-child(3){top:5px;transform:rotate(-45deg)}'+
  '.mnav-panel{position:fixed;left:12px;right:12px;top:78px;z-index:1000;background:rgba(251,253,250,.98);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(31,42,34,.1);border-radius:22px;box-shadow:0 30px 70px -24px rgba(31,42,34,.35);padding:10px;display:flex;flex-direction:column;gap:2px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .25s,transform .25s;max-height:calc(100vh - 100px);overflow:auto}'+
  '.mnav-open .mnav-panel{opacity:1;transform:none;pointer-events:auto}'+
  '.mnav-panel a{display:flex;align-items:center;justify-content:space-between;min-height:52px;padding:0 18px;border-radius:14px;color:#1f2a22;font:400 22px/1.1 Fraunces,Georgia,serif;letter-spacing:-.01em;text-decoration:none}.mnav-panel a:hover,.mnav-panel a.active{background:rgba(137,163,108,.14)}.mnav-panel a::after{content:"\u2192";font:400 16px Inter,system-ui,sans-serif;color:#89a36c}'+
  '.mnav-panel a.mnav-cta{margin-top:8px;background:#1f2a22;color:#fbfdfa;font:500 15px/1 Inter,system-ui,sans-serif;justify-content:center;gap:8px}.mnav-panel a.mnav-cta::after{content:"\u2197";color:#b9c99e}'+
  '.mnav-scrim{position:fixed;inset:0;z-index:999;background:rgba(31,42,34,.18);opacity:0;pointer-events:none;transition:opacity .25s}.mnav-open .mnav-scrim{opacity:1;pointer-events:auto}'+
  '@media (max-width:1024px){.nav .nav-links{display:none!important}.nav > a.btn{display:none!important}.mnav-btn{display:inline-flex}}'+
  '@media (min-width:1025px){.mnav-panel,.mnav-scrim{display:none}}';
  document.head.appendChild(css);
  var btn=document.createElement('button');btn.type='button';btn.className='mnav-btn';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','mnavPanel');btn.setAttribute('aria-label','Open menu');
  btn.innerHTML='<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span>';
  nav.appendChild(btn);
  var panel=document.createElement('div');panel.className='mnav-panel';panel.id='mnavPanel';
  var home=document.createElement('a');home.href='/';home.textContent='Home';panel.appendChild(home);
  links.querySelectorAll('a').forEach(function(a){var c=a.cloneNode(true);c.removeAttribute('data-om-id');panel.appendChild(c)});
  if(cta){var c=document.createElement('a');c.href=cta.getAttribute('href');if(cta.target)c.target=cta.target;c.rel='noopener noreferrer';c.className='mnav-cta';c.textContent=cta.textContent.replace(/[\u2197\u2192\u25b8]/g,'').trim();panel.appendChild(c)}
  var scrim=document.createElement('div');scrim.className='mnav-scrim';
  document.body.appendChild(scrim);document.body.appendChild(panel);
  function set(open){document.documentElement.classList.toggle('mnav-open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Close menu':'Open menu');btn.lastChild.textContent=open?'Close':'Menu'}
  btn.addEventListener('click',function(){set(!document.documentElement.classList.contains('mnav-open'))});
  scrim.addEventListener('click',function(){set(false)});
  panel.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>1024)set(false)});
})();
