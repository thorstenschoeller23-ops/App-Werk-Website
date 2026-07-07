document.documentElement.classList.add('js');

/* ========== Scroll-Reveal ========== */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ========== Nav: Sticky + Fortschritt + Scrollspy ========== */
const nav=document.getElementById('nav'), progressBar=document.getElementById('progressBar');
const spyLinks=[...document.querySelectorAll('#navLinks a[href^="#"]')].filter(a=>a.getAttribute('href').length>1);
const spySections=spyLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
function onScroll(){
  nav.classList.toggle('scrolled',scrollY>20);
  const h=document.documentElement;
  progressBar.style.width=(scrollY/(h.scrollHeight-innerHeight)*100)+'%';
  /* Scrollspy */
  let current=null;
  spySections.forEach(sec=>{ if(sec.getBoundingClientRect().top<=140) current=sec.id; });
  spyLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+current));
}
addEventListener('scroll',onScroll,{passive:true}); onScroll();

/* ========== Mobile-Menü ========== */
const burger=document.getElementById('burger'), mMenu=document.getElementById('mobileMenu');
burger.addEventListener('click',()=>{
  const open=mMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded',open);
  document.body.style.overflow=open?'hidden':'';
});
mMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mMenu.classList.remove('open'); document.body.style.overflow='';
}));

/* ========== Zähler ========== */
const fmt=(n,dec)=>n.toFixed(dec).replace('.',',');
const cIO=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=parseFloat(el.dataset.count), dec=(el.dataset.count.includes('.'))?1:0;
    const suffix=el.dataset.suffix||'';
    const t0=performance.now(), dur=1400;
    (function tick(t){
      const p=Math.min((t-t0)/dur,1), ease=1-Math.pow(1-p,3);
      el.innerHTML=fmt(target*ease,dec)+suffix;
      if(p<1) requestAnimationFrame(tick);
    })(t0);
    cIO.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cIO.observe(el));

/* ========== LIVE-DEMO ========== */
(function(){
  const listS=document.getElementById('listService'),
        listK=document.getElementById('listKitchen'),
        listB=document.getElementById('listBar'),
        logMsg=document.getElementById('logMsg'),
        pK=document.getElementById('panelKitchen'),
        pB=document.getElementById('panelBar');
  if(!listS||!pK||!pB) return; /* nur auf Startseite aktiv */
  let table='3', oid=0;
  const orders={};

  document.getElementById('tableSelect').addEventListener('click',e=>{
    const b=e.target.closest('.table-btn'); if(!b) return;
    document.querySelectorAll('.table-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); table=b.dataset.table;
    log(`Tisch ${table} ausgewählt.`);
  });

  function now(){const d=new Date();return d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});}
  function log(m){logMsg.textContent=`${now()} · ${m}`;}
  function hideEmpty(list){const e=list.querySelector('.order-empty');if(e)e.style.display='none';}
  function pulse(p){p.classList.add('pulse');setTimeout(()=>p.classList.remove('pulse'),700);}

  const STATUS={new:{cls:'st-new',txt:'NEU',next:'work'},work:{cls:'st-work',txt:'IN ARBEIT',next:'done'},done:{cls:'st-done',txt:'✓ FERTIG',next:null}};
  const SVC={new:{bg:'#FFE9E2',c:'#C2340F',t:'BESTELLT'},work:{bg:'#FFF3D6',c:'#9A6A00',t:'IN ARBEIT'},done:{bg:'#DCF5E9',c:'#0B7A4F',t:'✓ FERTIG'}};

  function setStatus(id,st){
    const o=orders[id]; if(!o) return;
    o.status=st;
    const s=STATUS[st];
    o.btn.className='status-btn '+s.cls; o.btn.textContent=s.txt;
    const v=SVC[st];
    o.svc.style.background=v.bg; o.svc.style.color=v.c; o.svc.textContent=v.t;
    pulse(document.getElementById('panelService'));
    log(`${o.name} (Tisch ${o.table}) → ${v.t.replace('✓ ','')}. Service-Tablet aktualisiert.`);
  }

  document.querySelector('#panelService .item-grid').addEventListener('click',e=>{
    const b=e.target.closest('.item-btn'); if(!b) return;
    const name=b.dataset.name, type=b.dataset.type, id=++oid;
    const targetList=type==='food'?listK:listB;
    const targetPanel=type==='food'?pK:pB;
    const dest=type==='food'?'Küche':'Schanke';

    hideEmpty(listS);
    const sc=document.createElement('div'); sc.className='order-card';
    sc.innerHTML=`<div class="info"><b>${name}</b><span>TISCH ${table} · ${now()} UHR</span></div>`;
    const svcTag=document.createElement('span'); svcTag.className='svc-status';
    sc.appendChild(svcTag); listS.prepend(sc);

    hideEmpty(targetList);
    const tc=document.createElement('div'); tc.className='order-card';
    tc.innerHTML=`<div class="info"><b>${name}</b><span>TISCH ${table} · ${now()} UHR</span></div>`;
    const btn=document.createElement('button'); btn.className='status-btn';
    btn.addEventListener('click',()=>{const o=orders[id];const nx=STATUS[o.status].next;if(nx)setStatus(id,nx);});
    tc.appendChild(btn); targetList.prepend(tc);

    orders[id]={name,table,status:'new',btn,svc:svcTag};
    setTimeout(()=>pulse(targetPanel),80);
    setStatusInit(id);
    log(`Neue Bestellung: ${name} für Tisch ${table} → erscheint sofort an der ${dest}.`);
  });

  function setStatusInit(id){
    const o=orders[id],s=STATUS.new,v=SVC.new;
    o.btn.className='status-btn '+s.cls; o.btn.textContent=s.txt;
    o.svc.style.background=v.bg; o.svc.style.color=v.c; o.svc.textContent=v.t;
  }
})();

