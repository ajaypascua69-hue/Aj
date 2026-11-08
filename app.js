(() => {
 const installButton=document.querySelector('#install-button');
 let installPrompt=null;
 if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('AJ offline support could not be enabled:',error)));}
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(installButton)installButton.hidden=false;});
 installButton?.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.hidden=true;});
 window.addEventListener('appinstalled',()=>{if(installButton)installButton.hidden=true;const note=document.querySelector('#install-note');if(note)note.textContent='AJ has been installed on this device.';});
 const menuButton=document.querySelector('[data-menu-button]');
 const nav=document.querySelector('[data-nav]');
 menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
 nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));
 const search=document.querySelector('#tool-search');
 const filters=[...document.querySelectorAll('[data-filter]')];
 const cards=[...document.querySelectorAll('.tool-card')];
 const empty=document.querySelector('#empty-state');
 let active='all';
 function filterTools(){const q=(search?.value||'').trim().toLowerCase();let count=0;cards.forEach(card=>{const category=card.dataset.category||'';const haystack=(card.innerText+' '+(card.dataset.keywords||'')).toLowerCase();const show=(active==='all'||category===active)&&haystack.includes(q);card.hidden=!show;if(show)count++;});if(empty)empty.hidden=count!==0;}
 filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));filterTools();}));
 search?.addEventListener('input',filterTools);
 document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const value=button.dataset.copy;try{await navigator.clipboard.writeText(value);button.textContent='Copied!';}catch{button.textContent='Select command';const range=document.createRange();const code=button.parentElement.querySelector('code');if(code){range.selectNodeContents(code);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}}setTimeout(()=>button.textContent='Copy',1600);}));
})();