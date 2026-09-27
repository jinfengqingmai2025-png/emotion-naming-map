// ============================================================
// 照见 Seen — 网页端应用逻辑
// ============================================================

let currentLang = 'cn';
let currentScale = null;
let currentQuestion = 0;
let answers = [];
let currentPage = 'hero';

function t(key) {
  const keys = key.split('.');
  let obj = I18N[currentLang];
  for (const k of keys) {
    if (obj && obj[k] !== undefined) obj = obj[k];
    else return key;
  }
  return obj;
}

function setI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = t(el.dataset.i18nPlaceholder);
    if (val) el.placeholder = val;
  });
}

// Cursor glow
const cursorGlow = document.getElementById('cursorGlow');
let mx = 0, my = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorGlow.classList.add('active'); });
document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
function animGlow() { gx += (mx-gx)*.08; gy += (my-gy)*.08; cursorGlow.style.left = gx+'px'; cursorGlow.style.top = gy+'px'; requestAnimationFrame(animGlow); }
animGlow();

// Scroll nav
window.addEventListener('scroll', () => document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50));

// Language
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.documentElement.lang = currentLang === 'tw' ? 'zh-TW' : currentLang === 'en' ? 'en' : 'zh-CN';
    setI18n();
    if (currentPage === 'scales') renderScales();
    if (currentPage === 'cards') renderCards();
  });
});

// Nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('href');
    if (target === '#scales') showPage('scales');
    else if (target === '#cards') showPage('cards');
    else if (target === '#about') showPage('about');
  });
});

function showPage(page) {
  ['hero','scales','assessment','results','cards','about'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = 'none';
  });
  currentPage = page;
  if (page === 'hero') document.getElementById('hero').style.display = 'flex';
  else if (page === 'scales') { document.getElementById('scales').style.display = 'block'; renderScales(); }
  else if (page === 'assessment') { document.getElementById('assessment').style.display = 'block'; }
  else if (page === 'results') { document.getElementById('results').style.display = 'block'; }
  else if (page === 'cards') { document.getElementById('cards').style.display = 'block'; renderCards(); }
  else if (page === 'about') document.getElementById('about').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scales
function renderScales() {
  const grid = document.getElementById('scalesGrid');
  const search = (document.getElementById('scaleSearch').value || '').toLowerCase();
  const filtered = SCALES.filter(s => !search || s.title.toLowerCase().includes(search) || s.desc.toLowerCase().includes(search) || s.tag.toLowerCase().includes(search));
  grid.innerHTML = filtered.map(s => `
    <div class="scale-card reveal" onclick="startAssessment('${s.id}')">
      <span class="tag">${s.tag}</span>
      <h3>${s.title}</h3>
      <div class="subtitle">${s.subtitle}</div>
      <div class="desc">${s.desc}</div>
      <div class="source">${s.source} · ${s.license}</div>
    </div>
  `).join('');
  initReveal();
}

function startAssessment(scaleId) {
  currentScale = SCALES.find(s => s.id === scaleId);
  if (!currentScale) { console.error('Scale not found:', scaleId); return; }
  currentQuestion = 0;
  const qData = SCALE_QUESTIONS[scaleId];
  if (!qData || !qData.questions) { console.error('No questions for scale:', scaleId); return; }
  answers = new Array(qData.questions.length).fill(null);
  document.getElementById('scales').style.display = 'none';
  document.getElementById('assessment').style.display = 'block';
  currentPage = 'assessment';
  renderQuestion();
}

function getQuestions() { return currentScale ? (SCALE_QUESTIONS[currentScale.id] || {}).questions || [] : []; }

function renderQuestion() {
  const questions = getQuestions();
  if (!questions.length || currentQuestion >= questions.length) { showResults(); return; }
  const q = questions[currentQuestion];
  document.getElementById('questionText').textContent = `${currentQuestion+1}. ${q.text || q}`;
  document.getElementById('progressFill').style.width = `${((currentQuestion+1)/questions.length)*100}%`;
  document.getElementById('progressText').textContent = `${currentQuestion+1}/${questions.length}`;
  
  const optsDiv = document.getElementById('scaleOptions');
  optsDiv.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.className = 'scale-option' + (answers[currentQuestion] === i ? ' selected' : '');
    btn.textContent = i;
    btn.onclick = () => selectOption(i);
    optsDiv.appendChild(btn);
  }
  document.getElementById('btnBack').style.display = currentQuestion === 0 ? 'none' : '';
  document.getElementById('btnNext').textContent = currentQuestion === questions.length-1 ? '完成测评' : '下一题';
}

