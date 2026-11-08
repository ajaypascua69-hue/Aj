/* Leo AI welcome and authentication UI.
 * Cloud authentication is intentionally not connected. No credentials are stored or transmitted.
 * Connect a trusted auth provider and server-side configuration before enabling real accounts.
 */
(()=>{'use strict';
const root=document.createElement('section');root.className='auth-gate';root.id='leo-auth-gate';root.setAttribute('aria-label','Leo AI welcome and sign in');
root.innerHTML=`<div class="auth-card"><p class="auth-welcome">Welcome to Leo AI</p><h1 class="auth-brand">Leo <span>AI</span></h1><p class="auth-subtitle">Your independent AI workspace for learning, creating, coding, and getting things done.</p><div id="auth-form-area"><form id="leo-auth-form" novalidate><label for="leo-identity">Email address or phone number</label><input id="leo-identity" name="identity" type="text" autocomplete="username" placeholder="Email or phone number"><label for="leo-password">Password</label><input id="leo-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password"><button class="auth-forgot" id="leo-forgot" type="button">Forgot password?</button><button class="auth-primary" type="submit" id="leo-signin">Sign In</button></form><div class="auth-divider">or continue with</div><button class="auth-secondary" id="leo-google" type="button">Continue with Google</button><button class="auth-secondary" id="leo-apple" type="button">Continue with Apple</button><p class="auth-switch" id="leo-switch">Don’t have an account? <button type="button" id="leo-create">Create account</button></p></div><p class="auth-status" id="leo-auth-status" role="status" aria-live="polite"></p><p class="auth-notice">Account sign-in, account creation, password recovery, Google, and Apple authentication are not connected yet. This screen is a UI preview; do not enter a real password. Continue as guest to use the current local Leo AI app.</p><button class="auth-guest" id="leo-guest" type="button">Continue as guest</button></div>`;
document.body.prepend(root);
const $=id=>document.getElementById(id);let mode='signin';
function message(s){$('leo-auth-status').textContent=s}
function setMode(next){mode=next;const create=mode==='create';$('leo-signin').textContent=create?'Create account':'Sign In';$('leo-password').autocomplete=create?'new-password':'current-password';$('leo-switch').innerHTML=create?'Already have an account? <button type="button" id="leo-login">Sign in</button>':'Don’t have an account? <button type="button" id="leo-create">Create account</button>';const toggle=$('leo-create')||$('leo-login');toggle.addEventListener('click',()=>setMode(create?'signin':'create'));message('');}
$('leo-create').addEventListener('click',()=>setMode('create'));
$('leo-auth-form').addEventListener('submit',e=>{e.preventDefault();message('Authentication is not configured. Your details were not saved or sent. Use Continue as guest.');});
$('leo-forgot').addEventListener('click',()=>message('Password recovery is not connected yet. No email or SMS was sent.'));
['leo-google','leo-apple'].forEach(id=>$(id).addEventListener('click',()=>message('This sign-in provider is not configured yet. No account connection was made.')));
$('leo-guest').addEventListener('click',()=>{root.hidden=true;document.body.classList.remove('auth-open');});
document.body.classList.add('auth-open');
})();