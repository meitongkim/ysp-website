/* ───────────────────────────────────────────────
   YSP Substack — Discussion forum
   Self-contained community comments with account
   creation. Persists to localStorage (no backend).
   Usage: YSPForum.mount(slug, mountElement, { title })
   ─────────────────────────────────────────────── */
(function () {
  const LS_ACC = 'ysp_forum_accounts';
  const LS_SES = 'ysp_forum_session';
  const cKey = (slug) => 'ysp_forum_comments::' + slug;

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = (s) => (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
  function hash(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16); }
  function rel(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 45) return 'just now';
    const m = s / 60; if (m < 60) return Math.floor(m) + ' min ago';
    const h = m / 60; if (h < 24) return Math.floor(h) + ' hr ago';
    const d = h / 24; if (d < 7) return Math.floor(d) + ' d ago';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ---- one-time styles ----
  function injectStyles() {
    if (document.getElementById('ysp-forum-css')) return;
    const css = `
    .disc{ max-width:720px; margin:48px auto 0; padding:0 24px }
    .disc-head{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1px solid var(--line) }
    .disc-head h3{ font-family:"Fraunces",serif; font-weight:400; font-size:26px; letter-spacing:-.02em; margin:0; color:var(--ink) }
    .disc-head .count{ font-size:13px; color:var(--ink-mute); background:#f3f8ef; border:1px solid var(--line); padding:3px 11px; border-radius:999px }
    .disc-head .acct{ margin-left:auto; display:flex; align-items:center; gap:10px; font-size:13px; color:var(--ink-mute) }
    .disc-head .acct b{ color:var(--ink); font-weight:500 }
    .disc-link{ color:var(--ink); font-weight:500; cursor:pointer; text-decoration:underline; text-decoration-color:var(--substack); text-underline-offset:3px; background:none; border:0; font:inherit; padding:0 }
    .disc-link:hover{ color:var(--sage-deep) }

    .disc-compose{ display:flex; gap:14px; margin:22px 0 8px; align-items:flex-start; position:relative }
    .disc-av{ width:42px; height:42px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:14px; color:#fff; background:linear-gradient(140deg,var(--sage),var(--sage-deep)); letter-spacing:.02em }
    .disc-compose .field{ flex:1 }
    .disc-compose textarea{ width:100%; min-height:84px; resize:vertical; border:1px solid var(--line); border-radius:14px; padding:13px 15px; font:inherit; font-size:15px; line-height:1.5; color:var(--ink); background:#fff; transition:border-color .2s, box-shadow .2s }
    .disc-compose textarea:focus{ outline:none; border-color:var(--sage-deep); box-shadow:0 0 0 3px rgba(137,163,108,.16) }
    .disc-compose .row{ display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:12px }
    .disc-compose .hint{ font-size:12.5px; color:var(--ink-mute) }
    .disc-btn{ display:inline-flex; align-items:center; gap:7px; padding:10px 18px; border-radius:999px; font-size:13.5px; font-weight:500; cursor:pointer; border:0; transition:filter .2s, background .2s, transform .2s }
    .disc-btn[disabled]{ opacity:.5; cursor:not-allowed }
    .disc-btn-primary{ background:var(--substack); color:#fff }
    .disc-btn-primary:not([disabled]):hover{ filter:brightness(1.05) }
    .disc-btn-ghost{ background:#fff; border:1px solid var(--line); color:var(--ink) }
    .disc-btn-ghost:hover{ background:#f3f8ef }

    .disc-gate{ display:flex; gap:14px; align-items:center; flex-wrap:wrap; justify-content:space-between; margin:22px 0 8px; padding:20px 22px; border:1px dashed var(--line); border-radius:16px; background:rgba(255,255,255,.6) }
    .disc-gate p{ margin:0; font-size:14.5px; color:var(--ink-soft); max-width:42ch; line-height:1.5 }
    .disc-gate p b{ color:var(--ink); font-weight:600 }
    .disc-gate .g-actions{ display:flex; gap:10px }

    .disc-list{ margin-top:26px; display:flex; flex-direction:column; gap:20px }
    .disc-empty{ text-align:center; color:var(--ink-mute); padding:34px 20px; border:1px dashed var(--line); border-radius:16px; font-size:14.5px }
    .disc-item{ display:flex; gap:14px }
    .disc-item .body{ flex:1; min-width:0 }
    .disc-item .meta{ display:flex; align-items:center; gap:9px; margin-bottom:4px; flex-wrap:wrap }
    .disc-item .meta .who{ font-weight:600; font-size:14px; color:var(--ink) }
    .disc-item .meta .when{ font-size:12px; color:var(--ink-mute) }
    .disc-item .meta .mine{ font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--sage-deep); background:#eef4e7; border-radius:999px; padding:2px 8px }
    .disc-item .text{ font-size:15px; line-height:1.6; color:var(--ink-soft); white-space:pre-wrap; word-wrap:break-word }
    .disc-item .actions{ display:flex; gap:14px; margin-top:8px }
    .disc-item .act{ background:none; border:0; cursor:pointer; font:inherit; font-size:12.5px; color:var(--ink-mute); display:inline-flex; align-items:center; gap:5px; padding:0 }
    .disc-item .act:hover{ color:var(--ink) }
    .disc-item .act.liked{ color:var(--substack) }

    /* modal */
    .disc-modal{ position:fixed; inset:0; z-index:500; display:none; align-items:center; justify-content:center; padding:24px; background:rgba(15,22,18,.42); backdrop-filter:blur(4px) }
    .disc-modal.open{ display:flex }
    .disc-card{ width:100%; max-width:420px; background:#fff; border-radius:22px; box-shadow:0 30px 80px -20px rgba(31,42,34,.5); overflow:hidden; animation:discpop .28s cubic-bezier(.2,.7,.2,1) }
    @keyframes discpop{ from{ opacity:0; transform:translateY(14px) scale(.98) } to{ opacity:1; transform:none } }
    .disc-card .top{ padding:24px 26px 0 }
    .disc-tabs{ display:flex; gap:4px; background:#f3f8ef; border-radius:999px; padding:4px; margin-bottom:20px }
    .disc-tabs button{ flex:1; padding:9px; border-radius:999px; border:0; background:none; font:inherit; font-size:13.5px; font-weight:500; color:var(--ink-mute); cursor:pointer }
    .disc-tabs button.on{ background:#fff; color:var(--ink); box-shadow:0 1px 3px rgba(31,42,34,.12) }
    .disc-card h4{ font-family:"Fraunces",serif; font-weight:400; font-size:24px; margin:0 0 6px; letter-spacing:-.01em }
    .disc-card .sub{ font-size:13.5px; color:var(--ink-mute); margin:0 0 18px; line-height:1.5 }
    .disc-card .form{ padding:0 26px 8px; display:flex; flex-direction:column; gap:13px }
    .disc-card label{ display:block; font-size:11.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-mute); margin-bottom:6px }
    .disc-card input{ width:100%; border:1px solid var(--line); border-radius:11px; padding:11px 13px; font:inherit; font-size:15px; color:var(--ink) }
    .disc-card input:focus{ outline:none; border-color:var(--sage-deep); box-shadow:0 0 0 3px rgba(137,163,108,.16) }
    .disc-err{ font-size:13px; color:#b3402e; margin:2px 0 0; min-height:1px }
    .disc-card .foot{ padding:18px 26px 26px; display:flex; gap:10px; align-items:center }
    .disc-card .foot .disc-btn{ flex:1; justify-content:center }
    .disc-x{ position:absolute; top:18px; right:20px; width:30px; height:30px; border-radius:50%; border:0; background:#f3f8ef; color:var(--ink-mute); cursor:pointer; font-size:16px; line-height:1 }
    .disc-x:hover{ background:#e7efe0; color:var(--ink) }
    .disc-note{ padding:0 26px 22px; font-size:11.5px; color:var(--ink-mute); line-height:1.5 }
    @media (max-width:560px){ .disc-head .acct{ width:100%; margin-left:0 } }
    `;
    const s = document.createElement('style');
    s.id = 'ysp-forum-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function getUser() {
    const email = load(LS_SES, null);
    if (!email) return null;
    const accs = load(LS_ACC, {});
    return accs[email] ? { email, name: accs[email].name } : null;
  }

  const Forum = {
    mount(slug, el, opts) {
      if (!el) return;
      injectStyles();
      opts = opts || {};
      const state = { slug, el, modalTab: 'signup' };

      el.classList.add('disc');
      el.innerHTML = `
        <div class="disc-head">
          <h3>Discussion</h3>
          <span class="count" data-count>0</span>
          <div class="acct" data-acct></div>
        </div>
        <div data-composer></div>
        <div class="disc-list" data-list></div>
        <div class="disc-modal" data-modal>
          <div class="disc-card">
            <button class="disc-x" data-x aria-label="Close">×</button>
            <div class="top">
              <div class="disc-tabs">
                <button data-tab="signup" class="on">Create account</button>
                <button data-tab="signin">Sign in</button>
              </div>
              <h4 data-mtitle>Join the discussion</h4>
              <p class="sub" data-msub>Create a free forum account to comment. Your account stays on this device.</p>
            </div>
            <div class="form">
              <div data-namewrap><label>Display name</label><input data-name type="text" maxlength="40" placeholder="e.g. Mei T." /></div>
              <div><label>Email</label><input data-email type="email" placeholder="you@example.com" /></div>
              <div><label>Password</label><input data-pass type="password" placeholder="At least 6 characters" /></div>
              <p class="disc-err" data-err></p>
            </div>
            <div class="foot">
              <button class="disc-btn disc-btn-primary" data-submit>Create account</button>
            </div>
            <p class="disc-note">This is YSP's community forum. Accounts and comments are stored locally in your browser for this demo — no data leaves your device.</p>
          </div>
        </div>
      `;

      const $ = (s) => el.querySelector(s);
      const modal = $('[data-modal]');

      function comments() { return load(cKey(slug), []); }
      function setComments(arr) { save(cKey(slug), arr); }

      function openModal(tab) {
        state.modalTab = tab || 'signup';
        el.querySelectorAll('.disc-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === state.modalTab));
        const isSignup = state.modalTab === 'signup';
        $('[data-namewrap]').style.display = isSignup ? '' : 'none';
        $('[data-mtitle]').textContent = isSignup ? 'Create your forum account' : 'Welcome back';
        $('[data-msub]').textContent = isSignup
          ? 'Join the discussion as a member of the YSP community. Your account stays on this device.'
          : 'Sign in to pick up where you left off.';
        $('[data-submit]').textContent = isSignup ? 'Create account' : 'Sign in';
        $('[data-err]').textContent = '';
        modal.classList.add('open');
        setTimeout(() => (isSignup ? $('[data-name]') : $('[data-email]')).focus(), 60);
      }
      function closeModal() { modal.classList.remove('open'); }

      function doSubmit() {
        const isSignup = state.modalTab === 'signup';
        const name = ($('[data-name]').value || '').trim();
        const email = ($('[data-email]').value || '').trim().toLowerCase();
        const pass = $('[data-pass]').value || '';
        const err = $('[data-err]');
        const accs = load(LS_ACC, {});
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; return; }
        if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
        if (isSignup) {
          if (name.length < 2) { err.textContent = 'Please enter a display name.'; return; }
          if (accs[email]) { err.textContent = 'An account with this email already exists. Try signing in.'; return; }
          accs[email] = { name, pass: hash(pass) };
          save(LS_ACC, accs);
          save(LS_SES, email);
        } else {
          if (!accs[email]) { err.textContent = 'No account found for this email. Create one instead.'; return; }
          if (accs[email].pass !== hash(pass)) { err.textContent = 'Incorrect password.'; return; }
          save(LS_SES, email);
        }
        closeModal();
        render();
      }

      function addComment(text) {
        const u = getUser(); if (!u) return;
        const arr = comments();
        arr.push({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: u.name, email: u.email, text, ts: Date.now(), likedBy: [] });
        setComments(arr);
      }
      function toggleLike(id) {
        const u = getUser(); if (!u) { openModal('signin'); return; }
        const arr = comments();
        const c = arr.find((x) => x.id === id); if (!c) return;
        c.likedBy = c.likedBy || [];
        const i = c.likedBy.indexOf(u.email);
        if (i >= 0) c.likedBy.splice(i, 1); else c.likedBy.push(u.email);
        setComments(arr);
        render();
      }
      function deleteComment(id) {
        const u = getUser(); if (!u) return;
        let arr = comments();
        arr = arr.filter((x) => !(x.id === id && x.email === u.email));
        setComments(arr);
        render();
      }

      function render() {
        const u = getUser();
        const arr = comments().slice().sort((a, b) => b.ts - a.ts);
        $('[data-count]').textContent = arr.length + (arr.length === 1 ? ' comment' : ' comments');

        // account row
        const acct = $('[data-acct]');
        if (u) {
          acct.innerHTML = `<span>Signed in as <b>${esc(u.name)}</b></span><button class="disc-link" data-signout>Sign out</button>`;
          acct.querySelector('[data-signout]').onclick = () => { save(LS_SES, null); render(); };
        } else {
          acct.innerHTML = `<button class="disc-link" data-signin>Sign in</button>`;
          acct.querySelector('[data-signin]').onclick = () => openModal('signin');
        }

        // composer
        const composer = $('[data-composer]');
        if (u) {
          composer.innerHTML = `
            <div class="disc-compose">
              <div class="disc-av">${esc(initials(u.name))}</div>
              <div class="field">
                <textarea data-input placeholder="Share your perspective… Keep it thoughtful — this is a youth policy community."></textarea>
                <div class="row">
                  <span class="hint">Posting as <b>${esc(u.name)}</b></span>
                  <button class="disc-btn disc-btn-primary" data-post disabled>Post comment</button>
                </div>
              </div>
            </div>`;
          const ta = composer.querySelector('[data-input]');
          const post = composer.querySelector('[data-post]');
          ta.oninput = () => { post.disabled = ta.value.trim().length === 0; };
          post.onclick = () => {
            const t = ta.value.trim(); if (!t) return;
            addComment(t); render();
          };
        } else {
          composer.innerHTML = `
            <div class="disc-gate">
              <p><b>Create a free account to join the discussion.</b> Comments are open to registered members of the YSP community.</p>
              <div class="g-actions">
                <button class="disc-btn disc-btn-primary" data-create>Create account</button>
                <button class="disc-btn disc-btn-ghost" data-signin2>Sign in</button>
              </div>
            </div>`;
          composer.querySelector('[data-create]').onclick = () => openModal('signup');
          composer.querySelector('[data-signin2]').onclick = () => openModal('signin');
        }

        // list
        const list = $('[data-list]');
        if (!arr.length) {
          list.innerHTML = `<div class="disc-empty">No comments yet — be the first to start the discussion.</div>`;
          return;
        }
        list.innerHTML = arr.map((c) => {
          const liked = u && (c.likedBy || []).includes(u.email);
          const likes = (c.likedBy || []).length;
          const mine = u && c.email === u.email;
          return `
            <div class="disc-item">
              <div class="disc-av">${esc(initials(c.name))}</div>
              <div class="body">
                <div class="meta">
                  <span class="who">${esc(c.name)}</span>
                  ${mine ? '<span class="mine">You</span>' : ''}
                  <span class="when">${rel(c.ts)}</span>
                </div>
                <div class="text">${esc(c.text)}</div>
                <div class="actions">
                  <button class="act ${liked ? 'liked' : ''}" data-like="${c.id}">▲ Like${likes ? ' · ' + likes : ''}</button>
                  ${mine ? `<button class="act" data-del="${c.id}">Delete</button>` : ''}
                </div>
              </div>
            </div>`;
        }).join('');
        list.querySelectorAll('[data-like]').forEach((b) => (b.onclick = () => toggleLike(b.dataset.like)));
        list.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => deleteComment(b.dataset.del)));
      }

      // modal wiring
      el.querySelectorAll('.disc-tabs button').forEach((b) => (b.onclick = () => openModal(b.dataset.tab)));
      $('[data-x]').onclick = closeModal;
      $('[data-submit]').onclick = doSubmit;
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      el.querySelector('[data-pass]').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });

      render();
    }
  };

  window.YSPForum = Forum;
})();
