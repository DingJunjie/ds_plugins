import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';

async function fixture(t){const dir=await mkdtemp(path.join(tmpdir(),'me-daily-')); t.after(()=>rm(dir,{recursive:true,force:true})); return {store:new MeStore({filePath:path.join(dir,'me.json')}),dir};}
const TODAY='2026-11-10', TOMORROW='2026-11-11';
test('old version1 backup remains lossless and imports without daily list',async t=>{
 const {store,dir}=await fixture(t); assert.deepEqual(await store.snapshot(),{version:1,revision:0,records:[],profiles:[]});
 const old=JSON.stringify({version:1,revision:3,records:[],profiles:[]});
 assert.equal((await store.importBackup({data:old,expectedRevision:0})).revision,0);
 assert.deepEqual(JSON.parse(await store.exportBackup()),{version:1,revision:0,records:[],profiles:[]});
 assert.deepEqual(await store.dailyList({date:TODAY}),{revision:0,date:TODAY,items:[]});
 const destination=new MeStore({filePath:path.join(dir,'old-restored.json')});await destination.importBackup({data:old,expectedRevision:0});
 assert.equal((await destination.snapshot()).dailyItems,undefined);
});
test('daily completion is per-date, reversible, not inferred from missing days',async t=>{
 const {store}=await fixture(t); const first=await store.dailyAdd({text:' 喝水 ',expectedRevision:0});
 assert.equal(first.revision,1);assert.equal(first.item.text,' 喝水 ');assert.equal(first.item.active,true);assert.deepEqual(first.item.doneDates,[]);
 assert.equal((await store.dailyList({date:TODAY})).items[0].done,false);
 const complete=await store.dailyUpdate({id:first.item.id,expectedRevision:1,date:TODAY,done:true});
 assert.deepEqual(complete.item.doneDates,[TODAY]);assert.equal((await store.dailyList({date:TODAY})).items[0].done,true);
 assert.equal((await store.dailyList({date:TOMORROW})).items[0].done,false);
 const tomorrow=await store.dailyUpdate({id:first.item.id,expectedRevision:2,date:TOMORROW,done:true,text:' 喝水两次 '});
 assert.deepEqual(tomorrow.item.doneDates,[TODAY,TOMORROW]);assert.equal(tomorrow.item.text,' 喝水两次 ');
 const undo=await store.dailyUpdate({id:first.item.id,expectedRevision:3,date:TODAY,done:false});
 assert.deepEqual(undo.item.doneDates,[TOMORROW]);assert.equal((await store.dailyList({date:TODAY})).items[0].done,false);
 await assert.rejects(store.dailyUpdate({id:first.item.id,expectedRevision:1,date:TODAY,done:true}),{code:'REVISION_CONFLICT'});
 const disabled=await store.dailyUpdate({id:first.item.id,expectedRevision:4,active:false});
 assert.equal(disabled.item.active,false);assert.deepEqual((await store.dailyList({date:TOMORROW})).items,[]);
 assert.equal((await store.snapshot()).dailyItems[0].doneDates[0],TOMORROW);
 const removed=await store.dailyRemove({id:first.item.id,expectedRevision:5});assert.equal(removed.item.id,first.item.id);assert.deepEqual((await store.dailyList({date:TODAY})).items,[]);
});
test('rejects invalid daily data, malformed dates, missing revision and corrupt stores',async t=>{
 const {store,dir}=await fixture(t);
 for(const args of [{text:'',expectedRevision:0},{text:'x'.repeat(501),expectedRevision:0},{text:'valid'}])await assert.rejects(store.dailyAdd(args),{code:'VALIDATION_ERROR'});
 for(const date of ['2026-02-30','2026-11-1','2026-13-01','2026-00-10','2026-11-10T00:00:00Z'])await assert.rejects(store.dailyList({date}),{code:'VALIDATION_ERROR'});
 const {item}=await store.dailyAdd({text:'sample',expectedRevision:0});
 for(const patch of [{date:TODAY},{done:true},{date:'2026-02-30',done:true},{text:' '},{active:'no'},{}])await assert.rejects(store.dailyUpdate({id:item.id,expectedRevision:1,...patch}),{code:'VALIDATION_ERROR'});
 let state=JSON.parse(await store.exportBackup());state.dailyItems[0].doneDates=[TODAY,TODAY];
 const dest=new MeStore({filePath:path.join(dir,'malformed.json')});await assert.rejects(dest.importBackup({data:JSON.stringify(state),expectedRevision:0}),{code:'VALIDATION_ERROR'});
 assert.equal((await store.snapshot()).revision,1);
});
test('backup roundtrip and conflicts across records, profiles and daily items',async t=>{
 const {store,dir}=await fixture(t);const saved=await store.dailyAdd({text:'daily',expectedRevision:0});
 await store.dailyUpdate({id:saved.item.id,expectedRevision:1,date:TODAY,done:true});
 const data=await store.exportBackup();assert.equal(JSON.parse(data).dailyItems.length,1);
 const restored=new MeStore({filePath:path.join(dir,'restore.json')});
 const result=await restored.importBackup({data,expectedRevision:0});assert.deepEqual(result,{revision:1,addedRecords:0,addedProfiles:0,addedDailyItems:1,skipped:0});
 assert.deepEqual((await restored.snapshot()).dailyItems,(await store.snapshot()).dailyItems);
 assert.deepEqual(await restored.importBackup({data,expectedRevision:1}),{revision:1,addedRecords:0,addedProfiles:0,addedDailyItems:0,skipped:1});
 const conflicting=JSON.parse(data);conflicting.dailyItems[0].text='conflict';
 await assert.rejects(restored.importBackup({data:JSON.stringify(conflicting),expectedRevision:1}),{code:'IMPORT_CONFLICT'});
 const foreign=JSON.parse(data);foreign.records.push({id:saved.item.id,content:'collision',occurredAt:'2026-11-10T00:00:00Z',recordedAt:'2026-11-10T00:00:00Z',updatedAt:'2026-11-10T00:00:00Z',category:'',tags:[],source:'manual',sensitive:false});
 await assert.rejects(restored.importBackup({data:JSON.stringify(foreign),expectedRevision:1}),{code:'VALIDATION_ERROR'});
 assert.deepEqual((await restored.snapshot()).dailyItems,(await store.snapshot()).dailyItems);
});
