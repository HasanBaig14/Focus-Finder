import json, urllib.request, urllib.error
base='http://127.0.0.1:8787/api/'
def call(path,method='GET',body=None,who='test-user-a'):
 headers={'Content-Type':'application/json'}
 if who:headers.update({'oai-authenticated-user-id':who,'oai-authenticated-user-email':who+'@example.test'})
 req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
 try:
  with urllib.request.urlopen(req) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
assert call('tasks',who=None)[0]==401
body={'title':'API integration test','minutes':30,'priority':'High','category':'Work','due':'2026-10-29','reason':'Test'}
assert call('tasks','POST',{'tasks':[body]})[0]==200
_,rows=call('tasks');t=next(t for t in rows if t['title']==body['title']);ident=t['id']
assert not any(t['id']==ident for t in call('tasks',who='test-user-b')[1])
assert call('tasks','PATCH',{'id':ident,'completed':True},who='test-user-b')[0]==404
edited={**t,'minutes':75,'title':'Edited integration task'}
assert call('tasks','PATCH',edited)[0]==200
updated=next(t for t in call('tasks')[1] if t['id']==ident)
assert updated['minutes']==75 and updated['title']=='Edited integration task'
assert call('tasks','PATCH',{'id':ident,'completed':True})[0]==200
assert next(t for t in call('tasks')[1] if t['id']==ident)['completed']==True
assert call('tasks','POST',{'tasks':[{**body,'minutes':-1}]})[0]==400
assert call('tasks?id='+ident,'DELETE')[0]==200
assert not any(t['id']==ident for t in call('tasks')[1])
print('PASS: authentication, cross-user isolation, creation, editing, completion, validation, deletion')
