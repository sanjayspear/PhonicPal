/* Authentication: gates the app behind sign up / log in. See README "Accounts".
   Two interchangeable providers behind the same doSignUp/doLogIn/doGoogle/doReset/doLogOut calls:
   - Local accounts (default): email/password stored in localStorage, this device only. No setup needed.
   - Firebase: real accounts + Google sign-in, once FIREBASE_CONFIG below is filled in. */
const FIREBASE_CONFIG = {
    apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
    projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
    appId: "REPLACE_WITH_YOUR_APP_ID"
};
const ROLES = [
    { id: 'teacher', label: 'Class Teacher', icon: '🧑‍🏫', blurb: 'Set up topics for a whole class and see who needs more practice.' },
    { id: 'parent', label: 'Parent', icon: '🏡', blurb: 'Follow your child’s progress and read together at home.' },
    { id: 'solo', label: 'Just Me', icon: '🎧', blurb: 'Learn and practice phonics on your own, at your own pace.' }
];
const AUTH_ERR = {
    'auth/invalid-email': "That email doesn't look right.",
    'auth/user-not-found': 'No account with that email yet — try Sign up.',
    'auth/wrong-password': "That password doesn't match.",
    'auth/email-already-in-use': 'An account already uses that email — try Log in instead.',
    'auth/weak-password': 'Password needs at least 8 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
    'auth/network-request-failed': "Couldn't reach the sign-in service — check your connection."
};
const authErr = e => AUTH_ERR[e && e.code] || (e && e.message) || 'Something went wrong.';

let curUser = null, signupRole = null, pickedRole = null, pendingSignupRole = null;

function roleRow(r) { const d = h('div', 'ag-roleblurb'); d.innerHTML = `<span class="ag-ic">${r.icon}</span><div><b>${r.label}</b><span>${r.blurb}</span></div>`; return d }
$('#ag-role-blurbs').append(...ROLES.map(roleRow));

function mountRoleTiles(container, onPick) {
    container.innerHTML = '';
    ROLES.forEach(r => {
        const b = h('button', 'ag-roletile'); b.type = 'button'; b.dataset.role = r.id; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = `<span class="ag-ic">${r.icon}</span><span class="ag-lbl">${r.label}</span>`;
        b.addEventListener('click', () => {
            $$('.ag-roletile', container).forEach(t => t.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', 'true');
            onPick(r.id);
        });
        container.append(b);
    });
}
mountRoleTiles($('#ag-roletiles-signup'), id => { signupRole = id; $('#ag-su-err').textContent = '' });
mountRoleTiles($('#ag-roletiles-pick'), id => { pickedRole = id; $('#ag-pickrole-err').textContent = '' });

function roleLS(uid) { return 'pp_role_' + uid }
function getRole(uid) { return LS.get(roleLS(uid), null) }
function setRole(uid, id) { LS.set(roleLS(uid), id) }

function lockApp() { $('header').inert = true; $('main').inert = true; $('#authGate').hidden = false; document.body.style.overflow = 'hidden' }
function unlockApp() { $('header').inert = false; $('main').inert = false; $('#authGate').hidden = true; document.body.style.overflow = ''; document.dispatchEvent(new CustomEvent('authunlocked')) }

function showPane(name) {
    $('#ag-form-login').hidden = name !== 'login';
    $('#ag-form-signup').hidden = name !== 'signup';
    $('#ag-pane-pickrole').hidden = name !== 'pickrole';
    $('#ag-tabbtn-login').classList.toggle('a', name === 'login');
    $('#ag-tabbtn-login').setAttribute('aria-selected', name === 'login');
    $('#ag-tabbtn-signup').classList.toggle('a', name === 'signup');
    $('#ag-tabbtn-signup').setAttribute('aria-selected', name === 'signup');
}
$('#ag-tabbtn-login').addEventListener('click', () => showPane('login'));
$('#ag-tabbtn-signup').addEventListener('click', () => showPane('signup'));
$('#ag-go-signup').addEventListener('click', () => showPane('signup'));
$('#ag-go-login').addEventListener('click', () => showPane('login'));

$$('.ag-eye').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.for), show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', show); btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.textContent = show ? '🙈' : '👁';
}));

