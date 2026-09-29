/* ---------- Home ---------- */
const dk=Object.keys(DICT),day=Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5),wd=DICT[dk[day%dk.length]];
$('#wod').textContent=wd.w;$('#wodm').textContent=wd.m;
go('home');
