import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('daily/future groups only appear when both have unfinished tasks',()=>{
 const source=fs.readFileSync(new URL('../floating-widget.js',import.meta.url),'utf8');
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 const today=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const render=tasks=>{
  let slot=0;
  const React={createElement:(tag,props,...children)=>({tag,props,children}),useState:f=>{const i=slot++;return [i===2?{revision:1,tasks}:typeof f==='function'?f():f,()=>{}];},useRef:v=>({current:v}),useCallback:f=>f,useEffect:()=>{}};
  const context=vm.createContext({React,window:{innerWidth:1000,innerHeight:800},localStorage:{getItem:()=>null}});
  vm.runInContext(source+';this.Component=createFloatingTodo({});',context);
  const nodes=[];const walk=n=>{if(n&&typeof n==='object'){nodes.push(n);(n.children||[]).flat().forEach(walk);}};walk(context.Component());return nodes;
 };
 const task=(id,due,done=false)=>({id,text:id,due,done,prio:'mid'});
 const nodes=render([task('today',today),task('overdue','2000-01-01'),task('undated',''),task('future','2099-12-31'),task('done','2099-12-31',true)]);
 const groups=nodes.filter(n=>n.props?.className==='htf-group');
 assert.equal(groups.length,2);assert.equal(groups[0].props['aria-label'],'每日');assert.equal(groups[1].props['aria-label'],'未来');
 assert.equal(nodes.filter(n=>n.props?.className==='htf-task').length,4);
 for(const tasks of [[],[task('future','2099-12-31')],[task('daily','')]]) assert.equal(render(tasks).filter(n=>n.props?.className==='htf-group').length,0);
});
