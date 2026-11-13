import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('page.html', root), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element {
  constructor(tag='div') { this.tagName=tag;this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.children=[];this.listeners={};this.dataset={};this.style={}; }
  append(...nodes){this.children.push(...nodes);} replaceChildren(...nodes){this.children=[...nodes];}
  addEventListener(event, fn){this.listeners[event]=fn;} setAttribute(k,v){this[k]=v;}
  showModal(){this.open=true;} close(){this.open=false;} remove(){} click(){const event={currentTarget:this};this.onclick?.(event);this.listeners.click?.(event);}
  reset(){} get textContent(){return this._text || this.children.map(x=>x.textContent).join('');} set textContent(v){this._text=String(v);this.children=[];}
}
function setup() {
 const ids=new Map([...page.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const document={getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),querySelectorAll:()=>[],body:new Element()};
 const window={}; const sandbox={window,document,Date,console,Blob,URL,setTimeout,confirm:()=>true};
 vm.runInNewContext(script,sandbox); return {ids,window};
}
const tick=()=>new Promise(r=>setImmediate(r));
function backend() {
 let revision=1; const requests=[];
 const record={id:'record-1',content:'<img src=x onerror=alert(1)>',occurredAt:'2026-11-09T08:00:00Z',recordedAt:'2026-11-10T08:00:00Z',category:'生活',tags:[],source:'用户手动',sensitive:false};
 const request=async req=>{requests.push(req);switch(req.op){
 case 'search':return {revision,total:1,records:[record]};case 'profileGet':return {revision,profiles:[]};case 'get':return {revision,record};case 'info':return {dataFile:'/local/me.json',policy:'local'};case 'dailyList':return {revision,date:'2026-11-10',items:[]};case 'stats':return {revision,days:[],profiles:[]};
 case 'add':throw new Error('磁盘写入失败');case 'update':throw new Error('版本冲突'); default:throw new Error('Unexpected '+req.op);
 }};
 return {request,requests,advance:()=>revision++};
}
test('page script parses; sensitive local browsing and literal text rendering',async()=>{
 const {window,ids}=setup();const api=backend();const dispose=window.__meConnect(api.request);await tick();
 assert.equal(api.requests.find(x=>x.op==='search').includeSensitive,true);
 assert.equal(api.requests.find(x=>x.op==='profileGet').includeSensitive,true);
 assert.equal(Object.hasOwn(api.requests.find(x=>x.op==='search'),'category'),false);
 assert.equal(Object.hasOwn(api.requests.find(x=>x.op==='search'),'from'),false);
 ids.get('from').value='2026-11-09';ids.get('to').value='2026-11-10';ids.get('filters').listeners.submit({preventDefault(){}});await tick();
 const filtered=api.requests.filter(x=>x.op==='search').at(-1);assert.equal(filtered.from,new Date('2026-11-09T00:00:00').toISOString());assert.equal(filtered.to,new Date('2026-11-10T23:59:59.999').toISOString());
 assert.match(ids.get('timeline').textContent,/<img src=x onerror=alert\(1\)>/);
 assert.match(ids.get('timeline').textContent,/发生 .*记录 /);
 assert.equal(ids.get('location').textContent,'/local/me.json');
 assert.equal(typeof dispose,'function');dispose();
});
test('quick-note failure preserves the entire draft',async()=>{
 const {window,ids}=setup();window.__meConnect(backend().request);await tick();
 ids.get('content').value='未保存的文字';ids.get('category').value='运动';ids.get('tags').value='散步';ids.get('sensitive').checked=true;
 const button=new Element('button');ids.get('quick').listeners.submit({preventDefault(){},submitter:button});await tick();
 assert.equal(ids.get('content').value,'未保存的文字');assert.equal(ids.get('category').value,'运动');assert.equal(ids.get('tags').value,'散步');assert.equal(ids.get('sensitive').checked,true);assert.equal(button.disabled,false);assert.match(ids.get('notice').textContent,/磁盘写入失败/);
});
test('conflict and unrelated refresh never silently advance editor revision',async()=>{
 const {window,ids}=setup();const api=backend();window.__meConnect(api.request);await tick();
 const entry=ids.get('timeline').children.find(x=>x.tagName==='article');const editButton=entry.children[0].children[1].children[0];editButton.click();await tick();
 ids.get('editContent').value='保留的冲突草稿';api.advance();ids.get('filters').listeners.submit({preventDefault(){}});await tick();
 const submit=async()=>{await ids.get('editForm').listeners.submit({preventDefault(){},submitter:new Element('button')});};
 await submit();await submit();const updates=api.requests.filter(x=>x.op==='update');assert.deepEqual(updates.map(x=>x.expectedRevision),[1,1]);assert.equal(ids.get('editContent').value,'保留的冲突草稿');assert.equal(ids.get('editor').open,true);
 ids.get('reloadEditor').click();await tick();await submit();assert.equal(api.requests.filter(x=>x.op==='update').at(-1).expectedRevision,2);
});
test('page request shapes integrate with the real store',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'me-client-test-'));const filePath=path.join(dir,'me.json');
 try {const store=new MeStore({filePath});const {window,ids}=setup();window.__meConnect(async req=>{if(req.op==='info')return {dataFile:filePath,policy:'local'};const {op,...args}=JSON.parse(JSON.stringify(req));return store[op](args);});await tick();await tick();
 assert.doesNotMatch(ids.get('notice').textContent,/Invalid|Unknown/);
 ids.get('content').value='实际接口记录';ids.get('quick').listeners.submit({preventDefault(){},submitter:new Element('button')});for(let i=0;i<10;i++)await tick();
 // Await the filesystem transaction without assuming event-loop timing.
 await new Promise(r=>setTimeout(r,30));
 assert.equal((await store.snapshot()).records[0]?.content,'实际接口记录');
 ids.get('newProfile').click();await new Promise(r=>setTimeout(r,10));ids.get('editContent').value='实际接口背景';ids.get('editStatus').value='active';
 await ids.get('editForm').listeners.submit({preventDefault(){},submitter:new Element('button')});
 assert.equal((await store.snapshot()).profiles[0]?.content,'实际接口背景');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Me daily tasks are independently added and completed with revisions',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'me-daily-client-'));const filePath=path.join(dir,'me.json');
 try {const store=new MeStore({filePath});const {window,ids}=setup();window.__meConnect(async req=>{if(req.op==='info')return {dataFile:filePath,policy:'local'};const {op,...args}=JSON.parse(JSON.stringify(req));return store[op](args);});await tick();
 ids.get('dailyTaskText').value='午后散步';await ids.get('dailyTaskForm').listeners.submit({preventDefault(){}});await tick();
 const date=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);let list=await store.dailyList({date});
 assert.equal(list.items.length,1);assert.equal(list.items[0].text,'午后散步');assert.equal(ids.get('dailyTaskText').value,'');
 const row=ids.get('dailyTaskList').children[0];const toggle=row.children[0].children[0];await toggle.listeners.click();await tick();
 list=await store.dailyList({date});assert.equal(list.items[0].done,true);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Me page settings share floating preferences without personal draft storage',()=>{
 const {ids,window}=setup();let prefs={enabled:true,hydration:false,ai:true};let listener;const calls=[];
 window.__mePreferences={get:()=>prefs,set:patch=>{calls.push(patch);prefs={...prefs,...patch};listener?.();},subscribe:fn=>{listener=fn;return()=>{};}};
 // Re-evaluate in a small sandbox with the bridge installed before page boot.
 const document={getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),querySelectorAll:()=>[],body:new Element()};
 vm.runInNewContext(script,{window,document,Date,console,Blob,URL,setTimeout,confirm:()=>true});
 assert.equal(ids.get('floatingEnabled').checked,true);assert.equal(ids.get('floatAiEnabled').checked,true);
 ids.get('hydrationEnabled').checked=true;ids.get('hydrationEnabled').onchange({currentTarget:ids.get('hydrationEnabled')});
 assert.deepEqual(JSON.parse(JSON.stringify(calls)),[{hydration:true,reminderVersion:2}]);assert.equal(prefs.hydration,true);
});
test('UI contains no unsafe HTML insertion or unrelated features',()=>{
 assert.doesNotMatch(script,/innerHTML|outerHTML|insertAdjacentHTML|eval\(/);
 assert.match(page,/明确同意/);assert.match(page,/不覆盖/);assert.doesNotMatch(script,/localStorage|syncToNutstore|localKnowledge/);
});
test('client template is isolated and uses documented connection bridge',async()=>{
 const template=await readFile(new URL('client-template.js',root),'utf8');const floating=await readFile(new URL('floating-widget.js',root),'utf8');const output=template.replace('__PAGE__',()=>JSON.stringify(page)).replace('__FLOATING_WIDGET__',floating);new vm.Script(output);
 let declaration;vm.runInNewContext(output,{window:{__ModuleLoader__:{load:value=>declaration=value}}});
 assert.equal(declaration.id,'harness-me-local');const registration=declaration.factory(()=>({createElement(){}}));assert.deepEqual(Array.from(registration.inject),['slots','layout','connection']);
 assert.match(template,/localMe\/request/);assert.match(template,/aborter\.signal/);assert.match(template,/shell\.overlay/);assert.match(template,/sidebar\.panellist/);assert.match(template,/role: 'switch'/);assert.doesNotMatch(template,/sidebar\.footer\.action/);assert.match(floating,/localStorage/);assert.doesNotMatch(template,/localKnowledge/);
});
