const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const today = new Date().toISOString().slice(0,10);
$('#today').textContent = new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
$('#booking-date').min = today; $('#booking-date').value = today;
let bookings = JSON.parse(localStorage.getItem('shinewash_bookings') || '[]');
let customers = JSON.parse(localStorage.getItem('shinewash_customers') || '[]');
let services = JSON.parse(localStorage.getItem('shinewash_services') || 'null') || [
 {name:'Basic Wash',description:'Exterior wash, rinse and hand dry.',price:5000,icon:'✦'},
 {name:'Premium Wash',description:'Exterior and interior cleaning with vacuum.',price:10000,icon:'✧'},
 {name:'Full Detailing',description:'Deep cleaning, polish and complete detailing.',price:25000,icon:'◇'}
];
const money = n => 'RWF ' + Number(n).toLocaleString();
const save = () => {localStorage.setItem('shinewash_bookings',JSON.stringify(bookings));localStorage.setItem('shinewash_customers',JSON.stringify(customers));localStorage.setItem('shinewash_services',JSON.stringify(services));};
const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function statusTag(s){return `<span class="status ${safe(s).replaceAll(' ','-')}">${safe(s)}</span>`}
function go(page){$$('.page').forEach(p=>p.classList.add('hidden'));$('#'+page+'-page').classList.remove('hidden');$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#page-title').textContent=page[0].toUpperCase()+page.slice(1);render();}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.goto)));
function openBooking(){$('#service-select').innerHTML=services.map(s=>`<option value="${safe(s.name)}">${safe(s.name)} — ${money(s.price)}</option>`).join('');$('#booking-dialog').showModal();}
$$('[data-open-booking]').forEach(b=>b.addEventListener('click',openBooking));$('#top-add').addEventListener('click',openBooking);
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#booking-dialog').close()));
$('#booking-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const service=services.find(s=>s.name===d.service);bookings.unshift({...d,price:service?.price||0,status:'Pending',id:Date.now()});if(!customers.some(c=>c.phone===d.phone))customers.push({name:d.customer,phone:d.phone,vehicle:d.vehicle,plate:d.plate});save();e.target.reset();$('#booking-date').value=today;$('#booking-dialog').close();render();});
function render(){const todays=bookings.filter(b=>b.date===today).length;$('#stat-bookings').textContent=bookings.length;$('#stat-today').textContent=todays;$('#stat-customers').textContent=customers.length;$('#stat-revenue').textContent=money(bookings.filter(b=>b.payment==='Paid').reduce((a,b)=>a+Number(b.price),0));
const rows=bookings.map(b=>`<tr><td><b>${safe(b.customer)}</b></td><td>${safe(b.vehicle)} / ${safe(b.plate)}</td><td>${safe(b.service)}</td><td>${safe(b.date)} ${safe(b.time)}</td><td>${money(b.price)}</td><td>${statusTag(b.status)}</td><td><select class="action-select" data-status="${b.id}"><option ${b.status==='Pending'?'selected':''}>Pending</option><option ${b.status==='In progress'?'selected':''}>In progress</option><option ${b.status==='Completed'?'selected':''}>Completed</option><option ${b.status==='Cancelled'?'selected':''}>Cancelled</option></select></td></tr>`).join('');
$('#booking-rows').innerHTML=rows||'<tr><td colspan="7">No bookings yet. Add your first booking.</td></tr>';
const recent=bookings.slice(0,5).map(b=>`<tr><td>${safe(b.customer)}</td><td>${safe(b.vehicle)}</td><td>${safe(b.service)}</td><td>${safe(b.date)}</td><td>${statusTag(b.status)}</td></tr>`).join('');
$('#recent-bookings').innerHTML=recent||'<tr><td colspan="5">No bookings recorded yet.</td></tr>';
$('#customer-rows').innerHTML=customers.map(c=>`<tr><td><b>${safe(c.name)}</b></td><td>${safe(c.phone)}</td><td>${safe(c.vehicle)}</td><td>${safe(c.plate)}</td></tr>`).join('')||'<tr><td colspan="4">No customers registered yet.</td></tr>';
$('#payment-rows').innerHTML=bookings.map(b=>`<tr><td>${safe(b.customer)}</td><td>${safe(b.service)}</td><td>${safe(b.date)}</td><td>${money(b.price)}</td><td>${b.payment==='Paid'?'<span class="status Completed">Paid</span>':'<span class="status Pending">Unpaid</span>'}</td></tr>`).join('')||'<tr><td colspan="5">No payments recorded yet.</td></tr>';
$('#service-grid').innerHTML=services.map(s=>`<article class="service-card"><div class="service-symbol">${safe(s.icon||'✦')}</div><h3>${safe(s.name)}</h3><p>${safe(s.description)}</p><strong>${money(s.price)}</strong><small> / vehicle</small></article>`).join('');
$$('[data-status]').forEach(el=>el.addEventListener('change',()=>{const b=bookings.find(x=>x.id==el.dataset.status);if(b){b.status=el.value;save();render();}}));
}
$('#booking-search').addEventListener('input',filterBookings);$('#status-filter').addEventListener('change',filterBookings);
function filterBookings(){const q=$('#booking-search').value.toLowerCase(),s=$('#status-filter').value;$$('#booking-rows tr').forEach(tr=>{const t=tr.textContent.toLowerCase();tr.style.display=(!q||t.includes(q))&&(!s||t.includes(s))?'':'none';});}
$('#customer-search').addEventListener('input',()=>{const q=$('#customer-search').value.toLowerCase();$$('#customer-rows tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none');});
$('#add-customer').addEventListener('click',()=>{const name=prompt('Customer full name:');if(!name)return;const phone=prompt('Phone number:');if(!phone)return;const vehicle=prompt('Vehicle model:')||'Not specified';const plate=prompt('Plate number:')||'Not specified';customers.push({name,phone,vehicle,plate});save();render();});
$('#add-service').addEventListener('click',()=>{const name=prompt('Service name:');if(!name)return;const price=Number(prompt('Price in RWF:'));if(!Number.isFinite(price)||price<0){alert('Enter a valid price.');return;}services.push({name,price,description:'Car wash service package.',icon:'✧'});save();render();});
render();
