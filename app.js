const editor = document.getElementById('editor');
const candidateBox = document.getElementById('candidate-box');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const statusMsg = document.getElementById('status-msg');

// ローマ字 -> ひらがな 変換テーブル（米国配列・多様な表記に対応）
const romajiMap = {
  'a':'あ','i':'い','u':'う','e':'え','o':'お',
  'ka':'か','ki':'き','ku':'く','ke':'け','ko':'こ',
  'sa':'さ','si':'し','shi':'し','su':'す','se':'せ','so':'そ',
  'ta':'た','ti':'ち','chi':'ち','tsu':'つ','tu':'つ','te':'て','to':'と',
  'na':'な','ni':'に','nu':'ぬ','ne':'ね','no':'の',
  'ha':'は','hi':'ひ','fu':'ふ','hu':'ふ','he':'へ','ho':'ほ',
  'ma':'ま','mi':'み','mu':'む','me':'め','mo':'も',
  'ya':'や','yu':'ゆ','yo':'よ',
  'ra':'ら','ri':'り','ru':'る','re':'れ','ro':'ろ',
  'wa':'わ','wo':'を','nn':'ん',
  'ga':'が','gi':'ぎ','gu':'ぐ','ge':'げ','go':'ご',
  'za':'ざ','ji':'じ','zi':'じ','zu':'ず','ze':'ぜ','zo':'ぞ',
  'da':'だ','di':'ぢ','du':'づ','de':'で','do':'ど',
  'ba':'ば','bi':'び','bu':'ぶ','be':'べ','bo':'ぼ',
  'pa':'ぱ','pi':'ぴ','pu':'ぷ','pe':'ぺ','po':'ぽ',
  'kya':'きゃ','kyu':'きゅ','kyo':'きょ',
  'sha':'しゃ','shu':'しゅ','sho':'しょ','sya':'しゃ','syu':'しゅ','syo':'しょ',
  'cha':'ちゃ','chu':'ちゅ','cho':'ちょ','cya':'ちゃ','cyu':'ちゅ','cyo':'ちょ',
  'nya':'にゃ','nyu':'にゅ','nyo':'にょ',
  'hya':'ひゃ','hyu':'ひゅ','hyo':'ひょ',
  'mya':'みゃ','myu':'みゅ','myo':'みょ',
  'rya':'りゃ','ryu':'りゅ','ryo':'りょ',
  'gya':'ぎゃ','gyu':'ぎゅ','gyo':'ぎょ',
  'ja':'じゃ','ju':'じゅ','jo':'じょ','jya':'じゃ','jyu':'じゅ','jyo':'じょ',
  '-':'ー',',':'、','.':'。'
};

let currentInput = '';
let candidates = [];
let selectedCandidateIndex = 0;
let isConverting = false;

// オンラインで自然な漢字・予測変換を取得
async function fetchCandidates(text) {
  try {
    const response = await fetch(`https://www.google.com/transliterate?langpair=ja-Hira|ja&text=${encodeURIComponent(text)}`);
    const data = await response.json();
    if (data && data[0] && data[0][1]) {
      return data[0][1];
    }
  } catch (e) {
    console.error('変換エラー:', e);
  }
  return [text];
}

function convertRomaji(input) {
  let result = input;
  // 促音 (xtu / っ) の対応
  result = result.replace(/([bcdfghjklmnpqrstvwxyz])\1/g, 'っ$1');
  
  // 3文字・2文字・1文字の順で置換
  const keys = Object.keys(romajiMap).sort((a, b) => b.length - a.length);
  for (let key of keys) {
    result = result.replaceAll(key, romajiMap[key]);
  }
  return result;
}

editor.addEventListener('keydown', async (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    const text = editor.value;
    const convertedHiragana = convertRomaji(text);
    
    if (!isConverting) {
      candidates = await fetchCandidates(convertedHiragana);
      if (candidates.length > 0) {
        isConverting = true;
        selectedCandidateIndex = 0;
        renderCandidates();
      }
    } else {
      selectedCandidateIndex = (selectedCandidateIndex + 1) % candidates.length;
      renderCandidates();
    }
  } else if (e.key === 'Enter') {
    if (isConverting) {
      e.preventDefault();
      editor.value = candidates[selectedCandidateIndex];
      isConverting = false;
      candidateBox.classList.add('hidden');
    }
  } else if (e.key === 'Escape') {
    if (isConverting) {
      isConverting = false;
      candidateBox.classList.add('hidden');
    }
  }
});

function renderCandidates() {
  candidateBox.innerHTML = '';
  candidates.forEach((cand, idx) => {
    const item = document.createElement('div');
    item.className = `candidate-item ${idx === selectedCandidateIndex ? 'selected' : ''}`;
    item.textContent = cand;
    item.addEventListener('click', () => {
      editor.value = cand;
      isConverting = false;
      candidateBox.classList.add('hidden');
    });
    candidateBox.appendChild(item);
  });
  candidateBox.classList.remove('hidden');
}

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(editor.value);
  statusMsg.textContent = 'コピーしました！';
  setTimeout(() => { statusMsg.textContent = ''; }, 3000);
});

clearBtn.addEventListener('click', () => {
  editor.value = '';
  candidateBox.classList.add('hidden');
  isConverting = false;
});