function selectOption(value) {
  answers[currentQuestion] = value;
  document.querySelectorAll('.scale-option').forEach(btn => btn.classList.toggle('selected', parseInt(btn.textContent) === value));
  setTimeout(() => {
    const questions = getQuestions();
    if (!questions.length) return;
    if (currentQuestion < questions.length - 1) { currentQuestion++; renderQuestion(); }
    else { document.getElementById('btnNext').click(); }
  }, 300);
}

document.getElementById('btnNext').addEventListener('click', () => {
  const questions = getQuestions();
  if (!questions.length) return;
  if (currentQuestion >= questions.length - 1) showResults();
  else { currentQuestion++; renderQuestion(); }
});
document.getElementById('btnBack').addEventListener('click', () => {
  if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
});
document.getElementById('btnSkip').addEventListener('click', () => {
  const questions = getQuestions();
  if (!questions.length) return;
  if (currentQuestion < questions.length - 1) { currentQuestion++; renderQuestion(); }
  else showResults();
});

// Calculators (simplified versions matching calculator.js logic)
function calcResult(scaleId, answers) {
  const questions = (SCALE_QUESTIONS[scaleId] || {}).questions || [];
  const scale = (SCALE_QUESTIONS[scaleId] || {}).scale || 5;
  switch(scaleId) {
    case 'scl90': return calcSCL90(answers, questions);
    case 'phq9': return calcSimple(answers, questions, scale, [5,10,15,20], ['无抑郁','轻度抑郁','中度抑郁','中重度抑郁','重度抑郁']);
    case 'gad7': return calcSimple(answers, questions, scale, [5,10,15], ['无焦虑','轻度焦虑','中度焦虑','重度焦虑']);
    case 'scs': return calcSCS(answers, questions, scale);
    case 'mbti': return calcMBTI(answers, questions, scale);
    case 'big5': return calcBigFive(answers, questions, scale);
    case 'attachment': return calcAttachment(answers, questions, scale);
    case 'love': return calcLove(answers, questions, scale);
    case 'disc': return calcDISC(answers, questions, scale);
    case 'grit': return calcGrit(answers, questions, scale);
    default: return null;
  }
}

function calcSimple(answers, questions, scale, thresholds, levels) {
  const total = answers.reduce((s,v) => s + (v||0), 0);
  let idx = 0;
  for (let i = thresholds.length-1; i >= 0; i--) { if (total >= thresholds[i]) { idx = i+1; break; } }
  if (total >= thresholds[thresholds.length-1]) idx = levels.length-1;
  return { type:'clin', total, max:scale*questions.length, level:levels[idx], levelDesc:levels[idx], dims:[{name:scaleId.toUpperCase(),score:total,max:scale*questions.length,avg:+(total/questions.length).toFixed(2)}], keywords:[levels[idx]], summary:`${scaleId.toUpperCase()} ${total}分` };
}

