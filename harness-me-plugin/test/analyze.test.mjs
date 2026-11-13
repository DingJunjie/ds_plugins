import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExtraction, extractRecord, chooseModel } from '../lib/analyze.js';
import { MeRemote } from '../lib/index.js';

test('extraction never guesses water volume, preserves dimensional validation',()=>{
 const result=parseExtraction('{"summary":"喝水","category":"饮水","metrics":[{"kind":"water","value":1,"unit":"count"}]}');
 assert.deepEqual(result.metrics,[{kind:'water',value:1,unit:'count'}]);
 assert.deepEqual(parseExtraction('{"summary":"喝了200ml","category":"饮水","metrics":[{"kind":"water","value":200,"unit":"ml"}]}').metrics,[{kind:'water',value:200,unit:'ml'}]);
 assert.throws(()=>parseExtraction('{"metrics":[{"kind":"water","unit":"kg","value":1}]}'),/指标/);
 assert.throws(()=>parseExtraction('{"metrics":[{"kind":"water","unit":"ml","value":-1}]}'),/指标/);
});
test('model selection fails closed on ambiguous routes',()=>{
 assert.throws(()=>chooseModel({list:()=>[]}),/无法确定/);
 assert.throws(()=>chooseModel({list:()=>[{model:{current:()=>({provider:'a',model:'x'})}},{model:{current:()=>({provider:'b',model:'x'})}}]}),/无法确定/);
 assert.equal(chooseModel({list:()=>[{model:{current:()=>({provider:'a',model:'x'})}}]}).model,'x');
});
test('one record only reaches model, invalid finish is rejected', async()=>{
 let seen; const llm={async *stream(options){seen=options;yield {type:'text-delta',text:'{"summary":"事实","category":"生活","metrics":[]}'};yield {type:'finish',reason:{kind:'stop'}};}};
 const value=await extractRecord(llm,{provider:'provider',model:'model'},'我去了公园');
 assert.equal(seen.messages.length,1);assert.equal(seen.messages[0].content,'我去了公园');assert.equal(value.category,'生活');
 await assert.rejects(extractRecord({async *stream(){yield {type:'finish',reason:{kind:'max-tokens'}};}},{provider:'p',model:'m'},'x'),/未完整/);
});
test('remote stores raw data even when AI unavailable and sensitive stays local',async()=>{
 let wrote=false;
 const remote={ctx:{invocation:{peer:{principal:{kind:'owner'}}},agents:{list:()=>[]}},store:{async get(){return {revision:1,record:{id:'r',content:'昨天喝水',sensitive:false}}},async update(){wrote=true;}}};
 const bad=await MeRemote.prototype.request.call(remote,{op:'analyzeRecord',id:'r',expectedRevision:1});
 assert.equal(bad.ok,false);assert.equal(wrote,false);assert.match(bad.error.message,/原文已保存/);
 remote.store.get=async()=>({revision:1,record:{id:'r',content:'敏感资料',sensitive:true}});
 const denied=await MeRemote.prototype.request.call(remote,{op:'analyzeRecord',id:'r',expectedRevision:1});
 assert.equal(denied.ok,false);assert.match(denied.error.message,/敏感/);
});
