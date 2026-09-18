/* Portable, dependency-free guided reading. Lesson content is supplied by the host. */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class ReadingCoach extends HTMLElement {
    constructor() {
      super(); this.attachShadow({mode:'open'}); this.state = null;
      this.shadowRoot.addEventListener('click', e => {
        const button = e.target.closest('button[data-action]');
        if (button) this.act(button.dataset.action, button.dataset.value);
      });
      this.shadowRoot.addEventListener('change', e => {
        if (e.target.name === 'answer') this.shadowRoot.querySelector('[data-action="answer"]').disabled = false;
      });
    }
    set lesson(value) {
      // Reject incomplete or mismatched source references before presenting the lesson.
      if (!value || !value.id || !value.version || !value.title || !Array.isArray(value.sections) || !value.sections.length) throw new TypeError('A lesson needs id, version, title and sections.');
      const ids = new Set();
      for (const s of value.sections) {
        if (!s.id || ids.has(s.id) || !s.title || !s.source || !s.quote || !s.source.includes(s.quote) || !s.summary || !s.recap || !s.change || !Array.isArray(s.steps) || !s.steps.length || !s.question?.prompt || !Array.isArray(s.question.options) || s.question.options.length < 2 || !s.question.options.every(x => typeof x === 'string') || !Number.isInteger(s.question.correct) || !s.question.options[s.question.correct] || !s.question.explanation) throw new TypeError('Each section needs unique id, content, a matching source quote and a valid question.');
        ids.add(s.id);
      }
      this._lesson = JSON.parse(JSON.stringify(value));
      this.key = `reading-coach:${this.getAttribute('storage-key') || value.id}:${value.version}`;
      this.state = {index:0, stage:'read', outcomes:[], adapted:false};
      this.resume = false; this.recall = ''; this.comparing = false; this.reviewing = false; this.storageAvailable = true;
      try {
        const saved = JSON.parse(sessionStorage.getItem(this.key) || 'null');
        if (saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= value.sections.length && Array.isArray(saved.outcomes) && saved.outcomes.length === saved.index && saved.outcomes.every(x => ['checked','skipped','reviewed'].includes(x)) && ['read','check','feedback','recall','done'].includes(saved.stage) && (saved.index === value.sections.length ? ['recall','done'].includes(saved.stage) : ['read','check','feedback'].includes(saved.stage))) {
          this.state = saved; this.resume = saved.stage !== 'done';
        }
      } catch { this.storageAvailable = false; }
      this.render();
    }
    get lesson() { return this._lesson; }
    connectedCallback() { if (this._lesson) this.render(); }
    save() { try { sessionStorage.setItem(this.key, JSON.stringify(this.state)); } catch { this.storageAvailable = false; } }
    emit(name, detail) { this.dispatchEvent(new CustomEvent(name, {detail, bubbles:true, composed:true})); }
    act(action) {
      if (!this.state) return;
      const st = this.state, section = this._lesson.sections[st.index];
      if (action === 'restart') { if (st.stage === 'recall' && !this.comparing) this.recall = this.shadowRoot.querySelector('textarea')?.value || ''; this.resume = true; }
      else if (action === 'resume') this.resume = false;
      else if (action === 'adapt' && section && st.stage === 'read') { st.adapted = !st.adapted; this.emit('reading-adapted', {lessonId:this._lesson.id, sectionId:section.id, format:st.adapted?'steps':'paragraph', reason:'learner-request'}); }
      else if (action === 'check' && st.stage === 'read') st.stage = 'check';
      else if (action === 'reread' && st.stage === 'check') st.stage = 'read';
      else if (action === 'answer' && st.stage === 'check') {
        const selected = this.shadowRoot.querySelector('input[name="answer"]:checked');
        if (!selected) return;
        st.correct = Number(selected.value) === section.question.correct; st.stage = 'feedback';
        if (!st.correct) st.adapted = true;
      }
      else if ((action === 'skip' && ['read','check'].includes(st.stage)) || (action === 'next' && st.stage === 'feedback')) {
        const outcome = action === 'skip' ? 'skipped' : st.correct ? 'checked' : 'reviewed';
        st.outcomes.push(outcome); st.index++; st.stage = st.index === this._lesson.sections.length ? 'recall' : 'read'; st.adapted = false; delete st.correct;
        this.save();
        this.emit('section-completed', {lessonId:this._lesson.id, sectionId:section.id, completed:st.index, outcome, eventId:`${this._lesson.id}:${this._lesson.version}:${section.id}`});
      }
      else if (action === 'compare' && st.stage === 'recall') { this.recall = this.shadowRoot.querySelector('textarea')?.value || ''; this.comparing = true; }
      else if (action === 'finish' && st.stage === 'recall') {
        st.stage = 'done'; this.save(); this.recall = '';
        this.emit('reading-completed', {id:this._lesson.id, title:this._lesson.title, topic:this._lesson.topic || this._lesson.title, outcomes:[...st.outcomes], eventId:`${this._lesson.id}:${this._lesson.version}:complete`});
      }
      else if (action === 'review' && st.stage === 'done') this.reviewing = !this.reviewing;
      else return;
      this.save(); this.render(true);
    }
    source(s) {
      const at = s.source.indexOf(s.quote);
      return `<details><summary>Check the original wording</summary><p class="source">${escape(s.source.slice(0,at))}<mark>${escape(s.quote)}</mark>${escape(s.source.slice(at+s.quote.length))}</p><small>Highlighted text is an exact source match. This does not verify every claim in the explanation.</small></details>`;
    }
    steps(s) { return `<ol class="steps">${s.steps.map(x => `<li>${escape(x)}</li>`).join('')}</ol><p class="change"><strong>What changed:</strong> ${escape(s.change)}</p>`; }
    render(focus = false) {
      const st = this.state, lesson = this._lesson; if (!st || !lesson) return;
      const s = lesson.sections[st.index], count = lesson.sections.length;
      const button = (action,label,primary=false) => `<button type="button" data-action="${action}" class="${primary?'primary':''}">${label}</button>`;
      let body;
      if (this.resume) body = `<span class="label">A PLACE TO PICK UP</span><h2 tabindex="-1">Welcome back.</h2><p>${st.index ? `You finished: <strong>${escape(lesson.sections[st.index-1].title)}</strong>.` : 'You’re at the beginning. Nothing to catch up on.'}</p>${st.index ? `<div class="note">${escape(lesson.sections[st.index-1].recap)}</div>` : ''}<p><strong>Your next step:</strong> ${s ? `${st.stage === 'feedback' ? 'Review your feedback for' : st.stage === 'check' ? 'Try the optional check for' : 'Read'} ${escape(s.title)}.` : 'Bring the ideas together in a short recall.'}</p><div class="actions">${button('resume','Continue from here →',true)}</div>`;
      else if (st.stage === 'read') body = `<span class="label">ONE IDEA AT A TIME</span><h2 tabindex="-1">${escape(s.title)}</h2>${st.adapted ? this.steps(s) : `<p class="passage">${escape(s.summary)}</p>`}${this.source(s)}<div class="actions">${button('check','Try a quick check →',true)}${button('adapt',st.adapted?'Show paragraph':'Break this into steps')}</div>${button('skip','Continue without a check')}`;
      else if (st.stage === 'check') body = `<span class="label">A MOMENT TO REMEMBER</span><h2 tabindex="-1">What stuck?</h2><p class="muted">Try from memory. You can revisit the reading whenever you need.</p><fieldset><legend>${escape(s.question.prompt)}</legend>${s.question.options.map((x,i)=>`<label class="option"><input type="radio" name="answer" value="${i}"><span>${escape(x)}</span></label>`).join('')}</fieldset><div class="actions"><button type="button" class="primary" data-action="answer" disabled>Check my answer</button>${button('reread','Revisit reading')}</div>${button('skip','Skip this check')}`;
      else if (st.stage === 'feedback') body = `<span class="label">${st.correct?'YOU MADE THE CONNECTION':'LET’S MAKE THAT CLEARER'}</span><h2 tabindex="-1">${st.correct?'That’s right.':'Here’s another way to see it.'}</h2><p>${escape(s.question.explanation)}</p>${!st.correct?this.steps(s):''}${this.source(s)}<div class="actions">${button('next',st.index+1 === count ? 'Bring it together →':'Next idea →',true)}</div><small>${st.correct?'One answer is practice, not a measure of mastery.':'You can keep going after reviewing. There’s no penalty.'}</small>`;
      else if (st.stage === 'recall') body = `<span class="label">BRING IT TOGETHER</span><h2 tabindex="-1">What’s the big picture?</h2><p>Without looking back, explain how the ideas connect. Say it aloud, think it through, or jot a few words.</p>${!this.comparing?`<label for="recall">Your notes <span class="muted">(optional, not saved)</span></label><textarea id="recall" rows="3" placeholder="First… then… because…">${escape(this.recall)}</textarea><div class="actions">${button('compare','Compare with the key ideas',true)}${button('finish','Finish without recall')}</div>`:`<div class="note">${this.recall?`<strong>Your notes</strong><p class="notes">${escape(this.recall)}</p>`:''}<strong>Key connections</strong><ol>${lesson.sections.map(x=>`<li>${escape(x.recap)}</li>`).join('')}</ol></div><p>Anything missing? Explain that part once more in your own words.</p><div class="actions">${button('finish','Finish reading ✓',true)}</div>`}`;
      else body = `<span class="label">READING COMPLETE</span><h2 tabindex="-1">A little more understood.</h2><p>You worked through all ${count} ideas in ${escape(lesson.title)}.</p><div class="note">${st.outcomes.filter(x=>x==='checked').length} correct · ${st.outcomes.filter(x=>x==='reviewed').length} reviewed · ${st.outcomes.filter(x=>x==='skipped').length} skipped.<br><small>Completion records your progress, not mastery.</small></div><div class="actions">${button('review',this.reviewing?'Close recap':'Review the key ideas',true)}</div>${this.reviewing?`<ol>${lesson.sections.map(x=>`<li>${escape(x.recap)}</li>`).join('')}</ol>`:''}<p class="muted">A good place for a break.</p>`;
      this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--coach-ink,#253a34);font:var(--coach-font,17px/1.75 'DM Sans',system-ui,sans-serif)}*{box-sizing:border-box}article{background:var(--coach-paper,#fff);border:1px solid #d6dfd6;border-radius:18px;overflow:hidden}header{padding:18px 28px;background:#f1f5ef;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px}.progress{display:flex;align-items:center;gap:12px;flex-wrap:wrap}progress{width:88px;height:7px;accent-color:var(--coach-accent,#285d4c)}.body{padding:26px 32px 24px;max-width:760px;margin:auto}.label{font-size:11px;letter-spacing:1.7px;font-weight:700;color:#52655a}h2{font:700 29px/1.3 Manrope,system-ui,sans-serif;letter-spacing:-.65px;margin:10px 0 22px}h2:focus{outline:none}p{margin:16px 0}.passage{font-size:19px;line-height:1.75}.muted,small{color:#52655a}small{font-size:13px}.note{padding:19px 22px;background:#eff4e9;border-radius:10px}.notes{white-space:pre-wrap}.change{font-size:14px;background:#eef4f7;padding:12px 16px;border-radius:8px}.steps{padding-left:26px}.steps li,li{margin:12px 0;padding-left:5px}details{border-top:1px solid #d6dfd6;margin-top:26px;padding-top:16px;font-size:14px}summary{cursor:pointer;min-height:44px;display:list-item;padding:8px 0;color:#285d4c;font-weight:600}.source{line-height:1.9}mark{background:#e8efcf;color:#253a34}.actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:28px 0 7px}button{font:inherit;font-size:14px;font-weight:600;line-height:1.5;color:#285d4c;background:transparent;border:1px solid transparent;border-radius:8px;min-height:44px;padding:11px 15px;cursor:pointer}button:hover{background:#edf2e9}button.primary{background:var(--coach-accent,#285d4c);color:white;padding:13px 22px}button.primary:hover{filter:brightness(.9)}button:disabled{opacity:.5;cursor:default}button:focus-visible,summary:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #316c8c;outline-offset:3px}fieldset{border:0;padding:0;margin:24px 0}legend{font-weight:600;margin-bottom:14px}.option{display:flex;align-items:center;gap:13px;padding:14px 16px;border:1px solid #bccabf;border-radius:9px;margin:10px 0;cursor:pointer}.option:has(input:checked){background:#edf4e8;border-color:#285d4c}input{width:18px;height:18px;accent-color:#285d4c;flex-shrink:0}textarea{font:inherit;width:100%;padding:14px;border:1px solid #9caea0;border-radius:8px;margin-top:9px;resize:vertical}footer{font-size:12px;color:#52655a;padding:14px 28px;border-top:1px solid #d6dfd6} @media(max-width:540px){header{padding:14px 16px;align-items:flex-start}header button{max-width:120px;padding:7px;font-size:13px}.body{padding:25px 20px}.passage{font-size:18px}h2{font-size:26px}.actions{align-items:stretch;flex-direction:column}.actions button{width:100%}footer{padding:14px 20px}}
      </style><article aria-label="Guided reading"><header><div class="progress"><progress value="${st.index}" max="${count}" aria-label="Sections completed"></progress><span>${st.index} of ${count} ideas completed</span></div>${st.stage!=='done'&&!this.resume?button('restart','Help me restart'):''}</header><div class="body">${body}</div><footer>${this.storageAvailable?'Your place stays in this browser tab.':'Your place is available while this page stays open; browser storage is unavailable.'} No timer. Your pace.</footer></article>`;
      if (focus) this.shadowRoot.querySelector('h2')?.focus();
    }
  }
  if (!customElements.get('reading-coach')) customElements.define('reading-coach', ReadingCoach);
})();