function calcSCL90(answers, questions) {
  const dims = [{name:'躯体化',q:[0,1,2,3,4,5,6,7,8,9]},{name:'强迫症状',q:[10,11,12,13,14,15,16,17,18,19]},{name:'人际关系敏感',q:[20,21,22,23,24,25,26,27,28,29]},{name:'抑郁',q:[30,31,32,33,34,35,36,37,38,39]},{name:'焦虑',q:[40,41,42,43,44,45,46,47,48,49]},{name:'敌对',q:[50,51,52,53,54,55,56,57,58,59]},{name:'恐怖',q:[60,61,62,63,64,65,66,67,68,69]},{name:'偏执',q:[70,71,72,73,74,75,76,77,78,79]},{name:'精神病性',q:[80,81,82,83,84,85,86,87,88,89]},{name:'其他',q:[19,44,47,60,64,66]}];
  const dArr = dims.map(d => ({ name:d.name, score:d.q.reduce((s,i) => s+(answers[i]||0),0), max:d.q.length*5, avg:+(d.q.reduce((s,i)=>s+(answers[i]||0),0)/d.q.length).toFixed(2) }));
  const total = answers.reduce((s,v) => s+(v||0),0);
  let level='正常', desc='整体状态良好。';
  if(total>=160&&total<225){level='轻度';desc='可能存在轻微困扰。'}else if(total>=225&&total<315){level='中度';desc='困扰较明显，建议寻求专业支持。'}else if(total>=315){level='重度';desc='强烈建议尽快联系专业人士。'}
  const top = [...dArr].sort((a,b)=>b.avg-a.avg).slice(0,3).map(d=>d.name);
  const kw=[...top]; if(total>=160)kw.push('情绪困扰');if(total>=225)kw.push('需要支持');if(total<160)kw.push('自我接纳','温和');
  const sf = (answers[14]>=2||answers[8]>=2) ? {requiresFollowUp:true,kind:'self_harm',item:answers[14]>=2?15:9,value:answers[14]>=2?answers[14]:answers[8],message:'检测到相关选项'} : {requiresFollowUp:false};
  return {type:'clin',total,max:450,level,levelDesc:desc,dims,keywords:kw,summary:`SCL-90 总分 ${total}·${level}`,extra:{topDimensions:top},safetyFlag:sf};
}

function calcSCS(answers, questions, scale) {
  const buckets = {};
  questions.forEach((q,i) => { const raw=answers[i]||0; const score=q.reverse?(scale+1-raw):raw; const k=q.dim||['sk','sj','ch','iso','mind','oi'][Math.floor(i/5)]; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=score; buckets[k].count++; });
  const labels={sk:'自我友善',sj:'自我评判',ch:'共通人性',iso:'孤立',mind:'正念',oi:'过度认同'};
  const dimArr = Object.entries(buckets).map(([k,v]) => ({name:labels[k]||k,score:v.sum,max:v.count*scale,avg:+(v.sum/v.count).toFixed(2)}));
  const total=dimArr.reduce((s,d)=>s+d.score,0);const avg=+(total/questions.length).toFixed(2);
  const level=avg>=4?'较高':avg<3?'较低':'中等';
  const pos=['自我友善','共通人性','正念'];const posAvg=dimArr.filter(d=>pos.includes(d.name)).reduce((s,d)=>s+d.avg,0)/3;const negAvg=dimArr.filter(d=>!pos.includes(d.name)).reduce((s,d)=>s+d.avg,0)/3;
  const kw=posAvg>=4?['自我接纳','温和']:posAvg<3?['自我批判','孤立','需要支持']:['自悯'];
  return {type:'emo',total,max:scale*questions.length,level,levelDesc:`自悯均分 ${avg}·${level}`,dims,keywords:kw,summary:`自悯均分 ${avg}·${level}`};
}

function calcMBTI(answers, questions, scale) {
  const buckets={};
  questions.forEach((q,i) => { const raw=answers[i]||0; const score=q.reverse?(scale+1-raw):raw; const k=q.dim||['EI','SN','TF','JP'][Math.floor(i/7)]; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=score; buckets[k].count++; });
  const eI=(buckets.EI.sum/buckets.EI.count)>=3?'I':'E';const sN=(buckets.SN.sum/buckets.SN.count)>=3?'N':'S';const tF=(buckets.TF.sum/buckets.TF.count)>=3?'F':'T';const jP=(buckets.JP.sum/buckets.JP.count)>=3?'P':'J';
  const type=eI+sN+tF+jP;const kw=[type];if(eI==='I')kw.push('内向','自我接纳');else kw.push('外向','行动');if(sN==='N')kw.push('好奇','探索');else kw.push('实感','当下');if(tF==='F')kw.push('情感','关系');else kw.push('思考','自律');if(jP==='J')kw.push('自律','坚持');else kw.push('感知','好奇');
  return {type:'char',total:Object.values(buckets).reduce((s,b)=>s+b.sum,0),max:scale*questions.length,level:type,levelDesc:`你的性格类型是 ${type}`,dims:['EI','SN','TF','JP'].map(k=>({name:k,score:buckets[k].sum,max:buckets[k].count*scale,avg:+(buckets[k].sum/buckets[k].count).toFixed(2)})),keywords:kw,summary:`性格类型：${type}`};
}

