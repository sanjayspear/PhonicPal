/* ---------- Home ---------- */
const dk=Object.keys(DICT),wd=DICT[dk[new Date().getDate()%dk.length]];
$('#wod').textContent=wd.w;$('#wodm').textContent=wd.m;
go('home');