function resetForms() {
    $('#ag-form-login').reset(); $('#ag-form-signup').reset();
    signupRole = null; pickedRole = null;
    $$('.ag-roletile').forEach(t => t.setAttribute('aria-pressed', 'false'));
    $('#ag-li-err').textContent = ''; $('#ag-su-err').textContent = ''; $('#ag-pickrole-err').textContent = '';
    $('#ag-forgot-note').hidden = true;
}

/* Backend-agnostic: called by whichever provider is active with {uid, email, displayName} or null. */
function onUserChanged(user) {
    if (!user) { curUser = null; $('#authBadge').hidden = true; resetForms(); showPane('login'); lockApp(); return }
    let role = getRole(user.uid);
    if (!role && pendingSignupRole) { setRole(user.uid, pendingSignupRole); role = pendingSignupRole; pendingSignupRole = null }
    curUser = user;
    if (!role) { showPane('pickrole'); lockApp(); return }
    const r = ROLES.find(x => x.id === role) || ROLES[2];
    $('#authWho').textContent = `${r.icon} ${user.displayName || user.email} · ${r.label}`;
    $('#authBadge').hidden = false;
    unlockApp();
}

$('#ag-pickrole-continue').addEventListener('click', () => {
    if (!pickedRole) { $('#ag-pickrole-err').textContent = "Pick how you'll use PhonicsPal."; return }
    setRole(curUser.uid, pickedRole);
    onUserChanged(curUser);
});

function setModeNote(text, tone) {
    const el = $('#ag-setupwarn');
    el.textContent = text; el.hidden = !text;
    el.classList.toggle('ag-note-warn', tone === 'warn');
}

/* ---------------- Provider: local accounts (localStorage, this device only) ---------------- */
/* Passwords are never stored in plain text: salted SHA-256 via SubtleCrypto (built into the browser,
   no library). This still isn't real security — it's verified client-side, so anyone with the console
   open can read the hash+salt and script around the check entirely. It only protects the actual
   password string (which people often reuse elsewhere) from a casual look at localStorage.
   SubtleCrypto needs a secure context (https/localhost); on file:// this falls back to a weak
   non-cryptographic hash with a console warning, which is strictly worse but still not plain text. */
function localProvider() {
    const usersKey = 'pp_local_users';
    const users = () => LS.get(usersKey, {});
    const saveUsers = u => LS.set(usersKey, u);
    const uidFor = email => 'local:' + email.toLowerCase();
    const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    const randomSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

    function weakHash(text) {
        let h = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) }
        return (h >>> 0).toString(16);
    }
    async function hashPassword(pass, salt) {
        if (window.crypto && crypto.subtle) {
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pass));
            return toHex(digest);
        }
        console.warn('[PhonicsPal] SubtleCrypto unavailable (needs https/localhost) — using a weak fallback hash.');
        return weakHash(salt + ':' + pass);
    }

    function restore() {
        const email = LS.get('pp_local_session', null);
        const rec = email && users()[email.toLowerCase()];
        onUserChanged(rec ? { uid: uidFor(email), email, displayName: rec.name } : null);
    }

    doSignUp = async (name, email, pass, role) => {
        const key = email.toLowerCase(), all = users();
        if (all[key]) throw { code: 'auth/email-already-in-use' };
        const salt = randomSalt(), hash = await hashPassword(pass, salt);
        all[key] = { name, salt, hash }; saveUsers(all);
        LS.set('pp_local_session', key);
        setRole(uidFor(email), role);
        onUserChanged({ uid: uidFor(email), email, displayName: name });
    };
    doLogIn = async (email, pass) => {
        const rec = users()[email.toLowerCase()];
        if (!rec) throw { code: 'auth/user-not-found' };
        const hash = await hashPassword(pass, rec.salt);
        if (hash !== rec.hash) throw { code: 'auth/wrong-password' };
        LS.set('pp_local_session', email.toLowerCase());
        onUserChanged({ uid: uidFor(email), email, displayName: rec.name });
    };
    doLogOut = () => { LS.set('pp_local_session', null); onUserChanged(null) };
    doGoogle = () => {
        const note = 'Google sign-in needs a Firebase project set up first — see the README’s "Accounts" section.';
        $('#ag-li-err').textContent = note; $('#ag-su-err').textContent = note;
    };
    doReset = () => {
        $('#ag-forgot-note').hidden = false;
        $('#ag-forgot-note').textContent = "Local accounts can't email a reset link yet. Set up Firebase to enable real password resets (see README).";
    };

    setModeNote('ℹ️ Using local accounts for now (this device only, not secure) — add your Firebase project keys to js/auth.js to enable Google sign-in and real accounts. See the README’s "Accounts" section.');
    restore();
}