/* ========== ERGEBNIS: Vorher/Nachher-Schalter ========== */
(function(){
  const sw=document.getElementById('baSwitch'); if(!sw) return;
  const cards=[...document.querySelectorAll('.ba-card')];
  const lb=document.getElementById('labelBefore'), la=document.getElementById('labelAfter');
  lb.classList.add('on'); sw.classList.add('ba-hint');
  let on=false, touched=false;

  function setAll(state){
    on=state;
    sw.setAttribute('aria-checked',on);
    lb.classList.toggle('on',!on); la.classList.toggle('on',on);
    cards.forEach((c,i)=>setTimeout(()=>c.classList.toggle('flipped',on), i*90));
  }
  sw.addEventListener('click',()=>{touched=true;sw.classList.remove('ba-hint');setAll(!on);});

  cards.forEach(c=>{
    c.addEventListener('click',()=>{touched=true;sw.classList.remove('ba-hint');c.classList.toggle('flipped');});
    c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('flipped');}});
  });

  const io2=new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(en.isIntersecting){
        io2.disconnect();
        setTimeout(()=>{ if(!touched) setAll(true); },1600);
      }
    });
  },{threshold:.4});
  io2.observe(document.getElementById('baGrid'));
})();

/* ========== PROZESS: Schlangenpfad mit Scroll-Fortschritt ========== */
(function(){
  const tl=document.getElementById('stepsTimeline'); if(!tl) return;
  const base=document.getElementById('stepsBase'), prog=document.getElementById('stepsProg');
  const steps=[...tl.querySelectorAll('.step')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let total=0, pts=[];

  function build(){
    const tr=tl.getBoundingClientRect();
    pts=steps.map(s=>{
      const c=s.querySelector('.step-num span').getBoundingClientRect();
      return {x:c.left+c.width/2-tr.left, y:c.top+c.height/2-tr.top};
    });
    const amp=Math.min(tr.width*0.22, 190);
    let d=`M ${pts[0].x} ${Math.max(pts[0].y-80,0)} Q ${pts[0].x-amp*0.35} ${pts[0].y-40} ${pts[0].x} ${pts[0].y}`;
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i], b=pts[i+1], dir=(i%2===0)?1:-1;
      d+=` C ${a.x+amp*dir} ${a.y+(b.y-a.y)*0.34}, ${b.x+amp*dir} ${b.y-(b.y-a.y)*0.34}, ${b.x} ${b.y}`;
    }
    const last=pts[pts.length-1];
    d+=` Q ${last.x+amp*0.35} ${last.y+45} ${last.x} ${last.y+80}`;
    base.setAttribute('d',d); prog.setAttribute('d',d);
    total=prog.getTotalLength();
    prog.style.strokeDasharray=total;
    update();
  }

  function update(){
    const r=tl.getBoundingClientRect();
    const progress=Math.min(Math.max((innerHeight*0.62 - r.top)/(r.height),0),1);
    if(reduced){ prog.style.strokeDashoffset=0; steps.forEach(s=>s.classList.add('done')); return; }
    prog.style.strokeDashoffset=total*(1-progress);
    const p=total>0?prog.getPointAtLength(total*progress):{y:0};
    steps.forEach((s,i)=>s.classList.toggle('done', pts[i] && pts[i].y<=p.y+2));
  }

  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',()=>build());
  build(); setTimeout(build,400);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(build);
})();

