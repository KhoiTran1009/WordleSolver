const WORD_LENGTH = 5;
const MAX_ROWS = 6;

let VALID_WORDS = [];
let statusofGuesses = [];
let solution = pickSolution;
let currentRow = 0;
let currentCol = 0;
const gridEl = document.getElementById('grid');
const messageEl = document.getElementById('message');
const keyboardEl = document.getElementById('keyboard');
const restartBtn = document.getElementById('restart');
const hintBtn = document.getElementById('solve');

init();

function pickSolution(){
  if(!VALID_WORDS || VALID_WORDS.length === 0) return null;
  // pick a random word from list
  return VALID_WORDS[Math.floor(Math.random()*VALID_WORDS.length)];
}

async function init(){
  // load words first
  await loadWords();
  solution = pickSolution();
  console.log('Solution (for demo purposes):', solution);
  // build grid
  gridEl.innerHTML = '';
  for(let r=0;r<MAX_ROWS;r++){
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = r;
    for(let c=0;c<WORD_LENGTH;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      row.appendChild(cell);
    }
    gridEl.appendChild(row);
  }
  addListeners();
  showMessage('Chọn 5 chữ cái để bắt đầu');
}

async function loadWords(){
  try{
    const res = await fetch('/words');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    VALID_WORDS = await res.json();
    VALID_WORDS = VALID_WORDS.map(s=>s.trim().toLowerCase()).filter(s=>s.length===WORD_LENGTH);
    if(VALID_WORDS.length === 0) throw new Error('empty words');
    console.log('Loaded', VALID_WORDS.length, 'words');
  }catch(err){
    console.warn('Could not load words, using fallback list', err);
    VALID_WORDS = ['apple','grape','crane','slate','flame','brick','point','shout','bring','shard'];
  }
}



function keyEl(label, extra){
  const b = document.createElement('button');
  b.className = 'key' + (extra?(' '+extra):'');
  b.textContent = label;
  b.dataset.key = label;
  return b;
}

function addListeners(){
  document.addEventListener('keydown',onKeyDown);
  restartBtn.addEventListener('click',onRestart);
  hintBtn.addEventListener('click', onHint);
}

function onRestart(){
  solution = pickSolution();
  console.log('Solution (for demo purposes) onRestart:', solution);
  currentRow = 0; currentCol = 0;
  // clear grid
  document.querySelectorAll('.cell').forEach(c=>{c.textContent=''; c.className='cell'});
  // reset keys
  document.querySelectorAll('.key').forEach(k=>{k.className='key';});
  statusofGuesses = [];
  restartBtn.blur();
  showMessage('Bắt đầu lượt mới');
}

function onKeyDown(e){
  if(e.key === 'Enter') return handleKey('Enter');
  if(e.key === 'Backspace') return handleKey('Backspace');
  const k = e.key.toUpperCase();
  if(k.length===1 && k>='A' && k<='Z') handleKey(k);
}

function handleKey(key){
  if(key === 'Enter') return submitGuess();
  if(key === 'Backspace') return deleteLetter();
  if(key.length===1){
    addLetter(key);
  }
}

function addLetter(letter){
  if(currentCol >= WORD_LENGTH) return;
  const cell = getCell(currentRow,currentCol);
  cell.textContent = letter;
  cell.classList.add('filled');
  currentCol++;
}

function deleteLetter(){
  if(currentCol <= 0) return;
  currentCol--;
  const cell = getCell(currentRow,currentCol);
  cell.textContent = '';
  cell.className = 'cell';
}