/* ---------------- Provider: Firebase Authentication ---------------- */
function firebaseProvider() {
    firebase.initializeApp(FIREBASE_CONFIG);
    const fbAuth = firebase.auth();

    fbAuth.onAuthStateChanged(u => onUserChanged(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null));

    doSignUp = (name, email, pass, role) => {
        pendingSignupRole = role;
        return fbAuth.createUserWithEmailAndPassword(email, pass)
            .then(cred => cred.user.updateProfile({ displayName: name }))
            .catch(e => { pendingSignupRole = null; throw e });
    };
    doLogIn = (email, pass, remember) => {
        const persist = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        return fbAuth.setPersistence(persist).then(() => fbAuth.signInWithEmailAndPassword(email, pass));
    };
    doLogOut = () => fbAuth.signOut();
    doGoogle = () => fbAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch(e => { $('#ag-li-err').textContent = authErr(e); $('#ag-su-err').textContent = authErr(e) });
    doReset = email => fbAuth.sendPasswordResetEmail(email)
        .then(() => { $('#ag-forgot-note').hidden = false; $('#ag-forgot-note').textContent = `Check ${email} for a password reset link.` })
        .catch(e => { $('#ag-forgot-note').hidden = false; $('#ag-forgot-note').textContent = authErr(e) });

    setModeNote('');
}

let doSignUp, doLogIn, doGoogle, doReset, doLogOut;
const firebaseConfigured = FIREBASE_CONFIG.apiKey.indexOf('REPLACE_') !== 0;
if (firebaseConfigured) {
    try { firebaseProvider() }
    catch (e) {
        console.error('[PhonicsPal] Firebase init failed, falling back to local accounts:', e);
        setModeNote('⚠️ Couldn’t connect to Firebase (check the config in js/auth.js) — using local accounts on this device instead for now.', 'warn');
        localProvider();
    }
} else {
    localProvider();
}

$('#ag-form-login').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#ag-li-email').value.trim(), pass = $('#ag-li-pass').value, err = $('#ag-li-err');
    err.textContent = '';
    if (!email || !pass) { err.textContent = 'Enter your email and password.'; return }
    doLogIn(email, pass, $('#ag-li-remember').checked).catch(e => err.textContent = authErr(e));
});

$('#ag-form-signup').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#ag-su-name').value.trim(), email = $('#ag-su-email').value.trim();
    const pass = $('#ag-su-pass').value, pass2 = $('#ag-su-pass2').value, terms = $('#ag-su-terms').checked;
    const err = $('#ag-su-err'); err.textContent = '';
    if (!signupRole) { err.textContent = "Pick how you'll use PhonicsPal."; return }
    if (!name || !email) { err.textContent = 'Enter your name and email.'; return }
    if (pass.length < 8) { err.textContent = 'Password needs at least 8 characters.'; return }
    if (pass !== pass2) { err.textContent = "Passwords don't match."; return }
    if (!terms) { err.textContent = 'Please agree to the Terms of Use and Privacy Policy.'; return }
    doSignUp(name, email, pass, signupRole).catch(e => err.textContent = authErr(e));
});

$('#ag-google-login').addEventListener('click', () => doGoogle());
$('#ag-google-signup').addEventListener('click', () => doGoogle());

$('#ag-forgot-link').addEventListener('click', () => {
    const email = $('#ag-li-email').value.trim(), note = $('#ag-forgot-note'); note.hidden = false;
    if (!email) { note.textContent = 'Enter your email above first, then tap Forgot password again.'; return }
    doReset(email);
});

$('#logoutBtn').addEventListener('click', () => doLogOut());
