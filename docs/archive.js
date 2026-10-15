(function(root){
'use strict';
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
function valid(data){return data&&Array.isArray(data.packs)&&data.packs.every(p=>typeof p.id==='string'&&typeof p.game==='string'&&typeof p.patch_repo==='string'&&typeof p.title==='string'&&typeof p.emulator==='string'&&Array.isArray(p.platforms)&&p.platforms.every(v=>typeof v==='string')&&typeof p.download_url==='string'&&(!p.download_url||safeUrl(p.download_url)))}
function filtered(packs,{game='',platform='전체',emulator='전체',query=''}={}){const q=query.trim().toLowerCase();return packs.filter(p=>(!game||p.patch_repo===game)&&(platform==='전체'||p.platforms.includes(platform))&&(emulator==='전체'||p.emulator===emulator)&&(!q||[p.game,p.original,p.title,p.description].join(' ').toLowerCase().includes(q)))}
function cards(packs,total){
 if(!packs.length)return `<div class="empty"><h2>${total?'조건에 맞는 HD 팩이 없습니다.':'아직 등록된 HD 팩이 없습니다.'}</h2><p>${total?'검색어와 필터를 바꾸거나 전체 HD 팩을 확인해 보세요.':'첫 HD 팩을 등록하면 이곳에 표시됩니다.'}</p></div>`;
 return packs.map(p=>{
  const cover=safeUrl(p.cover),source=safeUrl(p.cover_source),download=safeUrl(p.download_url);
  const image=cover?`<img src="${esc(cover)}" alt="${esc(p.game)} 표지" loading="lazy">`:'표지 준비 중';
  const count=Number.isSafeInteger(p.download_count)&&p.download_count>=0?p.download_count.toLocaleString('ko-KR'):'—';
  const date=new Date(p.updated_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});
  return `<article class="row" data-pack="${esc(p.id)}">${source?`<a class="cover" href="${esc(source)}" target="_blank" rel="noopener">${image}</a>`:`<div class="cover">${image}</div>`}<div><h2 class="game">${esc(p.game)}</h2><div class="platforms">${p.platforms.map(esc).join(' · ')}</div><div class="guide-title">${esc(p.title)}</div><div class="tags">${p.emulator?`<span class="tag">${esc(p.emulator)}</span>`:''}<span class="tag format">HD texture pack</span></div><div class="links">${download?`<a href="${esc(download)}" download>다운로드</a>`:'<span>배포 파일 준비 중</span>'}</div></div><div class="metrics"><div class="download-count">${esc(count)}</div><div class="download-label">다운로드</div><div class="updated">최근 수정<br>${esc(date)}</div></div></article>`;
 }).join('');
}
async function start(){const node=id=>root.document.getElementById(id);try{const response=await root.fetch('data/packs.json',{cache:'no-store',credentials:'omit'});if(!response.ok)throw Error();const data=await response.json();if(!valid(data))throw Error();const packs=data.packs,game=new URL(root.location.href).searchParams.get('game')||'';node('pack-count').textContent=packs.length.toLocaleString('ko-KR');node('game-count').textContent=new Set(packs.map(p=>p.patch_repo||p.game)).size.toLocaleString('ko-KR');for(const [id,values] of [['platform',packs.flatMap(p=>p.platforms)],['emulator',packs.map(p=>p.emulator).filter(Boolean)]])node(id).innerHTML=['전체',...new Set(values)].map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');node('selection').hidden=!game;const render=()=>{node('list').innerHTML=cards(filtered(packs,{game,platform:node('platform').value,emulator:node('emulator').value,query:node('search').value}),packs.length)};for(const [id,event] of [['platform','change'],['emulator','change'],['search','input']])node(id).addEventListener(event,render);render()}catch{node('list').innerHTML='<div class="empty"><h2>HD 팩 목록을 불러오지 못했습니다.</h2><p>잠시 후 새로고침하거나 상단 저장소에서 확인해 주세요.</p></div>'}}
if(typeof module!=='undefined'&&module.exports)module.exports={safeUrl,valid,filtered,cards};
if(root.document)void start();
})(globalThis);