/* ========== Maus-Hover: 3D-Tilt ========== */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(matchMedia('(hover: none)').matches) return;
  const MAX=8;
  function bind(card){
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-5px) rotateX(${(-y*MAX).toFixed(2)}deg) rotateY(${(x*MAX).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='';});
  }
  document.querySelectorAll('.step-card,.svc,.kpi').forEach(bind);
  /* Testimonials nach dem Klonen binden */
  setTimeout(()=>document.querySelectorAll('.t-card').forEach(bind),0);
})();

/* ========== Kundenstimmen ========== */
const TESTI=[
 {t:"Früher haben wir uns Bestellungen quer durch die Küche zugerufen. Heute schaut jeder auf seinen Bildschirm und weiß Bescheid. Selbst an einem vollen Samstag geht nichts mehr unter.",n:"Sandra Klein",r:"Inhaberin · Restaurant Alte Mühle",a:"SK"},
 {t:"Die haben sich einen Tag in unsere Werkstatt gestellt und zugesehen. Die App danach passte wie angegossen – kein einziger Button, den wir nicht brauchen.",n:"Murat Öz",r:"Werkstattleiter · Autoservice Öz & Söhne",a:"MÖ"},
 {t:"Unser Empfang war das Nadelöhr der ganzen Praxis. Seit dem Self-Check-in läuft der Vormittag ruhig – und das Team hat wieder Zeit für die Patienten.",n:"Dr. Julia Hartmann",r:"Praxisinhaberin · Physio Hartmann",a:"JH"},
 {t:"Wir hatten drei teure Standard-Tools im Einsatz und keins passte. Die eine Mini-App von APPWERK hat alle drei ersetzt – und kostet uns keine Lizenzgebühren mehr.",n:"Thomas Berger",r:"Geschäftsführer · Berger Logistik",a:"TB"},
 {t:"Was mich überzeugt hat: Nach dem Start war nicht Schluss. Jede Idee aus dem Team wurde ernst genommen und schnell eingebaut. Das fühlt sich an wie eine eigene IT-Abteilung.",n:"Anna Vogt",r:"Betriebsleiterin · Braugasthof Vogt",a:"AV"},
 {t:"Bautagebuch in zwei Minuten vom Handy, abends alles sauber im Büro. Meine Poliere wollten erst nicht – jetzt will keiner mehr zurück zum Papier.",n:"Frank Lindner",r:"Inhaber · Lindner Bau GmbH",a:"FL"}
];
const track=document.getElementById('testiTrack');
if(track) [...TESTI,...TESTI].forEach(t=>{
  const d=document.createElement('div'); d.className='t-card';
  d.innerHTML=`<div class="stars">★★★★★</div><p>„${t.t}“</p>
    <div class="who"><div class="av">${t.a}</div><div><b>${t.n}</b><span>${t.r}</span></div></div>`;
  track.appendChild(d);
});

/* ========== FAQ: nur eins offen ========== */
document.querySelectorAll('.faq').forEach(f=>{
  f.addEventListener('toggle',()=>{ if(f.open) document.querySelectorAll('.faq').forEach(o=>{if(o!==f)o.open=false;}); });
});

/* ========== Formular ========== */
const cForm=document.getElementById('contactForm');
if(cForm) cForm.addEventListener('submit',e=>{
  e.preventDefault();
  const req=['fName','fCompany','fMail','fMsg'];
  let ok=true;
  req.forEach(id=>{
    const el=document.getElementById(id);
    const bad=!el.value.trim();
    el.style.borderColor = bad ? '#E8401C' : '';
    if(bad) ok=false;
  });
  const mail=document.getElementById('fMail');
  if(mail.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.value)){ mail.style.borderColor='#E8401C'; ok=false; }
  if(!ok) return;
  document.getElementById('contactForm').style.display='none';
  document.getElementById('formOk').style.display='block';
});