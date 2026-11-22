const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const {execFileSync}=require('node:child_process');const {randomBytes}=require('node:crypto');
test('Fresh database, owner login, protected route, session revocation',async t=>{
 const {PrismaClient}=require('@prisma/client'); const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'bjj-smoke-')),url='file:'+path.join(dir,'test.db').replaceAll('\\','/');
 let db,server;t.after(async()=>{if(server)await new Promise(r=>server.close(r));if(db)await db.$disconnect();fs.rmSync(dir,{recursive:true,force:true});});
 execFileSync(process.execPath,[path.join(root,'node_modules/prisma/build/index.js'),'migrate','deploy'],{cwd:root,env:{...process.env,DATABASE_URL:url,RUST_LOG:'info'},stdio:'pipe'});
 db=new PrismaClient({datasources:{db:{url}}});assert.equal(await db.gym.count(),0);assert.equal(await db.admin.count(),0);
 const password=randomBytes(24).toString('hex'),ownerLogin='owner@example.test';
 execFileSync(process.execPath,[path.join(root,'prisma/create-admin.js'),'--env'],{
  cwd:root,env:{...process.env,DATABASE_URL:url,ADMIN_LOGIN:ownerLogin,ADMIN_PASSWORD:password,ADMIN_NAME:'Test owner',ADMIN_ROLE:'OWNER'},stdio:'pipe'
 });
 const {createApp}=await import('../lib/app.js');const config={ROOT:root,production:false,origin:'http://127.0.0.1',sessionHours:4,sessionIdleMinutes:2};server=await new Promise(r=>{const s=createApp(db,config).listen(0,'127.0.0.1',()=>r(s));});const base='http://127.0.0.1:'+server.address().port;config.origin=base;config.origins=[base];
 assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/health/ready')).status,200);assert.equal((await fetch(base+'/admin',{redirect:'manual'})).status,303);assert.equal((await fetch(base+'/api/admin/dashboard')).status,401);
 const login=await fetch(base+'/api/admin/auth/login',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({login:ownerLogin,password})});assert.equal(login.status,200);
 const {securityConfig}=await import('../config/security.js');
 const sessionCookiePrefix=securityConfig(config).cookieName+'=';
 const cookie=login.headers.getSetCookie().map(header=>header.split(';',1)[0])
  .find(value=>value.startsWith(sessionCookiePrefix)&&value.length>sessionCookiePrefix.length);
 assert.ok(cookie,'Login must issue a non-empty session cookie');
 const {csrfToken}=await login.json();
 assert.equal((await fetch(base+'/api/admin/dashboard',{headers:{cookie}})).status,200);
 const editor={name:'Test editor',login:'Editor@example.test',role:'EDITOR',isActive:true,password};
 const access=await fetch(base+'/api/admin/access',{method:'POST',headers:{origin:base,cookie,'x-csrf-token':csrfToken,'content-type':'application/json'},body:JSON.stringify(editor)});
 assert.equal(access.status,200);
 assert.equal((await db.admin.findUnique({where:{login:'editor@example.test'}})).role,'EDITOR');
 assert.equal((await fetch(base+'/api/admin/auth/logout',{method:'POST',headers:{origin:base,cookie,'x-csrf-token':csrfToken}})).status,200);assert.equal((await fetch(base+'/api/admin/dashboard',{headers:{cookie}})).status,401);
});