function calcBigFive(answers, questions, scale) {
  const buckets={};
  questions.forEach((q,i) => { const raw=answers[i]||0; const score=q.reverse?(scale+1-raw):raw; const k=q.dim||['N','E','O','A','C'][Math.floor(i/6)]; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=score; buckets[k].count++; });
  const dm={N:'神经质',E:'外向性',O:'开放性',A:'宜人性',C:'尽责性'};
  const dimArr=Object.entries(buckets).map(([k,v])=>({name:dm[k]||k,score:v.sum,max:v.count*scale,avg:+(v.sum/v.count).toFixed(2)}));
  const total=dimArr.reduce((s,d)=>s+d.score,0);const avg=+(total/questions.length).toFixed(2);
  const kw=[];const sorted=[...dimArr].sort((a,b)=>b.avg-a.avg);const top=sorted[0];
  if((dimArr.find(d=>d.name==='神经质')?.avg||0)>=4)kw.push('焦虑','神经质');
  if((dimArr.find(d=>d.name==='外向性')?.avg||0)>=4)kw.push('外向','行动');
  if((dimArr.find(d=>d.name==='开放性')?.avg||0)>=4)kw.push('好奇','探索');
  if((dimArr.find(d=>d.name==='宜人性')?.avg||0)>=4)kw.push('温和','亲近');
  if((dimArr.find(d=>d.name==='尽责性')?.avg||0)>=4)kw.push('自律','坚持');
  kw.push(top.name);if(kw.length<=1)kw.push(top.avg>=4?'自我接纳':'自悯');
  return {type:'char',total,max:scale*questions.length,level:'已生成',levelDesc:`5维度均分 ${avg}`,dims,keywords:kw,summary:'大五人格已生成'};
}

function calcAttachment(answers, questions, scale) {
  const buckets={};
  questions.forEach((q,i) => { const raw=answers[i]||0; const score=q.reverse?(scale+1-raw):raw; const k=i<18?'AN':'AV'; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=score; buckets[k].count++; });
  const ANa=buckets.AN.sum/buckets.AN.count;const AVa=buckets.AV.sum/buckets.AV.count;
  let style='安全型';if(ANa>=4.5&&AVa<4)style='痴迷型';else if(ANa<4.5&&AVa>=4)style='回避型';else if(ANa>=4.5&&AVa>=4)style='恐惧型';
  const kw=[style];if(ANa>=4)kw.push('关系焦虑','自我批判');else kw.push('关系安全感');if(AVa>=4)kw.push('保持距离');else kw.push('愿意靠近');
  return {type:'rel',total:buckets.AN.sum+buckets.AV.sum,max:scale*questions.length,level:style,levelDesc:`焦虑 ${ANa.toFixed(2)}·回避 ${AVa.toFixed(2)}`,dims:[{name:'焦虑',score:buckets.AN.sum,max:buckets.AN.count*scale,avg:+ANa.toFixed(2)},{name:'回避',score:buckets.AV.sum,max:buckets.AV.count*scale,avg:+AVa.toFixed(2)}],keywords:kw,summary:`依恋风格：${style}`};
}

function calcLove(answers, questions, scale) {
  const buckets={};const labels={WORDS:'肯定的话语',TIME:'共度时光',GIFTS:'收到礼物',ACTS:'服务行为',TOUCH:'身体接触'};
  questions.forEach((q,i) => { const raw=answers[i]||0; const k=q.dim||['WORDS','TIME','GIFTS','ACTS','TOUCH'][Math.floor(i/6)]; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=raw; buckets[k].count++; });
  const dimArr=Object.entries(buckets).map(([k,v])=>({name:labels[k]||k,score:v.sum,max:v.count*scale,avg:+(v.sum/v.count).toFixed(2)}));
  const sorted=[...dimArr].sort((a,b)=>b.avg-a.avg);const top=sorted[0];
  return {type:'rel',total:dimArr.reduce((s,d)=>s+d.score,0),max:dimArr.reduce((s,d)=>s+d.max,0),level:top.name,levelDesc:`你最在意的爱的语言是「${top.name}」`,dims,keywords:[top.name,sorted[1].name,'关系','自我接纳'],summary:`主要爱的语言：${top.name}`};
}

