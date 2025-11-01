(function(){
  // Data model
  let quiz = { title: '', questions: [] };
  let mode = 'edit';
  let testIndex = 0;
  let answers = []; // selected choice index per question, or null

  // Elements
  const $ = (sel) => document.querySelector(sel);
  const editor = $('#editor');
  const titleInput = $('#titleInput');

  const tabEdit = $('#tabEdit');
  const tabTest = $('#tabTest');
  const tabResult = $('#tabResult');

  const viewEdit = $('#viewEdit');
  const viewTest = $('#viewTest');
  const viewResult = $('#viewResult');

  const btnNewQuestion = $('#btnNewQuestion');
  const btnLoadJson = $('#btnLoadJson');
  const fileOpen = $('#fileOpen');
  const btnSaveJson = $('#btnSaveJson');
  const btnExportStandalone = $('#btnExportStandalone');
  const editStatus = $('#editStatus');
  const pasteJsonBox = $('#pasteJsonBox');
  const btnAppendFromText = $('#btnAppendFromText');
  const btnClearPaste = $('#btnClearPaste');
  const chkAppend = $('#chkAppend');

  const testTitle = $('#testTitle');
  const btnStartTest = $('#btnStartTest');
  const btnLoadJsonTest = $('#btnLoadJsonTest');
  const btnLoadResultsJson = $('#btnLoadResultsJson');
  const fileOpenResults = $('#fileOpenResults');
  const chkAppendTest = $('#chkAppendTest');
  const testStage = $('#testStage');
  const testProgress = $('#testProgress');
  const testQuestion = $('#testQuestion');
  const testChoices = $('#testChoices');
  const btnPrevQ = $('#btnPrevQ');
  const btnNextQ = $('#btnNextQ');
  const btnFinish = $('#btnFinish');
  const testStatus = $('#testStatus');

  const resultSummary = $('#resultSummary');
  const resultDetail = $('#resultDetail');
  const btnBackToEdit = $('#btnBackToEdit');
  const btnRetake = $('#btnRetake');
  const btnExportAnswers = $('#btnExportAnswers');

  // GitHub source elements
  const sourceSelectEdit = $('#sourceSelectEdit');
  const sourceSelectTest = $('#sourceSelectTest');
  const ghPanelEdit = $('#ghPanelEdit');
  const ghPanelTest = $('#ghPanelTest');
  const btnGhRefreshEdit = $('#btnGhRefreshEdit');
  const btnGhRefreshTest = $('#btnGhRefreshTest');
  const ghListEdit = $('#ghListEdit');
  const ghListTest = $('#ghListTest');

  // Utilities
  function download(filename, dataStr) {
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setInfoStatus(msg){
    try{ if(editStatus) editStatus.textContent = msg; }catch{}
  }

  function ensureAtLeastTwoChoices(q){
    while(q.choices.length < 2){
      q.choices.push({ text: '', explanation: '', correct: false });
    }
  }

  function validateQuiz(qz){
    if(!qz || typeof qz !== 'object') return 'File không đúng định dạng';
    if(!Array.isArray(qz.questions)) return 'Thiếu mảng questions';
    for(let i=0;i<qz.questions.length;i++){
      const q = qz.questions[i];
      if(typeof q.text !== 'string') return `Câu ${i+1} thiếu nội dung câu hỏi`;
      if(!Array.isArray(q.choices) || q.choices.length < 2) return `Câu ${i+1} phải có ít nhất 2 lựa chọn`;
      let correctCount = 0;
      for(let j=0;j<q.choices.length;j++){
        const c = q.choices[j];
        if(typeof c.text !== 'string') return `Câu ${i+1} - lựa chọn ${j+1} thiếu nội dung`;
        if(!!c.correct) correctCount++;
        if(c.explanation != null && typeof c.explanation !== 'string') return `Câu ${i+1} - lựa chọn ${j+1} giải thích phải là chuỗi`;
      }
      if(correctCount !== 1) return `Câu ${i+1} phải có đúng 1 đáp án đúng`;
    }
    return null;
  }

  // Rendering - Editor
  function renderEditor(){
    titleInput.value = quiz.title || '';
    editor.innerHTML = '';
    quiz.questions.forEach((q, qi) => {
      ensureAtLeastTwoChoices(q);
      const card = document.createElement('div');
      card.className = 'q-card';

      const header = document.createElement('div');
      header.className = 'q-header';
      const title = document.createElement('div');
      title.className = 'q-title';
      title.textContent = `Câu ${qi+1}`;
      const actions = document.createElement('div');
      actions.className = 'q-actions';
      const btnAddChoice = document.createElement('button');
      btnAddChoice.className = 'btn';
      btnAddChoice.textContent = '+ Thêm lựa chọn';
      btnAddChoice.onclick = () => { q.choices.push({ text:'', explanation:'', correct: false }); renderEditor(); };
      const btnDeleteQ = document.createElement('button');
      btnDeleteQ.className = 'btn';
      btnDeleteQ.textContent = 'Xoá câu';
      btnDeleteQ.onclick = () => { quiz.questions.splice(qi,1); renderEditor(); };
      actions.append(btnAddChoice, btnDeleteQ);
      header.append(title, actions);

      const qInput = document.createElement('textarea');
      qInput.className = 'textarea';
      qInput.placeholder = 'Nhập nội dung câu hỏi...';
      qInput.value = q.text || '';
      qInput.oninput = (e)=>{ q.text = e.target.value; };

      const small = document.createElement('div');
      small.className = 'small';
      small.textContent = 'Chọn 1 đáp án đúng';

      const choicesWrap = document.createElement('div');

      q.choices.forEach((c, ci)=>{
        const row = document.createElement('div');
        row.className = 'choice-row';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `correct-${qi}`;
        radio.checked = !!c.correct;
        radio.onchange = ()=>{
          q.choices.forEach((c2)=> c2.correct = false);
          c.correct = true;
        };

        const main = document.createElement('div');
        main.className = 'choice-main';

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = `Lựa chọn ${ci+1}`;

        const input = document.createElement('input');
        input.className = 'input';
        input.placeholder = 'Nội dung lựa chọn...';
        input.value = c.text || '';
        input.oninput = (e)=>{ c.text = e.target.value; };

        const btnRemove = document.createElement('button');
        btnRemove.className = 'btn';
        btnRemove.textContent = 'Xoá';
        btnRemove.onclick = ()=>{
          if(q.choices.length <= 2){ alert('Mỗi câu cần tối thiểu 2 lựa chọn'); return; }
          const removingCorrect = c.correct;
          q.choices.splice(ci,1);
          if(removingCorrect){
            // Set first as correct if none marked
            if(!q.choices.some(x=>x.correct)){
              q.choices[0].correct = true;
            }
          }
          renderEditor();
        };

        main.append(badge, input, btnRemove);

        const exp = document.createElement('textarea');
        exp.className = 'textarea';
        exp.placeholder = 'Giải thích (tuỳ chọn)';
        exp.value = c.explanation || '';
        exp.oninput = (e)=>{ c.explanation = e.target.value; };

        row.append(radio, main);
        choicesWrap.append(row);
        const expRow = document.createElement('div');
        expRow.style.marginLeft = '32px';
        expRow.append(exp);
        choicesWrap.append(expRow);
        const divider = document.createElement('div');
        divider.className = 'divider';
        choicesWrap.append(divider);
      });

      card.append(header, qInput, small, choicesWrap);
      editor.append(card);
    });

    editStatus.textContent = quiz.questions.length ? `Đang soạn ${quiz.questions.length} câu hỏi` : 'Chưa có câu hỏi';
  }

  // Test rendering
  function renderTestQuestion(){
    const total = quiz.questions.length;
    testProgress.textContent = `Câu ${testIndex+1}/${total}`;
    const q = quiz.questions[testIndex];
    testQuestion.textContent = q.text || '(Không có nội dung)';
    testChoices.innerHTML = '';
    q.choices.forEach((c, ci) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn' + (answers[testIndex] === ci ? ' selected' : '');
      btn.textContent = c.text || `(Lựa chọn ${ci+1})`;
      btn.onclick = () => { answers[testIndex] = ci; renderTestQuestion(); };
      testChoices.append(btn);
    });

    btnPrevQ.disabled = (testIndex === 0);
    btnNextQ.disabled = (testIndex === total-1);
  }

  function startTest(){
    const err = validateQuiz(quiz);
    if(err){ alert(err); return; }
    answers = new Array(quiz.questions.length).fill(null);
    testIndex = 0;
    testTitle.textContent = quiz.title || 'Bài kiểm tra';
    testStage.classList.remove('hidden');
    renderTestQuestion();
  }

  function computeResult(){
    let correct = 0;
    const details = quiz.questions.map((q, qi) => {
      const correctIndex = q.choices.findIndex(c=>c.correct);
      const user = answers[qi];
      const ok = user === correctIndex;
      if(ok) correct++;
      return { question: q.text, correctIndex, userIndex: user, ok, choices: q.choices };
    });
    return { total: quiz.questions.length, correct, details };
  }

  function renderResult(){
    const r = computeResult();
    resultSummary.innerHTML = `<div><strong>Tổng điểm:</strong> ${r.correct}/${r.total}</div>`;
    resultDetail.innerHTML = '';
    r.details.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'detail-card';
      const h = document.createElement('div');
      h.innerHTML = `<strong>Câu ${i+1}:</strong> ${escapeHtml(d.question || '')}`;
      const s = document.createElement('div');
      s.className = d.ok ? 'correct' : 'incorrect';
      s.textContent = d.ok ? 'Đúng' : 'Sai';
      const list = document.createElement('div');
      list.style.marginTop = '8px';
      d.choices.forEach((c, ci)=>{
        const isCorrect = (ci === d.correctIndex);
        const isPicked = (ci === d.userIndex);

        const line = document.createElement('div');
        line.className = 'ans-line' + (isCorrect ? ' is-correct' : '') + (isPicked ? ' is-picked' : '');

        const head = document.createElement('div');
        head.className = 'ans-head';

        const text = document.createElement('div');
        text.className = 'ans-text';
        text.textContent = c.text || '';

        head.appendChild(text);

        if(isCorrect){
          const pillC = document.createElement('span');
          pillC.className = 'pill pill-correct';
          pillC.textContent = 'Đáp án đúng';
          head.appendChild(pillC);
        }
        if(isPicked){
          const pillP = document.createElement('span');
          pillP.className = 'pill ' + (isCorrect ? 'pill-picked' : 'pill-wrong');
          pillP.textContent = 'Bạn chọn';
          head.appendChild(pillP);
        }

        line.appendChild(head);

        if(c.explanation){
          const ex = document.createElement('div');
          ex.className = 'exp';
          ex.textContent = c.explanation;
          line.appendChild(ex);
        }

        list.appendChild(line);
      });
      card.append(h, s, list);
      resultDetail.append(card);
    });
  }

  async function refreshGh(container){
    container.innerHTML = '<div class="small">Đang tải danh sách...</div>';
    try{
      const items = await fetchGithubJsonList();
      renderGhList(container, items);
    }catch(e){
      container.innerHTML = '<div class="small">Không tải được danh sách.</div>';
    }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  // Navigation
  function setMode(m){
    mode = m;
    [tabEdit, tabTest, tabResult].forEach(t => t.classList.remove('active'));
    viewEdit.classList.add('hidden');
    viewTest.classList.add('hidden');
    viewResult.classList.add('hidden');

    if(m==='edit'){
      tabEdit.classList.add('active');
      viewEdit.classList.remove('hidden');
      tabResult.disabled = true;
    } else if(m==='test'){
      tabTest.classList.add('active');
      viewTest.classList.remove('hidden');
      tabResult.disabled = true;
    } else if(m==='result'){
      tabResult.classList.add('active');
      viewResult.classList.remove('hidden');
      tabResult.disabled = false;
    }
  }

  // Events - tabs
  tabEdit.onclick = ()=> setMode('edit');
  tabTest.onclick = ()=> setMode('test');

  // Editor events
  btnNewQuestion.onclick = () => {
    const q = { 
      text: '', 
      choices: [
        { text: '', explanation: '', correct: true },
        { text: '', explanation: '', correct: false }
      ] 
    };
    quiz.questions.push(q);
    renderEditor();
  };

  if(btnClearPaste){
    btnClearPaste.onclick = ()=>{ if(pasteJsonBox) pasteJsonBox.value = ''; };
  }

  btnSaveJson.onclick = () => {
    const err = validateQuiz(quiz);
    if(err){ alert(err); return; }
    const out = JSON.stringify(quiz, null, 2);
    const name = (quiz.title ? slugify(quiz.title) : 'quiz') + '.json';
    download(name, out);
  };

  if(btnExportStandalone){
    btnExportStandalone.onclick = () => {
      const err = validateQuiz(quiz);
      if(err){ alert(err); return; }
      const html = buildStandaloneHtml(quiz);
      const name = (quiz.title ? slugify(quiz.title) : 'quiz') + '-standalone.html';
      download(name, html);
    };
  }

  // Keep track who triggered file open to read checkbox state appropriately
  let openContext = 'edit'; // 'edit' | 'test' | 'results'
  
  // Set up event handlers for loading JSON files
  btnLoadJson.onclick = () => { 
    openContext = 'edit'; 
    fileOpen.click(); 
  };
  
  if(btnLoadJsonTest) { 
    btnLoadJsonTest.onclick = () => { 
      openContext = 'test'; 
      fileOpen.click(); 
    }; 
  }
  
  if(btnLoadResultsJson) {
    btnLoadResultsJson.onclick = () => { 
      openContext = 'results'; 
      fileOpenResults.click(); 
    };
  }

  // Handle loading test results JSON
  fileOpenResults.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const resultData = JSON.parse(String(reader.result));
        
        // Check if this is a results file (should have answers array and quiz data)
        if (resultData.answers && resultData.quiz) {
          // Validate the quiz data
          const err = validateQuiz(resultData.quiz);
          if (err) { 
            alert('Lỗi dữ liệu câu hỏi: ' + err); 
            return; 
          }
          
          // Set the quiz data
          quiz = resultData.quiz;
          
          // Set the answers if the length matches
          if (resultData.answers.length === quiz.questions.length) {
            answers = resultData.answers;
            // Go directly to the result view to show the results
            setMode('result');
            renderResult();
          } else {
            alert('Số lượng câu trả lời không khớp với số câu hỏi.');
          }
        } else {
          alert('Đây không phải file kết quả hợp lệ. File cần chứa dữ liệu câu hỏi và đáp án.');
        }
      } catch(err) {
        console.error('Lỗi khi đọc file kết quả:', err);
        alert('Lỗi khi đọc file kết quả: ' + (err.message || 'Dữ liệu không hợp lệ'));
      }
    };
    reader.readAsText(file);
    // Reset the input to allow selecting the same file again
    e.target.value = '';
  };

  // Handle loading quiz JSON
  fileOpen.onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(String(reader.result));
        const err = validateQuiz(data);
        if(err){ alert('Lỗi dữ liệu: ' + err); return; }
        const appendMode = (openContext === 'edit' ? (chkAppend && chkAppend.checked) : (chkAppendTest && chkAppendTest.checked)) && quiz.questions.length > 0;
        if(appendMode){
          const addCount = Array.isArray(data.questions) ? data.questions.length : 0;
          if(addCount === 0){ alert('File không có câu hỏi để thêm'); return; }
          quiz.questions.push(...data.questions);
          renderEditor();
          const msg = `Đã thêm ${addCount} câu từ: ${file.name}`;
          editStatus.textContent = msg;
          if(!testStage.classList.contains('hidden')){
            testStatus.textContent = msg + '. Hãy bấm "Làm lại" để thi với đề mới.';
          }
        } else {
          quiz = data;
          renderEditor();
          editStatus.textContent = `Đã mở: ${file.name}`;
          // sync test view like local load behavior
          testTitle.textContent = quiz.title || 'Bài kiểm tra';
          testStage.classList.add('hidden');
          testStatus.textContent = '';
        }
      }catch(err){
        alert('Không đọc được JSON');
      }
    };
    reader.readAsText(file);
    // reset input to allow re-open same file
    e.target.value = '';
  };

  // Test events
  btnStartTest.onclick = () => {
    if(!quiz.questions.length){ alert('Chưa có câu hỏi'); return; }
    setMode('test');
    startTest();
  };

  btnPrevQ.onclick = () => { if(testIndex>0){ testIndex--; renderTestQuestion(); } };
  btnNextQ.onclick = () => { if(testIndex<quiz.questions.length-1){ testIndex++; renderTestQuestion(); } };

  btnFinish.onclick = () => {
    const unanswered = answers.findIndex(a => a === null);
    if(unanswered !== -1){
      if(!confirm('Vẫn còn câu chưa chọn. Bạn vẫn muốn nộp bài?')) return;
    }
    setMode('result');
    renderResult();
  };

  // Result events
  btnBackToEdit.onclick = () => setMode('edit');
  btnRetake.onclick = () => { setMode('test'); startTest(); };
  btnExportAnswers.onclick = () => {
    // Export complete quiz data and user answers for later review
    const exportData = {
      quiz: quiz,
      answers: answers,
      timestamp: new Date().toISOString()
    };
    const filename = (quiz.title ? slugify(quiz.title) : 'quiz') + '-result.json';
    download(filename, JSON.stringify(exportData, null, 2));
  };

  // GitHub listing and open/append
  const GH_OWNER = 'albertthai-alt';
  const GH_REPO = 'browse';
  const GH_PATH = 'mcq-tester';

  async function fetchGithubJsonList(){
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PATH}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if(!res.ok) throw new Error('Không tải được danh sách GitHub');
    const data = await res.json();
    return (Array.isArray(data) ? data : []).filter(item => item.type === 'file' && /\.json$/i.test(item.name));
  }

  function renderGhList(container, items){
    container.innerHTML = '';
    if(!items.length){
      const empty = document.createElement('div');
      empty.className = 'small';
      empty.textContent = 'Không có file .json trong thư mục.';
      container.appendChild(empty);
      return;
    }
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.style.gap = '8px 12px';
    items.forEach(it => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = it.name;
      a.style.fontWeight = '400';
      a.onclick = async (ev) => {
        ev.preventDefault();
        const inTest = !viewTest.classList.contains('hidden');
        const useAppend = (inTest ? (chkAppendTest && chkAppendTest.checked) : (chkAppend && chkAppend.checked)) && quiz.questions.length > 0;
        if(useAppend){
          setInfoStatus(`Đang thêm từ GitHub: ${it.name} ...`);
          await appendFromGithubPath(it.path, it.name);
        } else {
          setInfoStatus(`Đang mở từ GitHub: ${it.name} ...`);
          await openFromGithubPath(it.path, it.name);
        }
      };
      wrap.appendChild(a);
    });
    container.appendChild(wrap);
  }

  // Backward-compatible raw URL open (not used by list now)
  async function openFromUrl(url, displayName){
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error('Lỗi tải JSON');
      const data = await res.json();
      const err = validateQuiz(data);
      if(err){ alert(err); return; }
      quiz = data;
      renderEditor();
      editStatus.textContent = `Đã mở từ GitHub: ${displayName}`;
      // sync test view like local load behavior
      testTitle.textContent = quiz.title || 'Bài kiểm tra';
      testStage.classList.add('hidden');
      testStatus.textContent = '';
      // switch to Edit view to reflect loaded data; keep current mode otherwise
    }catch(e){ alert('Không mở được JSON từ GitHub'); }
  }

  // Backward-compatible raw URL append (not used by list now)
  async function appendFromUrl(url, displayName){
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error('Lỗi tải JSON');
      const data = await res.json();
      const err = validateQuiz(data);
      if(err){ alert(err); return; }
      const addCount = Array.isArray(data.questions) ? data.questions.length : 0;
      if(addCount === 0){ alert('File không có câu hỏi để thêm'); return; }
      quiz.questions.push(...data.questions);
      renderEditor();
      const msg = `Đã thêm ${addCount} câu từ GitHub: ${displayName}`;
      editStatus.textContent = msg;
      if(!testStage.classList.contains('hidden')){
        testStatus.textContent = msg + '. Hãy bấm "Làm lại" để thi với đề mới.';
      }
    }catch(e){ alert('Không thêm được JSON từ GitHub'); }
  }

  // New: Fetch via GitHub Contents API to avoid CORS issues
  async function fetchGithubFileContent(path){
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if(!res.ok){
      const txt = await res.text().catch(()=> '');
      throw new Error(`Không tải được file từ GitHub (HTTP ${res.status}). ${txt}`);
    }
    const meta = await res.json();
    if(!meta || meta.encoding !== 'base64' || !meta.content) throw new Error('Nội dung file không hợp lệ');
    const utf8 = base64ToUtf8(meta.content);
    return JSON.parse(utf8);
  }

  function base64ToUtf8(b64){
    // Remove possible newlines from GitHub content
    const clean = b64.replace(/\n/g, '');
    const bin = atob(clean);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++){ bytes[i] = bin.charCodeAt(i); }
    const dec = new TextDecoder('utf-8');
    return dec.decode(bytes);
  }

  async function openFromGithubPath(path, displayName){
    try{
      const data = await fetchGithubFileContent(path);
      const err = validateQuiz(data);
      if(err){ alert(err); return; }
      quiz = data;
      renderEditor();
      editStatus.textContent = `Đã mở từ GitHub: ${displayName}`;
      testTitle.textContent = quiz.title || 'Bài kiểm tra';
      testStage.classList.add('hidden');
      testStatus.textContent = '';
      setInfoStatus(`Đã mở từ GitHub: ${displayName}`);
    }catch(e){ alert('Không mở được JSON từ GitHub'); }
  }

  async function appendFromGithubPath(path, displayName){
    try{
      const data = await fetchGithubFileContent(path);
      const err = validateQuiz(data);
      if(err){ alert(err); return; }
      const addCount = Array.isArray(data.questions) ? data.questions.length : 0;
      if(addCount === 0){ alert('File không có câu hỏi để thêm'); return; }
      quiz.questions.push(...data.questions);
      renderEditor();
      const msg = `Đã thêm ${addCount} câu từ GitHub: ${displayName}`;
      editStatus.textContent = msg;
      if(!testStage.classList.contains('hidden')){
        testStatus.textContent = msg + '. Hãy bấm "Làm lại" để thi với đề mới.';
      }
      setInfoStatus(msg);
    }catch(e){ alert('Không thêm được JSON từ GitHub'); }
  }

  function toggleGhPanel(selectEl, panelEl){
    if(!selectEl || !panelEl) return;
    const val = selectEl.value;
    if(val === 'github'){
      panelEl.classList.remove('hidden');
    } else {
      panelEl.classList.add('hidden');
    }
  }

  if(btnGhRefreshEdit && ghListEdit){ btnGhRefreshEdit.onclick = ()=> refreshGh(ghListEdit); }
  if(btnGhRefreshTest && ghListTest){ btnGhRefreshTest.onclick = ()=> refreshGh(ghListTest); }
  // Auto load GitHub lists on load
  if(ghListEdit){ refreshGh(ghListEdit); }
  if(ghListTest){ refreshGh(ghListTest); }

  function slugify(s){
    return (s||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  // Build a single-file HTML for testing only (no editing)
  function buildStandaloneHtml(qz){
    const escapedTitle = (qz.title || 'Bài kiểm tra');
    const data = JSON.stringify(qz);
    const css = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e6ecff} .wrap{max-width:860px;margin:0 auto;padding:16px} .header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;border-bottom:1px solid #263055} .brand{font-weight:700} .btn{background:#172042;color:#e6ecff;border:1px solid #2a3564;padding:8px 12px;border-radius:8px;cursor:pointer} .btn.primary{background:#3b5bfd;border-color:#3b5bfd;color:#fff} .panel{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px;margin-top:12px} .progress{color:#9fb0ff;margin-bottom:8px} .question{font-weight:600;margin:8px 0} .choices{display:grid;gap:8px} .choice-btn{text-align:left;border:1px solid #2a3564;background:#0b1330;color:#e6ecff;padding:10px 12px;border-radius:8px;cursor:pointer} .choice-btn.selected{outline:2px solid #3b5bfd} .controls{display:flex;gap:8px;margin-top:12px} .summary{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px;margin-top:12px} .result-detail{display:flex;flex-direction:column;gap:12px;margin-top:12px} .detail-card{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px} .correct{color:#7bff95} .incorrect{color:#ff7b88} .exp{color:#9fb0ff;font-size:13px;margin-top:4px} .ans-line{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px solid #2a3564;border-radius:8px;background:#0b1330} .ans-head{display:flex;align-items:center;gap:8px} .ans-text{flex:1} .pill{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid transparent} .pill-correct{background:rgba(30,180,120,.15);color:#7bff95;border-color:rgba(30,180,120,.35)} .pill-picked{background:rgba(59,91,253,.15);color:#b9c6ff;border-color:rgba(59,91,253,.35)} .pill-wrong{background:rgba(255,60,60,.15);color:#ff9aa5;border-color:rgba(255,60,60,.35)} .ans-line.is-correct{border-color:rgba(30,180,120,.6);background:rgba(20,80,60,.15)} .ans-line.is-picked:not(.is-correct){border-color:rgba(255,60,60,.6);background:rgba(80,20,30,.18)}`;
    const js = `(()=>{const data=${data};let idx=0;let answers=new Array(data.questions.length).fill(null);const $=s=>document.querySelector(s);const titleEl=$('#tTitle');const stage=$('#stage');const prog=$('#prog');const qEl=$('#q');const choices=$('#choices');const btnPrev=$('#prev');const btnNext=$('#next');const btnFinish=$('#finish');const btnStart=$('#start');const resultSum=$('#rSum');const resultDetail=$('#rDetail');titleEl.textContent=data.title||'Bài kiểm tra';btnStart.onclick=()=>{stage.classList.remove('hide');renderQ();};function renderQ(){const total=data.questions.length;prog.textContent='Câu '+(idx+1)+'/'+total;const q=data.questions[idx];qEl.textContent=q.text||'(Không có nội dung)';choices.innerHTML='';q.choices.forEach((c,ci)=>{const b=document.createElement('button');b.className='choice-btn'+(answers[idx]===ci?' selected':'');b.textContent=c.text||'(Lựa chọn '+(ci+1)+')';b.onclick=()=>{answers[idx]=ci;renderQ();};choices.append(b);});btnPrev.disabled=(idx===0);btnNext.disabled=(idx===total-1);}btnPrev.onclick=()=>{if(idx>0){idx--;renderQ();}};btnNext.onclick=()=>{if(idx<data.questions.length-1){idx++;renderQ();}};btnFinish.onclick=()=>{const un=answers.findIndex(a=>a===null);if(un!==-1){if(!confirm('Vẫn còn câu chưa chọn. Bạn vẫn muốn nộp bài?'))return;}renderResult();document.body.classList.add('done');};function renderResult(){let correct=0;const details=data.questions.map((q,qi)=>{const ci=q.choices.findIndex(c=>c.correct);const ui=answers[qi];const ok=ui===ci;if(ok)correct++;return{question:q.text,correctIndex:ci,userIndex:ui,ok,choices:q.choices};});resultSum.innerHTML='<div><strong>Tổng điểm:</strong> '+correct+'/'+data.questions.length+'</div>';resultDetail.innerHTML='';details.forEach((d,i)=>{const card=document.createElement('div');card.className='detail-card';const h=document.createElement('div');h.innerHTML='<strong>Câu '+(i+1)+':</strong> '+escapeHtml(d.question||'');const s=document.createElement('div');s.className=d.ok?'correct':'incorrect';s.textContent=d.ok?'Đúng':'Sai';const list=document.createElement('div');list.style.marginTop='8px';d.choices.forEach((c,ci)=>{const isC=(ci===d.correctIndex),isP=(ci===d.userIndex);const line=document.createElement('div');line.className='ans-line'+(isC?' is-correct':'')+(isP?' is-picked':'');const head=document.createElement('div');head.className='ans-head';const text=document.createElement('div');text.className='ans-text';text.textContent=c.text||'';head.appendChild(text);if(isC){const t=document.createElement('span');t.className='pill pill-correct';t.textContent='Đáp án đúng';head.appendChild(t);}if(isP){const t=document.createElement('span');t.className='pill '+(isC?'pill-picked':'pill-wrong');t.textContent='Bạn chọn';head.appendChild(t);}line.appendChild(head);if(c.explanation){const ex=document.createElement('div');ex.className='exp';ex.textContent=c.explanation;line.appendChild(ex);}list.appendChild(line);});card.append(h,s,list);resultDetail.append(card);});}function escapeHtml(str){return String(str).replace(/[&<>\"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]));}})();`;
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${escapeHtml(escapedTitle)} - Standalone</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23ff9f43'/%3E%3Cpath d='M14 20h36v6H14zM14 30h24v6H14zM14 40h16v6H14z' fill='%23ffffff'/%3E%3C/svg%3E"/><style>${css}</style></head><body><div class="wrap"><div class="header"><div class="brand">MCQ Test - Standalone</div><button id="start" class="btn primary">Bắt đầu</button></div><div id="stage" class="panel hide"><div class="progress" id="prog"></div><div class="question" id="q"></div><div class="choices" id="choices"></div><div class="controls"><button id="prev" class="btn">◀ Trước</button><button id="next" class="btn">Tiếp ▶</button><button id="finish" class="btn primary">Nộp bài</button></div></div><div class="summary"><div id="tTitle" style="margin-bottom:8px;color:#cfd9ff;font-weight:600"></div><div id="rSum"></div><div id="rDetail" class="result-detail"></div></div></div><script>${js}</script></body></html>`;
  }

  // Init with an empty first question to guide
  if(quiz.questions.length === 0){
    quiz = { title: '', questions: [] };
  }
  renderEditor();
  // Default to Test mode as requested
  setMode('test');
})();
