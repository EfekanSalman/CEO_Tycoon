import re,os,sys,unicodedata
F=sys.argv[1];R=sys.argv[2]
L=open(F,encoding='utf-8').read().split('\n')
# yayınlama sarmalayıcısı: 1. satır ve son satır; özgün index.html = 2..(n-1) satırlar
orig=L[1:-1]
def idx(pred,start=0):
  for i in range(start,len(orig)):
    if pred(orig[i]):return i
  raise SystemExit('bulunamadı')
s0=idx(lambda x:x=='<style>');s1=idx(lambda x:x=='</style>',s0)
j0=idx(lambda x:x=='<script>',s1);j1=len(orig)-1
while orig[j1]!='</script>':j1-=1
open(f'{R}/src/head.html','w',encoding='utf-8').write('\n'.join(orig[:s0])+'\n')
open(f'{R}/src/css/main.css','w',encoding='utf-8').write('\n'.join(orig[s0+1:s1])+'\n')
open(f'{R}/src/body.html','w',encoding='utf-8').write('\n'.join(orig[s1+1:j0])+'\n')
open(f'{R}/src/tail.html','w',encoding='utf-8').write('\n'.join(orig[j1+2:]))
js=orig[j0+1:j1];hdr=re.compile(r'^/\* =+ (.*?) =+ \*/$')
cuts=[i for i,x in enumerate(js) if hdr.match(x)]
assert cuts and cuts[0]==0,cuts[:3]
TR=str.maketrans('çğıöşüÇĞİÖŞÜ','cgiosuCGIOSU')
for n,(a,b) in enumerate(zip(cuts,cuts[1:]+[len(js)]),1):
  name=hdr.match(js[a]).group(1).translate(TR).lower()
  slug=re.sub(r'[^a-z0-9]+','-',name).strip('-')[:40]
  open(f'{R}/src/js/{n:03d}-{slug}.js','w',encoding='utf-8').write('\n'.join(js[a:b])+'\n')
print('js dosyası',len(cuts),'satır',len(js))