function calcDISC(answers, questions, scale) {
  const buckets={};const labels={D:'支配型',I:'影响型',S:'稳健型',C:'谨慎型'};
  questions.forEach((q,i) => { const raw=answers[i]||0; const k=q.dim||['D','I','S','C'][Math.floor(i/6)]; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=raw; buckets[k].count++; });
  const dimArr=Object.entries(buckets).map(([k,v])=>({dim:k,name:labels[k]||k,score:v.sum,max:v.count*scale,avg:+(v.sum/v.count).toFixed(2)}));
  const ORDER=['D','I','S','C'];const sorted=[...dimArr].sort((a,b)=>b.avg!==a.avg?b.avg-a.avg:ORDER.indexOf(a.dim)-ORDER.indexOf(b.dim));
  const top=sorted[0];
  return {type:'beh',total:dimArr.reduce((s,d)=>s+d.score,0),max:dimArr.reduce((s,d)=>s+d.max,0),level:top.name,levelDesc:`你的主导行为风格是「${top.name}」`,dims,keywords:[top.name,sorted[1].name,'行为风格','自我接纳'],summary:`DISC 主导风格：${top.name}`};
}

function calcGrit(answers, questions, scale) {
  const buckets={};
  questions.forEach((q,i) => { const raw=answers[i]||0; const score=q.reverse?(scale+1-raw):raw; const k=i<4?'C':'P'; if(!buckets[k])buckets[k]={sum:0,count:0}; buckets[k].sum+=score; buckets[k].count++; });
  const cA=buckets.C.sum/buckets.C.count;const pA=buckets.P.sum/buckets.P.count;const total=buckets.C.sum+buckets.P.sum;const avg=+(total/questions.length).toFixed(2);
  const level=avg>=4?'较高':avg<3?'较低':'中等';const kw=avg>=4?['自律','坚持','自我接纳']:avg<3?['易分心','需要支持','自我批判']:['目标感','自我接纳'];
  return {type:'goal',total,max:scale*questions.length,level,levelDesc:`坚毅力均分 ${avg}，一致性 ${cA.toFixed(2)}，坚持性 ${pA.toFixed(2)}`,dims:[{name:'一致性',score:buckets.C.sum,max:buckets.C.count*scale,avg:+cA.toFixed(2)},{name:'坚持性',score:buckets.P.sum,max:buckets.P.count*scale,avg:+pA.toFixed(2)}],keywords:kw,summary:`坚毅力：${level}（均分 ${avg}）`};
}

