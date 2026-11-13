import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { MeStore } from '../lib/store.js';
async function make(t) { const d=await fs.mkdtemp(path.join(os.tmpdir(),'me-metrics-')); t.after(()=>fs.rm(d,{recursive:true,force:true})); return new MeStore({filePath:path.join(d,'me.json')}); }
const invalid = p => assert.rejects(p, {code:'VALIDATION_ERROR'});
test('metrics validate dimensions, normalize old records, and content edits clear derivations', async t => {
  const s=await make(t);
  const a=await s.add({content:'water',occurredAt:'2026-11-10T08:00:00+08:00',metrics:[{kind:'water',value:300,unit:'ml'},{kind:'water',value:1,unit:'count'}],analysis:{status:'done',summary:'parsed',model:'test'}});
  assert.equal(a.record.metrics.length,2); assert.equal(a.record.analysis.status,'done');
  const b=await s.update({id:a.record.id,expectedRevision:1,patch:{content:'corrected'}});
  assert.deepEqual(b.record.metrics,[]); assert.equal(b.record.analysis,null);
  for (const metric of [{kind:'water',value:1,unit:'min'},{kind:'exercise',value:1,unit:'kg'},{kind:'unknown',value:1,unit:'g'},{kind:'water',value:-1,unit:'ml'}]) await invalid(s.add({content:'bad',metrics:[metric]}));
});
test('profile metadata and observation uncertainty are preserved', async t => {
  const s=await make(t);
  const p=await s.profileSave({expectedRevision:0,content:'likes tests',group:'personality',kind:'observation',confidence:'confirmed',evidence:'conversation'});
  assert.equal(p.profile.group,'personality'); assert.equal(p.profile.kind,'observation'); assert.equal(p.profile.confidence,'tentative');
  assert.equal((await s.context()).profiles.length,1); assert.equal((await s.profileGet()).profiles.length,1);
});
test('stats are sparse, timezone grouped, future water ignored, and count once', async t => {
  const s=await make(t);
  const waterAt=new Date(Date.now()-60000).toISOString();
  await s.add({content:'water',occurredAt:waterAt,metrics:[{kind:'water',value:250,unit:'ml'},{kind:'water',value:1,unit:'count'}]});
  await s.add({content:'future',occurredAt:'2099-01-01T00:00:00Z',metrics:[{kind:'water',value:999,unit:'ml'}]});
  const out=await s.stats({days:3,timeZone:'Asia/Shanghai'});
  assert.equal(out.days.length,3); assert.equal(out.days.at(-1).waterMl,250); assert.equal(out.days.at(-1).waterCount,1); assert.equal(out.lastWaterAt,waterAt);
  assert.equal(out.days[0].exerciseMin,null); assert.equal(out.days[0].weightKg,null);
  await invalid(s.stats({days:0})); await invalid(s.stats({timeZone:'No/Such_Zone'}));
});
test('version1 backup remains version1 and old records normalize optional fields', async t => {
  const s=await make(t); const old={version:1,revision:4,records:[{id:'old1',content:'old',occurredAt:'2024-01-01T00:00:00Z',recordedAt:'2024-01-01T00:00:01Z',updatedAt:'2024-01-01T00:00:01Z',category:'',tags:[],source:'manual',sensitive:false}],profiles:[]};
  await s.importBackup({data:JSON.stringify(old),expectedRevision:0}); const got=await s.get({id:'old1'}); assert.deepEqual(got.record.metrics,[]); assert.equal(got.record.analysis,null); assert.equal(JSON.parse(await s.exportBackup()).version,1);
});
