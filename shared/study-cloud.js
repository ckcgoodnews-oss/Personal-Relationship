/* Private, per-user study progress for GitHub Pages + Supabase.
   GitHub contains only public app code. Database RLS protects users' records. */
(function(){
'use strict';
var cfg=window.STUDY_CLOUD_CONFIG||{};
var root=new URL('../',document.currentScript.src);
var marker='personal-study-auth-user-v1';
var client;
var studies=[
{id:'jehovah-friendship',name:'Personal Relationship With Jehovah',path:'index.html',total:28},
{id:'conscience',name:'Do Not Impose Your Conscience on Others',path:'conscience-study.html',total:28},
{id:'mother-study',name:'Loving My Adult Son Without Controlling Him',path:'studies/mother-study.html',total:7},
{id:'bible-study-guide',name:'Daily Personal Bible Study Guide',path:'studies/daily-study-guide.html',total:1}
];
function api(){
 if(!window.supabase||!window.supabase.createClient)throw Error('Supabase library did not load.');
 if(!client)client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
function clone(x){return JSON.parse(JSON.stringify(x||{}));}
function normalized(x){
 x=x&&typeof x==='object'?x:{};
 return {completed:clone(x.completed),notes:clone(x.notes),answers:clone(x.answers)};
}
function scopedKey(k){
 var user=localStorage.getItem(marker);
 return user?k+':account:'+user:k;
}
function difference(a,b){return JSON.stringify(a)!==JSON.stringify(b);}
function row(value,n){return {is_completed:!!value.completed[n],journal:value.notes[n]||{}};}
function showBanner(){
 var section=document.createElement('div');
 section.id='study-cloud-banner';
 section.innerHTML='<style>#study-cloud-banner{padding:12px 16px;max-width:1200px;margin:auto;font:14px system-ui;color:#183c33}#study-cloud-banner .inner{border-radius:12px;border:1px solid #c9e1d1;background:#eef7f0;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}#study-cloud-banner a,#study-cloud-banner button{display:inline-block;border-radius:8px;padding:8px 12px;border:1px solid #20745d;color:#fff;background:#20745d;font:600 13px system-ui;text-decoration:none;cursor:pointer}#study-cloud-banner button{background:#fff;color:#20745d}#study-cloud-banner .buttons{display:flex;gap:7px;align-items:center;flex-wrap:wrap}@media print{#study-cloud-banner{display:none}}</style>'+
 '<div class="inner"><span id="cloud-status">Checking study account…</span><div class="buttons"><a href="'+new URL('account/',root).href+'">All my studies</a><button type="button" id="cloud-import" hidden>Import device notes</button><button type="button" id="cloud-signout" hidden>Sign out</button></div></div>';
 var main=document.querySelector('main')||document.body;
 main.parentNode.insertBefore(section,main);
 return {status:section.querySelector('#cloud-status'),importButton:section.querySelector('#cloud-import'),signout:section.querySelector('#cloud-signout')};
}
function mergeGuest(remote,guest){
 var r=normalized(remote),g=normalized(guest);
 for(var n=1;n<=28;n++){
  if(g.completed[n])r.completed[n]=true;
  if(g.notes[n]){
   if(!r.notes[n])r.notes[n]={};
   for(var k of Object.keys(g.notes[n]))if(!r.notes[n][k]&&g.notes[n][k])r.notes[n][k]=g.notes[n][k];
  }
 }
 for(var k of Object.keys(g.answers))if(r.answers[k]===undefined)r.answers[k]=g.answers[k];
 return r;
}
async function connect(opts){
 var ui=showBanner();
 var db;
 try{db=api();}catch(error){ui.status.textContent='Browser-only mode: '+error.message;return null;}
 var auth=await db.auth.getUser();
 if(auth.error){ui.status.textContent='Account service unavailable; notes stay on this device.';return null;}
 var user=auth.data&&auth.data.user;
 var current=user?user.id:null,prior=localStorage.getItem(marker);
 if(current!==prior){
  if(current)localStorage.setItem(marker,current);else localStorage.removeItem(marker);
  window.location.reload();return null;
 }
 if(!user){ui.status.textContent='Study progress is on this device. Sign in to sync it securely.';return null;}
 ui.signout.hidden=false;
 ui.signout.onclick=async function(){
  if(!confirm('Sign out? Your synced study progress will remain in your account.'))return;
  var out=await db.auth.signOut();
  if(out.error){ui.status.textContent='Sign-out failed: '+out.error.message;return;}
  localStorage.removeItem(marker);window.location.reload();
 };
 var state=normalized(opts.read());
 var dirtyKey='study-unsent:'+user.id+':'+opts.studyId;
 var dirty={days:{},answers:{}};
 try{var stored=JSON.parse(localStorage.getItem(dirtyKey)||'{}');dirty.days=stored.days||{};dirty.answers=stored.answers||{};}catch(e){}
 var baseline=normalized(state),timer=null,flushing=false,ready=false;
 function status(s){ui.status.textContent=(user.email||'Signed in')+' · '+s;}
 function persist(){try{localStorage.setItem(dirtyKey,JSON.stringify(dirty));}catch(e){}}
 function changedDay(a,b,n){return difference(row(a,n),row(b,n));}
 function changedAnswer(a,b,n){return difference(a.answers[n],b.answers[n]);}
 function onChange(updated){
  if(!ready)return;
  var v=normalized(updated);
  for(var n=1;n<=28;n++)if(changedDay(v,baseline,n))dirty.days[n]=true;
  var keys=new Set(Object.keys(v.answers).concat(Object.keys(baseline.answers)));
  keys.forEach(function(k){if(changedAnswer(v,baseline,k))dirty.answers[k]=true;});
  baseline=clone(v);persist();
  clearTimeout(timer);status('Saving changes…');timer=setTimeout(flush,800);
 }
 async function flush(){
  if(!ready||flushing)return;
  var days=Object.keys(dirty.days),answers=Object.keys(dirty.answers);
  if(!days.length&&!answers.length){status('All changes saved.');return;}
  flushing=true;
  try{
   if(days.length){
    var snap=normalized(opts.read());
    var rows=days.map(function(n){return Object.assign({user_id:user.id,study_id:opts.studyId,day_number:Number(n)},row(snap,n));});
    var result=await db.from('study_day_progress').upsert(rows,{onConflict:'user_id,study_id,day_number'});
    if(result.error)throw result.error;
    days.forEach(function(n){if(!changedDay(normalized(opts.read()),snap,n))delete dirty.days[n];});
   }
   if(answers.length){
    var snap=normalized(opts.read());
    var rows=answers.filter(function(n){return snap.answers[n]!==undefined&&snap.answers[n]!==null;}).map(function(n){return {user_id:user.id,study_id:opts.studyId,scenario_number:Number(n),choice:String(snap.answers[n])};});
    if(rows.length){var result=await db.from('study_scenario_answers').upsert(rows,{onConflict:'user_id,study_id,scenario_number'});if(result.error)throw result.error;}
    answers.forEach(function(n){if(!changedAnswer(normalized(opts.read()),snap,n))delete dirty.answers[n];});
   }
   status('All changes saved.');
  }catch(error){status('Not synced yet: '+error.message+'. Changes are on this device.');}
  finally{
   persist();flushing=false;
   if(Object.keys(dirty.days).length||Object.keys(dirty.answers).length){clearTimeout(timer);timer=setTimeout(flush,3000);}
  }
 }
 status('Loading your private progress…');
 try{
  var results=await Promise.all([
   db.from('study_day_progress').select('day_number,is_completed,journal').eq('study_id',opts.studyId).eq('user_id',user.id),
   db.from('study_scenario_answers').select('scenario_number,choice').eq('study_id',opts.studyId).eq('user_id',user.id)
  ]);
  if(results[0].error)throw results[0].error;
  if(results[1].error)throw results[1].error;
  var remote=normalized({});
  (results[0].data||[]).forEach(function(r){remote.completed[r.day_number]=r.is_completed;remote.notes[r.day_number]=r.journal||{};});
  (results[1].data||[]).forEach(function(r){remote.answers[r.scenario_number]=r.choice;});
  Object.keys(dirty.days).forEach(function(n){remote.completed[n]=!!state.completed[n];remote.notes[n]=state.notes[n]||{};});
  Object.keys(dirty.answers).forEach(function(n){if(Object.prototype.hasOwnProperty.call(state.answers,n))remote.answers[n]=state.answers[n];});
  opts.replace(remote);localStorage.setItem(scopedKey(opts.storageKey),JSON.stringify(remote));
  baseline=normalized(remote);ready=true;status('Account progress loaded.');
  if(Object.keys(dirty.days).length||Object.keys(dirty.answers).length)setTimeout(flush,100);
  var guest=localStorage.getItem(opts.storageKey);
  if(guest){
   try{
    var old=normalized(JSON.parse(guest));
    if(Object.values(old.completed).some(Boolean)||Object.values(old.notes).some(function(n){return n&&Object.values(n).some(Boolean);})||Object.keys(old.answers).length){
     ui.importButton.hidden=false;
     ui.importButton.onclick=function(){
      if(!confirm('Import earlier device-only progress into this account? Existing notes are preserved.'))return;
      var merged=mergeGuest(normalized(opts.read()),old);
      opts.replace(merged);localStorage.setItem(scopedKey(opts.storageKey),JSON.stringify(merged));
      onChange(merged);ui.importButton.hidden=true;status('Import queued for sync.');
     };
    }
   }catch(e){}
  }
  window.addEventListener('online',flush);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)flush();});
 }catch(error){status('Cloud unavailable: '+error.message+'. Device notes have not been changed.');return null;}
 return {onChange:onChange,flush:flush};
}
function attach(opts){
 var worker=null,pending=[];
 connect(opts).then(function(w){worker=w;if(worker&&pending.length)worker.onChange(pending[pending.length-1]);}).catch(function(e){console.warn('Study sync:',e);});
 return {onChange:function(v){if(worker)worker.onChange(v);else pending.push(normalized(v));}};
}
window.StudyCloud={api:api,root:root,studies:studies,scopedKey:scopedKey,attach:attach,normalize:normalized};
})();