function submitGuess(){
  if(currentCol !== WORD_LENGTH){ showMessage('Vui lòng nhập đủ 5 chữ'); return; }
  const guess = getRowText(currentRow).toLowerCase();
  if(!VALID_WORDS.includes(guess)){
    showMessage('Từ không hợp lệ (danh sách demo).');
    return;
  }
  const evaluation = evaluateGuess(guess, solution);

  applyEvaluationToRow(currentRow, evaluation, guess);
  if(evaluation.every(e=>e===2)){
    showMessage('Chúc mừng! Bạn đoán đúng.');
    highlightKeys(guess,evaluation);
    currentRow = MAX_ROWS; // stop further input
    return;
  }
  highlightKeys(guess,evaluation);
  currentRow++;
  currentCol = 0;
  if(currentRow >= MAX_ROWS){
    showMessage('Hết lượt — đáp án: ' + solution.toUpperCase());
  } else {
    showMessage('Tiếp tục. Lượt ' + (currentRow+1) + ' trên ' + MAX_ROWS);
  }
}

function getCell(r,c){
  return gridEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

function getRowText(r){
  let s='';
  for(let c=0;c<WORD_LENGTH;c++) s += getCell(r,c).textContent || '';
  return s;
}

// evaluation codes: 0 absent, 1 present, 2 correct
function evaluateGuess(guess, solution){
  const result = new Array(WORD_LENGTH).fill(0);
  const sol = solution.split('');
  const g = guess.split('');
  // pass 1: correct
  for(let i=0;i<WORD_LENGTH;i++){
    if(g[i] === sol[i]){result[i] = 2; g[i] = null;}
  }
  // pass 2: present
  for(let i=0;i<WORD_LENGTH;i++){
    if(g[i]){
      const idx = sol.indexOf(g[i]);
      if(idx !== -1){result[i] = 1;}
    }
  }
  statusofGuesses.push(result);
  return result;
}

function applyEvaluationToRow(row, evals, guess){
  for(let c=0;c<WORD_LENGTH;c++){
    const cell = getCell(row,c);
    const cls = evals[c]===2? 'correct' : (evals[c]===1? 'present' : 'absent');
    cell.classList.add(cls);
  }
}

function highlightKeys(guess, evals){
  for(let i=0;i<guess.length;i++){
    const ch = guess[i].toUpperCase();
    const k = document.querySelector(`.key[data-key="${ch}"]`);
    if(!k) continue;
    // priority: correct > present > absent
    const state = evals[i];
    if(state === 2){ k.classList.remove('present','absent'); k.classList.add('correct'); }
    else if(state === 1){ if(!k.classList.contains('correct')){ k.classList.remove('absent'); k.classList.add('present'); } }
    else { if(!k.classList.contains('correct') && !k.classList.contains('present')) k.classList.add('absent'); }
  }
}

function AIsupport(){
  // TO DO: implement AI support feature
  let nextGuess = fetch('api/AIsendGuess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      algorithm: document.getElementById('algorithm').value,
      previousGuesses: getAllPreviousGuesses(),
      statusofGuesses: statusofGuesses,
    })
  });
  // proper chaining and use the server field `nextGuess`
  nextGuess
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      if(data && data.nextGuess){
        autoSubmitGuess(data.nextGuess);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
// Programmatic submit helper used by AI: insert letters then press Enter
function autoSubmitGuess(guess){
  if(!guess){
    console.warn('autoSubmitGuess called with empty guess:', guess);
    return;
  }
  // normalize possible responses: string, array of chars, or other
  let gstr;
  if(typeof guess === 'string'){
    gstr = guess.toUpperCase();
  } else if(Array.isArray(guess)){
    gstr = guess.join('').toUpperCase();
  } else {
    // fallback: coerce to string
    try{ gstr = String(guess).toUpperCase(); }catch(e){
      console.warn('Could not coerce AI guess to string:', guess, e);
      return;
    }
  }
  for (let i = 0; i < WORD_LENGTH && i < gstr.length; i++) {
    handleKey(gstr[i]);
  }
  handleKey('Enter');
}

function onHint(){
  AIsupport();
  hintBtn.blur();
}

function getAllPreviousGuesses(){
  const guesses = [];
  for(let r=0;r<currentRow;r++){
    guesses.push(getRowText(r).toLowerCase());
  }
  return guesses;
}

function showMessage(msg){ messageEl.textContent = msg; }
