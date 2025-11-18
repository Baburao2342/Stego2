// Precomputed SHA-256 hashes for allowed normalized answers (lowercased, trimmed, collapsed spaces).
// Answers themselves are NOT in the source — only these hashes.
const CORRECT_HASHES = {
  name: [
    'daa3cb40c292b32b439d88f14ab393639c33b10c030243ee5a587d059578bbd6'
  ],
  username: [
    'bfea01f579a65edb4e30e43a15f78720a75b9f435c238897a166cc89cbfdc6dc'
  ],
  school: [
    'c36b7d8c6bd2f31566f8b20b98219963300a5beaaace62b269a25360d37d1d5e',
    'dd2635c2dec7b3f556e9227dcdbfcdce638dd29f97b4e9e7fd40c47c7d3f01e6'
  ],
  email: [
    '00dda7ca452df01f50e3a9d224da2b62bebd0470bfa7af0026d04e023bdda4ca'
  ],
  game: [
    '17f165d5a5ba695f27c023a83aa2b3463e23810e360b7517127e90161eebabda',
    '04fc805aa91bc0a0e1628ea48b018b4d7e632b037c2f850b68d644d941b7634b'
  ]
};

function normalizeInput(s){
  return (s||'').trim().toLowerCase().replace(/\s+/g,' ');
}

async function sha256Hex(str){
  const s = normalizeInput(str);
  const enc = new TextEncoder();
  const data = enc.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

function setStatus(id, text, ok){
  const el = document.getElementById(id + 'Status');
  el.textContent = text;
  el.style.color = ok ? '#7ee7b3' : '#ff9b9b';
}

async function checkField(inputId, key){
  const val = document.getElementById(inputId).value || '';
  if(!val.trim()){
    setStatus(inputId, 'Empty', false);
    return false;
  }
  const h = await sha256Hex(val);
  const allowed = CORRECT_HASHES[key] || [];
  const ok = allowed.indexOf(h) !== -1;
  setStatus(inputId, ok ? 'Looks good' : 'Incorrect', ok);
  return ok;
}

async function checkAll(){
  const results = await Promise.all([
    checkField('name','name'),
    checkField('username','username'),
    checkField('school','school'),
    checkField('email','email'),
    checkField('game','game')
  ]);
  const all = results.every(Boolean);
  const resEl = document.getElementById('result');
  if(all){
    resEl.textContent = 'All answers accepted. Well done — you found him!';
    resEl.style.color = '#7ee7b3';
  } else {
    resEl.textContent = 'Some answers are incorrect. Keep mining the image.';
    resEl.style.color = '#ffb3b3';
  }
}

document.getElementById('checkBtn').addEventListener('click', async ()=>{
  document.getElementById('result').textContent = 'Checking...';
  await checkAll();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  ['name','username','school','email','game'].forEach(id=>{
    document.getElementById(id).value = '';
    document.getElementById(id+'Status').textContent = '';
  });
  document.getElementById('result').textContent = '';
});
