import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('floating widget defaults top right, clamps saved positions, persists collapse and registers controls', () => {
 const source=fs.readFileSync(new URL('../floating-widget.js',import.meta.url),'utf8');
 const render=saved=>{
  const effects=[];
  const React={createElement:(tag,props,...children)=>({tag,props,children}),useState:f=>[typeof f==='function'?f():f,()=>{}],useRef:value=>({current:value}),useCallback:f=>f,useEffect:f=>effects.push(f)};
  const context=vm.createContext({React,window:{innerWidth:1000,innerHeight:800},localStorage:{getItem:()=>JSON.stringify(saved)}});
  vm.runInContext(source+';this.Component=createFloatingTodo({});',context);
  return context.Component();
 };
 const normal=render({});assert.equal(normal.props.style.left,670);assert.equal(normal.props.style.top,68);assert.equal(normal.props.style.width,310);
 const old=render({x:2000,y:-100,collapsed:true});assert.equal(old.props.style.left,822);assert.equal(old.props.style.top,54);assert.equal(old.props.style.width,170);
 const header=normal.children[1];assert.equal(typeof header.props.onPointerMove,'function');assert.equal(typeof header.props.onKeyDown,'function');
});
