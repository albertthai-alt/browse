(function(){
  // Data model
  let quiz = { title: '', questions: [] };
  let mode = 'edit';
  let testIndex = 0;
  let practiceIndex = 0;
  let answers = []; // array of arrays - each question can have multiple user answers
  let practiceAnswers = []; // array of arrays for practice mode
  let showAnswersMode = false; // track if answers are shown in practice

  // Elements
  const $ = (sel) => document.querySelector(sel);
  const editor = $('#editor');
  const titleInput = $('#titleInput');

  const tabEdit = $('#tabEdit');
  const tabPractice = $('#tabPractice');
  const tabTest = $('#tabTest');
  const tabResult = $('#tabResult');

  const viewEdit = $('#viewEdit');
  const viewPractice = $('#viewPractice');
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

  const practiceTitle = $('#practiceTitle');
  const btnStartPractice = $('#btnStartPractice');
  const btnLoadJsonPractice = $('#btnLoadJsonPractice');
  const practiceStage = $('#practiceStage');
  const practiceProgress = $('#practiceProgress');
  const practiceQuestion = $('#practiceQuestion');
  const practiceChoices = $('#practiceChoices');
  const btnPrevQPractice = $('#btnPrevQPractice');
  const btnNextQPractice = $('#btnNextQPractice');
  const btnShowAnswers = $('#btnShowAnswers');
  const practiceStatus = $('#practiceStatus');

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

  function ensureAtLeastOneAnswer(q){
    if(!q.answers || q.answers.length === 0){
      q.answers = [{ text: '', explanation: '' }];
    }
  }

  function validateQuiz(qz){
    if(!qz || typeof qz !== 'object') return 'File không đúng định dạng';
    if(!Array.isArray(qz.questions)) return 'Thiếu mảng questions';
    for(let i=0;i<qz.questions.length;i++){
      const q = qz.questions[i];
      if(typeof q.text !== 'string') return `Câu ${i+1} thiếu nội dung câu hỏi`;
      if(!Array.isArray(q.answers) || q.answers.length < 1) return `Câu ${i+1} phải có ít nhất 1 đáp án`;
      for(let j=0;j<q.answers.length;j++){
        const a = q.answers[j];
        if(typeof a.text !== 'string') return `Câu ${i+1} - đáp án ${j+1} thiếu nội dung`;
        if(a.explanation != null && typeof a.explanation !== 'string') return `Câu ${i+1} - đáp án ${j+1} giải thích phải là chuỗi`;
      }
    }
    return null;
  }

  // Rendering - Editor
  function renderEditor(){
    titleInput.value = quiz.title || '';
    editor.innerHTML = '';
    quiz.questions.forEach((q, qi) => {
      ensureAtLeastOneAnswer(q);
      const card = document.createElement('div');
      card.className = 'q-card';

      const header = document.createElement('div');
      header.className = 'q-header';
      const title = document.createElement('div');
      title.className = 'q-title';
      title.textContent = `Câu ${qi+1}`;
      const actions = document.createElement('div');
      actions.className = 'q-actions';
      const btnAddAnswer = document.createElement('button');
      btnAddAnswer.className = 'btn';
      btnAddAnswer.textContent = '+ Thêm đáp án';
      btnAddAnswer.onclick = () => { q.answers.push({ text:'', explanation:'' }); renderEditor(); };
      const btnDeleteQ = document.createElement('button');
      btnDeleteQ.className = 'btn';
      btnDeleteQ.textContent = 'Xoá câu';
      btnDeleteQ.onclick = () => { quiz.questions.splice(qi,1); renderEditor(); };
      actions.append(btnAddAnswer, btnDeleteQ);
      header.append(title, actions);

      const qInput = document.createElement('textarea');
      qInput.className = 'textarea';
      qInput.placeholder = 'Nhập nội dung câu hỏi...';
      qInput.value = q.text || '';
      qInput.oninput = (e)=>{ q.text = e.target.value; };

      const small = document.createElement('div');
      small.className = 'small';
      small.textContent = 'Các đáp án được chấp nhận (người dùng nhập trùng 1 trong các đáp án)';

      const answersWrap = document.createElement('div');

      q.answers.forEach((a, ai)=>{
        const row = document.createElement('div');
        row.style.marginTop = '8px';

        const main = document.createElement('div');
        main.className = 'choice-main';

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = `Đáp án ${ai+1}`;

        const input = document.createElement('input');
        input.className = 'input';
        input.placeholder = 'Nội dung đáp án...';
        input.value = a.text || '';
        input.oninput = (e)=>{ a.text = e.target.value; };

        const btnRemove = document.createElement('button');
        btnRemove.className = 'btn';
        btnRemove.textContent = 'Xoá';
        btnRemove.onclick = ()=>{
          if(q.answers.length <= 1){ alert('Mỗi câu cần tối thiểu 1 đáp án'); return; }
          q.answers.splice(ai,1);
          renderEditor();
        };

        main.append(badge, input, btnRemove);
        row.append(main);

        const exp = document.createElement('textarea');
        exp.className = 'textarea';
        exp.placeholder = 'Giải thích (tuỳ chọn)';
        exp.value = a.explanation || '';
        exp.style.marginTop = '8px';
        exp.oninput = (e)=>{ a.explanation = e.target.value; };

        row.append(exp);
        answersWrap.append(row);
        
        const divider = document.createElement('div');
        divider.className = 'divider';
        answersWrap.append(divider);
      });

      card.append(header, qInput, small, answersWrap);
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
    
    // Ensure answers array exists for this question
    if(!answers[testIndex]) answers[testIndex] = [];
    
    // Display list of user's answers
    const answersList = document.createElement('div');
    answersList.style.marginTop = '12px';
    answersList.style.marginBottom = '12px';
    
    if(answers[testIndex].length > 0){
      const listTitle = document.createElement('div');
      listTitle.className = 'small';
      listTitle.textContent = 'Các câu trả lời của bạn:';
      listTitle.style.marginBottom = '8px';
      answersList.append(listTitle);
      
      answers[testIndex].forEach((ans, idx) => {
        const ansItem = document.createElement('div');
        ansItem.style.display = 'flex';
        ansItem.style.alignItems = 'center';
        ansItem.style.gap = '8px';
        ansItem.style.padding = '6px 10px';
        ansItem.style.background = '#0b1330';
        ansItem.style.border = '1px solid #2a3564';
        ansItem.style.borderRadius = '6px';
        ansItem.style.marginBottom = '6px';
        
        const ansText = document.createElement('div');
        ansText.style.flex = '1';
        ansText.textContent = `${idx+1}. ${ans}`;
        
        const btnDel = document.createElement('button');
        btnDel.className = 'btn';
        btnDel.textContent = '✕';
        btnDel.style.padding = '4px 8px';
        btnDel.style.fontSize = '12px';
        btnDel.onclick = () => {
          answers[testIndex].splice(idx, 1);
          renderTestQuestion();
        };
        
        ansItem.append(ansText, btnDel);
        answersList.append(ansItem);
      });
    }
    
    testChoices.append(answersList);
    
    // Create text input for new answer
    const inputWrap = document.createElement('div');
    inputWrap.style.marginTop = '12px';
    
    const label = document.createElement('div');
    label.className = 'small';
    label.textContent = 'Nhập câu trả lời (Enter để thêm):';
    label.style.marginBottom = '8px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input';
    input.placeholder = 'Nhập đáp án và nhấn Enter...';
    input.style.width = '100%';
    input.style.padding = '10px 12px';
    
    input.onkeydown = (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        const val = input.value.trim();
        if(val){
          answers[testIndex].push(val);
          renderTestQuestion();
        }
      }
    };
    
    inputWrap.append(label, input);
    testChoices.append(inputWrap);
    
    // Auto focus on input
    setTimeout(() => input.focus(), 0);

    btnPrevQ.disabled = (testIndex === 0);
    btnNextQ.disabled = (testIndex === total-1);
  }

  // Practice rendering
  function renderPracticeQuestion(){
    const total = quiz.questions.length;
    practiceProgress.textContent = `Câu ${practiceIndex+1}/${total}`;
    const q = quiz.questions[practiceIndex];
    practiceQuestion.textContent = q.text || '(Không có nội dung)';
    practiceChoices.innerHTML = '';
    
    // Ensure answers array exists for this question
    if(!practiceAnswers[practiceIndex]) practiceAnswers[practiceIndex] = [];
    
    const acceptableAnswers = q.answers.map(a => a.text.toLowerCase().trim());
    
    // Display list of user's answers with immediate feedback
    const answersList = document.createElement('div');
    answersList.style.marginTop = '12px';
    answersList.style.marginBottom = '12px';
    
    if(practiceAnswers[practiceIndex].length > 0){
      const listTitle = document.createElement('div');
      listTitle.className = 'small';
      listTitle.textContent = 'Các câu trả lời của bạn:';
      listTitle.style.marginBottom = '8px';
      answersList.append(listTitle);
      
      practiceAnswers[practiceIndex].forEach((ans, idx) => {
        const normalized = ans.toLowerCase().trim();
        const isCorrect = acceptableAnswers.includes(normalized);
        
        const ansItem = document.createElement('div');
        ansItem.style.display = 'flex';
        ansItem.style.alignItems = 'center';
        ansItem.style.gap = '8px';
        ansItem.style.padding = '6px 10px';
        ansItem.style.border = '1px solid #2a3564';
        ansItem.style.borderRadius = '6px';
        ansItem.style.marginBottom = '6px';
        ansItem.style.background = isCorrect ? 'rgba(30, 180, 120, 0.1)' : 'rgba(255, 60, 60, 0.1)';
        ansItem.style.borderColor = isCorrect ? 'rgba(30, 180, 120, 0.4)' : 'rgba(255, 60, 60, 0.4)';
        
        const ansText = document.createElement('div');
        ansText.style.flex = '1';
        ansText.textContent = `${idx+1}. ${ans}`;
        
        const badge = document.createElement('span');
        badge.className = 'pill ' + (isCorrect ? 'pill-correct' : 'pill-wrong');
        badge.textContent = isCorrect ? '✓ Đúng' : '✗ Sai';
        
        const btnDel = document.createElement('button');
        btnDel.className = 'btn';
        btnDel.textContent = '✕';
        btnDel.style.padding = '4px 8px';
        btnDel.style.fontSize = '12px';
        btnDel.onclick = () => {
          practiceAnswers[practiceIndex].splice(idx, 1);
          renderPracticeQuestion();
        };
        
        ansItem.append(ansText, badge, btnDel);
        answersList.append(ansItem);
      });
    }
    
    practiceChoices.append(answersList);
    
    // Show correct answers if button was clicked
    if(showAnswersMode){
      const correctDiv = document.createElement('div');
      correctDiv.style.marginTop = '12px';
      correctDiv.style.padding = '12px';
      correctDiv.style.background = 'rgba(30, 180, 120, 0.1)';
      correctDiv.style.border = '1px solid rgba(30, 180, 120, 0.4)';
      correctDiv.style.borderRadius = '8px';
      
      const correctTitle = document.createElement('div');
      correctTitle.style.fontWeight = '600';
      correctTitle.style.marginBottom = '8px';
      correctTitle.textContent = 'Các đáp án đúng:';
      correctDiv.append(correctTitle);
      
      q.answers.forEach((a, ai) => {
        const aLine = document.createElement('div');
        aLine.style.marginBottom = '4px';
        aLine.textContent = `${ai+1}. ${a.text}`;
        if(a.explanation){
          const exp = document.createElement('div');
          exp.className = 'exp';
          exp.style.marginLeft = '16px';
          exp.textContent = a.explanation;
          aLine.append(document.createElement('br'), exp);
        }
        correctDiv.append(aLine);
      });
      
      practiceChoices.append(correctDiv);
    }
    
    // Create text input for new answer
    const inputWrap = document.createElement('div');
    inputWrap.style.marginTop = '12px';
    
    const label = document.createElement('div');
    label.className = 'small';
    label.textContent = 'Nhập câu trả lời (Enter để thêm):';
    label.style.marginBottom = '8px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input';
    input.placeholder = 'Nhập đáp án và nhấn Enter...';
    input.style.width = '100%';
    input.style.padding = '10px 12px';
    
    input.onkeydown = (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        const val = input.value.trim();
        if(val){
          practiceAnswers[practiceIndex].push(val);
          showAnswersMode = false; // Reset show answers when adding new answer
          renderPracticeQuestion();
        }
      }
    };
    
    inputWrap.append(label, input);
    practiceChoices.append(inputWrap);
    
    // Auto focus on input
    setTimeout(() => input.focus(), 0);

    btnPrevQPractice.disabled = (practiceIndex === 0);
    btnNextQPractice.disabled = (practiceIndex === total-1);
  }

  function startPractice(){
    const err = validateQuiz(quiz);
    if(err){ alert(err); return; }
    practiceAnswers = Array.from({ length: quiz.questions.length }, () => []);
    practiceIndex = 0;
    showAnswersMode = false;
    practiceTitle.textContent = quiz.title || 'Bài thực hành';
    practiceStage.classList.remove('hidden');
    renderPracticeQuestion();
  }

  function startTest(){
    const err = validateQuiz(quiz);
    if(err){ alert(err); return; }
    answers = Array.from({ length: quiz.questions.length }, () => []);
    testIndex = 0;
    testTitle.textContent = quiz.title || 'Bài kiểm tra';
    testStage.classList.remove('hidden');
    renderTestQuestion();
  }

  function computeResult(){
    let totalScore = 0;
    const details = quiz.questions.map((q, qi) => {
      const userAnswers = answers[qi] || [];
      const acceptableAnswers = q.answers.map(a => a.text.toLowerCase().trim());
      
      let correctCount = 0;
      let wrongCount = 0;
      
      const userResults = userAnswers.map(ua => {
        const normalized = ua.toLowerCase().trim();
        const isCorrect = acceptableAnswers.includes(normalized);
        if(isCorrect) correctCount++;
        else wrongCount++;
        return { text: ua, correct: isCorrect };
      });
      
      // Score = (correct - wrong) / total acceptable answers, minimum 0
      const totalAnswers = q.answers.length;
      const score = Math.max(0, (correctCount - wrongCount) / totalAnswers);
      totalScore += score;
      
      return { 
        question: q.text, 
        userAnswers: userResults,
        correctCount,
        wrongCount,
        totalAnswers,
        score,
        answers: q.answers 
      };
    });
    return { total: quiz.questions.length, totalScore, details };
  }

  function renderResult(){
    const r = computeResult();
    const percentage = r.total > 0 ? ((r.totalScore / r.total) * 100).toFixed(2) : 0;
    resultSummary.innerHTML = `<div><strong>Tổng điểm:</strong> ${r.totalScore.toFixed(2)}/${r.total} (${percentage}%)</div>`;
    resultDetail.innerHTML = '';
    r.details.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'detail-card';
      const h = document.createElement('div');
      h.innerHTML = `<strong>Câu ${i+1}:</strong> ${escapeHtml(d.question || '')}`;
      
      const scoreDiv = document.createElement('div');
      scoreDiv.style.marginTop = '8px';
      scoreDiv.innerHTML = `<strong>Điểm:</strong> ${d.score.toFixed(2)}/${1} (Đúng: ${d.correctCount}, Sai: ${d.wrongCount})`;
      scoreDiv.className = d.score >= 0.5 ? 'correct' : 'incorrect';
      
      // Show user's answers
      const userAnswersDiv = document.createElement('div');
      userAnswersDiv.style.marginTop = '8px';
      userAnswersDiv.innerHTML = '<strong>Các câu trả lời của bạn:</strong>';
      
      if(d.userAnswers.length === 0){
        const noAnswer = document.createElement('div');
        noAnswer.style.marginTop = '4px';
        noAnswer.style.color = '#9fb0ff';
        noAnswer.textContent = '(Chưa trả lời)';
        userAnswersDiv.append(noAnswer);
      } else {
        const userList = document.createElement('div');
        userList.style.marginTop = '8px';
        d.userAnswers.forEach((ua, idx) => {
          const uaLine = document.createElement('div');
          uaLine.style.display = 'flex';
          uaLine.style.alignItems = 'center';
          uaLine.style.gap = '8px';
          uaLine.style.padding = '6px 10px';
          uaLine.style.border = '1px solid #2a3564';
          uaLine.style.borderRadius = '6px';
          uaLine.style.marginBottom = '6px';
          uaLine.style.background = ua.correct ? 'rgba(30, 180, 120, 0.1)' : 'rgba(255, 60, 60, 0.1)';
          uaLine.style.borderColor = ua.correct ? 'rgba(30, 180, 120, 0.4)' : 'rgba(255, 60, 60, 0.4)';
          
          const uaText = document.createElement('div');
          uaText.style.flex = '1';
          uaText.textContent = `${idx+1}. ${ua.text}`;
          
          const badge = document.createElement('span');
          badge.className = 'pill';
          badge.className += ua.correct ? ' pill-correct' : ' pill-wrong';
          badge.textContent = ua.correct ? '✓ Đúng' : '✗ Sai';
          
          uaLine.append(uaText, badge);
          userList.append(uaLine);
        });
        userAnswersDiv.append(userList);
      }
      
      // Show acceptable answers
      const acceptableDiv = document.createElement('div');
      acceptableDiv.style.marginTop = '12px';
      acceptableDiv.innerHTML = '<strong>Các đáp án được chấp nhận:</strong>';
      
      const list = document.createElement('div');
      list.style.marginTop = '8px';
      d.answers.forEach((a, ai)=>{
        const line = document.createElement('div');
        line.className = 'ans-line';
        line.style.marginBottom = '8px';

        const head = document.createElement('div');
        head.className = 'ans-head';

        const text = document.createElement('div');
        text.className = 'ans-text';
        text.textContent = a.text || '';

        head.appendChild(text);

        line.appendChild(head);

        if(a.explanation){
          const ex = document.createElement('div');
          ex.className = 'exp';
          ex.textContent = a.explanation;
          line.appendChild(ex);
        }

        list.appendChild(line);
      });
      
      card.append(h, scoreDiv, userAnswersDiv, acceptableDiv, list);
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
    [tabEdit, tabPractice, tabTest, tabResult].forEach(t => t.classList.remove('active'));
    viewEdit.classList.add('hidden');
    viewPractice.classList.add('hidden');
    viewTest.classList.add('hidden');
    viewResult.classList.add('hidden');

    if(m==='edit'){
      tabEdit.classList.add('active');
      viewEdit.classList.remove('hidden');
      tabResult.disabled = true;
    } else if(m==='practice'){
      tabPractice.classList.add('active');
      viewPractice.classList.remove('hidden');
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
  tabPractice.onclick = ()=> setMode('practice');
  tabTest.onclick = ()=> setMode('test');

  // Editor events
  btnNewQuestion.onclick = () => {
    const q = { 
      text: '', 
      answers: [
        { text: '', explanation: '' }
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
          // sync test and practice views
          testTitle.textContent = quiz.title || 'Bài kiểm tra';
          practiceTitle.textContent = quiz.title || 'Bài thực hành';
          testStage.classList.add('hidden');
          practiceStage.classList.add('hidden');
          testStatus.textContent = '';
          practiceStatus.textContent = '';
        }
      }catch(err){
        alert('Không đọc được JSON');
      }
    };
    reader.readAsText(file);
    // reset input to allow re-open same file
    e.target.value = '';
  };

  // Practice events
  btnStartPractice.onclick = () => {
    if(!quiz.questions.length){ alert('Chưa có câu hỏi'); return; }
    setMode('practice');
    startPractice();
  };

  btnLoadJsonPractice.onclick = () => {
    openContext = 'practice';
    fileOpen.click();
  };

  btnPrevQPractice.onclick = () => { 
    if(practiceIndex>0){ 
      practiceIndex--; 
      showAnswersMode = false;
      btnShowAnswers.textContent = 'Mở đáp án';
      renderPracticeQuestion(); 
    } 
  };
  
  btnNextQPractice.onclick = () => { 
    if(practiceIndex<quiz.questions.length-1){ 
      practiceIndex++; 
      showAnswersMode = false;
      btnShowAnswers.textContent = 'Mở đáp án';
      renderPracticeQuestion(); 
    } 
  };

  btnShowAnswers.onclick = () => {
    showAnswersMode = !showAnswersMode;
    btnShowAnswers.textContent = showAnswersMode ? 'Ẩn đáp án' : 'Mở đáp án';
    renderPracticeQuestion();
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
    const unanswered = answers.findIndex(a => !a || a.length === 0);
    if(unanswered !== -1){
      if(!confirm('Vẫn còn câu chưa trả lời. Bạn vẫn muốn nộp bài?')) return;
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
  const GH_PATH = 'oeq-tester';

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
    const css = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e6ecff} .wrap{max-width:860px;margin:0 auto;padding:16px} .header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;border-bottom:1px solid #263055} .brand{font-weight:700} .btn{background:#172042;color:#e6ecff;border:1px solid #2a3564;padding:8px 12px;border-radius:8px;cursor:pointer} .btn.primary{background:#3b5bfd;border-color:#3b5bfd;color:#fff} .panel{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px;margin-top:12px} .progress{color:#9fb0ff;margin-bottom:8px} .question{font-weight:600;margin:8px 0} .choices{display:grid;gap:8px} .controls{display:flex;gap:8px;margin-top:12px} .summary{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px;margin-top:12px} .result-detail{display:flex;flex-direction:column;gap:12px;margin-top:12px} .detail-card{background:#0f1734;border:1px solid #263055;border-radius:10px;padding:12px} .correct{color:#7bff95} .incorrect{color:#ff7b88} .exp{color:#9fb0ff;font-size:13px;margin-top:4px} .ans-line{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px solid #2a3564;border-radius:8px;background:#0b1330;margin-bottom:8px} .ans-head{display:flex;align-items:center;gap:8px} .ans-text{flex:1} .hide{display:none!important} .small{font-size:13px;color:#9fb0ff} .input{background:#0b1330;border:1px solid #2a3564;color:#e6ecff;padding:10px 12px;border-radius:8px;font-size:14px;width:100%} .pill{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid transparent} .pill-correct{background:rgba(30,180,120,.15);color:#7bff95;border-color:rgba(30,180,120,.35)} .pill-wrong{background:rgba(255,60,60,.15);color:#ff9aa5;border-color:rgba(255,60,60,.35)}`;
    const js = `(()=>{const data=${data};let idx=0;let answers=Array.from({length:data.questions.length},()=>[]);const $=s=>document.querySelector(s);const titleEl=$('#tTitle');const stage=$('#stage');const prog=$('#prog');const qEl=$('#q');const choices=$('#choices');const btnPrev=$('#prev');const btnNext=$('#next');const btnFinish=$('#finish');const btnStart=$('#start');const resultSum=$('#rSum');const resultDetail=$('#rDetail');titleEl.textContent=data.title||'Bài kiểm tra';btnStart.onclick=()=>{stage.classList.remove('hide');renderQ();};function renderQ(){const total=data.questions.length;prog.textContent='Câu '+(idx+1)+'/'+total;const q=data.questions[idx];qEl.textContent=q.text||'(Không có nội dung)';choices.innerHTML='';if(!answers[idx])answers[idx]=[];const ansList=document.createElement('div');ansList.style.marginTop='12px';ansList.style.marginBottom='12px';if(answers[idx].length>0){const lt=document.createElement('div');lt.className='small';lt.textContent='Các câu trả lời của bạn:';lt.style.marginBottom='8px';ansList.append(lt);answers[idx].forEach((a,i)=>{const ai=document.createElement('div');ai.style.display='flex';ai.style.alignItems='center';ai.style.gap='8px';ai.style.padding='6px 10px';ai.style.background='#0b1330';ai.style.border='1px solid #2a3564';ai.style.borderRadius='6px';ai.style.marginBottom='6px';const at=document.createElement('div');at.style.flex='1';at.textContent=(i+1)+'. '+a;const bd=document.createElement('button');bd.className='btn';bd.textContent='✕';bd.style.padding='4px 8px';bd.style.fontSize='12px';bd.onclick=()=>{answers[idx].splice(i,1);renderQ();};ai.append(at,bd);ansList.append(ai);});}choices.append(ansList);const wrap=document.createElement('div');wrap.style.marginTop='12px';const lbl=document.createElement('div');lbl.className='small';lbl.textContent='Nhập câu trả lời (Enter để thêm):';lbl.style.marginBottom='8px';const inp=document.createElement('input');inp.type='text';inp.className='input';inp.placeholder='Nhập đáp án và nhấn Enter...';inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=inp.value.trim();if(v){answers[idx].push(v);renderQ();}}};wrap.append(lbl,inp);choices.append(wrap);setTimeout(()=>inp.focus(),0);btnPrev.disabled=(idx===0);btnNext.disabled=(idx===total-1);}btnPrev.onclick=()=>{if(idx>0){idx--;renderQ();}};btnNext.onclick=()=>{if(idx<data.questions.length-1){idx++;renderQ();}};btnFinish.onclick=()=>{const un=answers.findIndex(a=>!a||a.length===0);if(un!==-1){if(!confirm('Vẫn còn câu chưa trả lời. Bạn vẫn muốn nộp bài?'))return;}renderResult();document.body.classList.add('done');};function renderResult(){let totalScore=0;const details=data.questions.map((q,qi)=>{const uas=answers[qi]||[];const acc=q.answers.map(a=>a.text.toLowerCase().trim());let cc=0,wc=0;const urs=uas.map(ua=>{const n=ua.toLowerCase().trim();const ok=acc.includes(n);if(ok)cc++;else wc++;return{text:ua,correct:ok};});const ta=q.answers.length;const sc=Math.max(0,(cc-wc)/ta);totalScore+=sc;return{question:q.text,userAnswers:urs,correctCount:cc,wrongCount:wc,totalAnswers:ta,score:sc,answers:q.answers};});const pct=data.questions.length>0?((totalScore/data.questions.length)*100).toFixed(2):0;resultSum.innerHTML='<div><strong>Tổng điểm:</strong> '+totalScore.toFixed(2)+'/'+data.questions.length+' ('+pct+'%)</div>';resultDetail.innerHTML='';details.forEach((d,i)=>{const card=document.createElement('div');card.className='detail-card';const h=document.createElement('div');h.innerHTML='<strong>Câu '+(i+1)+':</strong> '+escapeHtml(d.question||'');const sd=document.createElement('div');sd.style.marginTop='8px';sd.innerHTML='<strong>Điểm:</strong> '+d.score.toFixed(2)+'/1 (Đúng: '+d.correctCount+', Sai: '+d.wrongCount+')';sd.className=d.score>=0.5?'correct':'incorrect';const uad=document.createElement('div');uad.style.marginTop='8px';uad.innerHTML='<strong>Các câu trả lời của bạn:</strong>';if(d.userAnswers.length===0){const na=document.createElement('div');na.style.marginTop='4px';na.style.color='#9fb0ff';na.textContent='(Chưa trả lời)';uad.append(na);}else{const ul=document.createElement('div');ul.style.marginTop='8px';d.userAnswers.forEach((ua,idx)=>{const ual=document.createElement('div');ual.style.display='flex';ual.style.alignItems='center';ual.style.gap='8px';ual.style.padding='6px 10px';ual.style.border='1px solid #2a3564';ual.style.borderRadius='6px';ual.style.marginBottom='6px';ual.style.background=ua.correct?'rgba(30,180,120,0.1)':'rgba(255,60,60,0.1)';ual.style.borderColor=ua.correct?'rgba(30,180,120,0.4)':'rgba(255,60,60,0.4)';const uat=document.createElement('div');uat.style.flex='1';uat.textContent=(idx+1)+'. '+ua.text;const bg=document.createElement('span');bg.className='pill '+(ua.correct?'pill-correct':'pill-wrong');bg.textContent=ua.correct?'✓ Đúng':'✗ Sai';ual.append(uat,bg);ul.append(ual);});uad.append(ul);}const ad=document.createElement('div');ad.style.marginTop='12px';ad.innerHTML='<strong>Các đáp án được chấp nhận:</strong>';const list=document.createElement('div');list.style.marginTop='8px';d.answers.forEach(a=>{const line=document.createElement('div');line.className='ans-line';const head=document.createElement('div');head.className='ans-head';const text=document.createElement('div');text.className='ans-text';text.textContent=a.text||'';head.appendChild(text);line.appendChild(head);if(a.explanation){const ex=document.createElement('div');ex.className='exp';ex.textContent=a.explanation;line.appendChild(ex);}list.appendChild(line);});card.append(h,sd,uad,ad,list);resultDetail.append(card);});}function escapeHtml(str){return String(str).replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}})();`;
    return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${escapeHtml(escapedTitle)} - Standalone</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23ff9f43'/%3E%3Cpath d='M14 20h36v6H14zM14 30h24v6H14zM14 40h16v6H14z' fill='%23ffffff'/%3E%3C/svg%3E"/><style>${css}</style></head><body><div class="wrap"><div class="header"><div class="brand">OEQ Test - Standalone</div><button id="start" class="btn primary">Bắt đầu</button></div><div id="stage" class="panel hide"><div class="progress" id="prog"></div><div class="question" id="q"></div><div class="choices" id="choices"></div><div class="controls"><button id="prev" class="btn">◀ Trước</button><button id="next" class="btn">Tiếp ▶</button><button id="finish" class="btn primary">Nộp bài</button></div></div><div class="summary"><div id="tTitle" style="margin-bottom:8px;color:#cfd9ff;font-weight:600"></div><div id="rSum"></div><div id="rDetail" class="result-detail"></div></div></div><script>${js}</script></body></html>`;
  }

  // Init with an empty first question to guide
  if(quiz.questions.length === 0){
    quiz = { title: '', questions: [] };
  }
  renderEditor();
  // Default to Test mode as requested
  setMode('test');
})();
