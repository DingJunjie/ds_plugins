import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';

async function fixture(t){const dir=await mkdtemp(path.join(tmpdir(),'me-appearance-'));t.after(()=>rm(dir,{recursive:true,force:true}));return new MeStore({filePath:path.join(dir,'me.json')});}

test('appearance profiles use group and section, grouped safely excluding sensitive',async t=>{
 const store=await fixture(t);
 const a=await store.profileSave({expectedRevision:0,content:'体重约60kg',source:'user',group:'appearance',section:'fat_loss',kind:'self_report',sensitive:false,includeInContext:true,status:'active'});
 await store.profileSave({expectedRevision:a.revision,content:'护肤记录',source:'user',group:'appearance',section:'skincare',kind:'self_report',sensitive:false,includeInContext:true,status:'active'});
 const hidden=await store.profileSave({expectedRevision:2,content:'private',source:'user',group:'appearance',section:'style',kind:'self_report',sensitive:true,includeInContext:false,status:'active'});
 const result=await store.appearanceGet();assert.deepEqual(Object.keys(result.sections),['fat_loss','skincare','style','posture','other']);assert.equal(result.sections.fat_loss.length,1);assert.equal(result.sections.style.length,0);
 const all=await store.appearanceGet({includeSensitive:true});assert.equal(all.sections.style.length,1);
});

test('old profile defaults section other and record project/activity roundtrip',async t=>{
 const store=await fixture(t);
 const old={version:1,revision:0,records:[],profiles:[{id:'old-profile',content:'old',source:'manual',sensitive:false,includeInContext:true,status:'active',recordedAt:'2026-01-01T00:00:00Z',confirmedAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',group:'other',kind:'self_report',evidence:'',confidence:'confirmed',goal:null}]};
 await store.importBackup({data:JSON.stringify(old),expectedRevision:0});
 const p=(await store.snapshot()).profiles[0];assert.equal(p.section,'other');
 const r=await store.add({expectedRevision:1,content:'涂防晒',project:'appearance',activity:'skincare',category:'护肤',tags:['appearance'],sensitive:false});
 assert.equal(r.record.project,'appearance');assert.equal(r.record.activity,'skincare');
 const backup=JSON.parse(await store.exportBackup());assert.equal(backup.records[0].project,'appearance');
});

test('invalid appearance section or activity rejects atomically',async t=>{
 const store=await fixture(t);
 await assert.rejects(store.profileSave({expectedRevision:0,content:'x',source:'u',group:'appearance',section:'bad',sensitive:false,includeInContext:true,status:'active'}),{code:'VALIDATION_ERROR'});
 await assert.rejects(store.add({expectedRevision:0,content:'x',project:'appearance',activity:'bad'}),{code:'VALIDATION_ERROR'});
 assert.equal((await store.snapshot()).revision,0);
});