// Show results
function showResults() {
  const result = calcResult(currentScale.id, answers);
  if (!result) return;
  document.getElementById('assessment').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  currentPage = 'results';
  
  const container = document.getElementById('resultsContainer');
  const lc = result.total >= result.max*0.6 ? 'moderate' : result.total >= result.max*0.3 ? 'mild' : 'normal';
  const recCards = CARDS.filter(c => result.keywords.some(k => c.title.toLowerCase().includes(k.toLowerCase()))).slice(0,4);
  
  let dimsHtml = result.dims && result.dims.length ? `
    <div class="result-dimensions">${result.dims.map(d => `
      <div class="dim-card"><div class="dim-name">${d.name}</div><div class="dim-score">${d.avg.toFixed(1)}</div><div class="dim-bar"><div class="dim-bar-fill" style="width:${Math.min(d.avg/d.max*100,100)}%"></div></div></div>
    `).join('')}</div>` : '';
  
  let crisisHtml = result.safetyFlag && result.safetyFlag.requiresFollowUp ? `
    <div class="crisis-alert"><h3>需要进一步关注</h3><p>你在作答中提到的内容值得进一步关注。</p><div class="crisis-hotline">24小时心理援助热线: 12356</div></div>` : '';
  
  let cardsHtml = recCards.length ? `
    <div class="recommended-cards"><h3>相关情绪卡片</h3><div class="cards-preview-grid">${recCards.map(c => `
      <div class="preview-card" onclick="showCardDetail('${c.id}')"><h4>${c.title}</h4><p>${c.desc.substring(0,80)}...</p></div>
    `).join('')}</div></div>` : '';
  
  container.innerHTML = `
    <div class="result-hero">
      <div class="section-header"><h2>测评结果</h2><div class="accent-line"></div></div>
      <div class="result-type">${result.level}</div>
      <div class="result-level ${lc}">${result.levelDesc}</div>
      <p class="result-desc">${result.summary}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="showPage('scales')">重新测评</button>
        <button class="btn btn-secondary" onclick="showPage('cards')">查看情绪卡片</button>
      </div>
    </div>${crisisHtml}
    <div style="margin-bottom:48px;"><h3 style="font-size:24px;margin-bottom:24px;text-align:center;">维度分析</h3>${dimsHtml}</div>
    <div style="margin-bottom:48px;"><h3 style="font-size:24px;margin-bottom:24px;text-align:center;">关键词</h3><div class="keywords-grid">${result.keywords.map(k=>`<span class="keyword-tag highlight">${k}</span>`).join('')}</div></div>
    ${cardsHtml}
    <div style="text-align:center;margin-top:48px;">
      <button class="btn btn-primary" onclick="showPage('scales')" style="margin:8px;">重新测评</button>
      <button class="btn btn-secondary" onclick="showPage('cards')" style="margin:8px;">查看情绪卡片</button>
    </div>
  `;
  setTimeout(() => document.querySelectorAll('.dim-bar-fill').forEach(b => {}), 100);
  initReveal();
}

// Cards
function renderCards() {
  const grid = document.getElementById('cardsGrid');
  const search = (document.getElementById('cardSearch').value || '').toLowerCase();
  const filtered = CARDS.filter(c => !search || c.title.toLowerCase().includes(search) || c.desc.toLowerCase().includes(search));
  grid.innerHTML = filtered.map((c,i) => `
    <div class="emotion-card reveal" style="transition-delay:${i*30}ms" onclick="flipCard(this)">
      <span class="card-id">${c.id}</span>
      <h3>${c.title}</h3>
      <div class="desc">${c.desc}</div>
      <div class="mech"><strong>机制：</strong>${c.mech}</div>
      <div class="heal"><strong>疗愈：</strong>${c.heal}</div>
      <div class="safe-practice"><strong>练习：</strong>${c.safe}</div>
    </div>
  `).join('');
  initReveal();
}

function flipCard(el) { el.classList.toggle('flipped'); }
document.getElementById('cardSearch').addEventListener('input', () => renderCards());
document.getElementById('randomCard').addEventListener('click', () => {
  document.getElementById('cardSearch').value = '';
  renderCards();
  const cards = document.querySelectorAll('.emotion-card');
  if (cards.length) { const idx = Math.floor(Math.random()*cards.length); cards[idx].classList.add('flipped'); cards[idx].scrollIntoView({behavior:'smooth',block:'center'}); }
});

function showCardDetail(cardId) {
  showPage('cards');
  setTimeout(() => { const el = document.querySelectorAll('.emotion-card')[parseInt(cardId)-1]; if(el){el.classList.add('flipped');el.scrollIntoView({behavior:'smooth',block:'center'});} }, 300);
}

// Scroll reveal
function initReveal() {
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, {threshold:0.1});
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderScales();
  initReveal();
  const hero = document.querySelector('.hero');
  for(let i=0;i<20;i++){const p=document.createElement('div');p.className='ambient-particle';p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animation=`float ${3+Math.random()*4}s ease-in-out ${Math.random()*3}s infinite`;p.style.width=(1+Math.random()*2)+'px';p.style.height=p.style.width;hero.appendChild(p);}
});

// Keyboard
document.addEventListener('keydown', e => {
  if(currentPage === 'assessment') {
    if(e.key>='1'&&e.key<='5') selectOption(parseInt(e.key));
    if(e.key==='ArrowRight'&&currentQuestion<getQuestions().length-1){currentQuestion++;renderQuestion();}
    if(e.key==='ArrowLeft'&&currentQuestion>0){currentQuestion--;renderQuestion();}
  }
});
