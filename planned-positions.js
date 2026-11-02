/* Planned positions enhancement: existing staff cards and organisation controls are preserved. */
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=x=>[x.department_id,String(x.title||'').trim().toLowerCase(),Number(x.rank_code)].join('|');
 const card=(p,count,v)=>'<div class="ec-hierarchy-person ec-hierarchy-profile-card ec-position-vacant"><div class="ec-hierarchy-profile-button"><span class="ec-hierarchy-avatar ec-hierarchy-avatar-placeholder" aria-hidden="true">+</span><span class="ec-hierarchy-person-info"><strong>'+esc(p.title)+(count>1?' ×'+count:'')+'</strong><small>'+(v?'Applications open':'Position unfilled')+'</small></span></div>'+(v?'<button class="button light ec-position-action" type="button" data-position-apply="'+esc(v.id)+'">Apply now</button>':'')+'</div>';
 async function enhance(type,id,publicView){
  const root=document.getElementById('ecOrgStaffChart');if(!root)return;
  const [positions,staff,manual,vacancies,depts]=await Promise.all([
   db.from('ec_org_positions').select('*').eq('org_type',type).eq('org_id',id),
   db.from('ec_org_staff').select('job_title,department_id,rank_code').eq('org_type',type).eq('org_id',id).eq('status','accepted'),
   publicView?Promise.resolve({data:[]}):db.from('ec_org_staff_manual').select('job_title,department_id,rank_code').eq('org_type',type).eq('org_id',id),
   db.from('ec_org_vacancies').select('id,title,department_id,rank_code').eq('org_type',type).eq('org_id',id).eq('status','open'),
   db.from('ec_org_departments').select('id,name').eq('org_type',type).eq('org_id',id)
  ]);
  if(positions.error||staff.error||vacancies.error||depts.error)return;
  if(!root.isConnected)return;
  root.querySelectorAll('.ec-position-vacant,.ec-position-manager').forEach(el=>el.remove());
  const allStaff=[...(staff.data||[]),...(manual.data||[])];
  for(const p of positions.data||[]){
   const occupied=allStaff.filter(x=>x.department_id===p.department_id&&Number(x.rank_code)===Number(p.rank_code)&&String(x.job_title||'').trim().toLowerCase()===String(p.title).trim().toLowerCase()).length;
   const missing=Math.max(0,p.planned_count-occupied);if(!missing)continue;
   const dept=(depts.data||[]).find(d=>d.id===p.department_id);if(!dept)continue;
   const node=[...root.querySelectorAll('.ec-hierarchy-node')].find(n=>n.querySelector(':scope > .ec-hierarchy-head strong')?.textContent.trim()===dept.name);
   const area=node?.querySelector(':scope > .ec-hierarchy-staff');if(!area)continue;
   const v=(vacancies.data||[]).find(v=>key(v)===key(p));
   let group=area.querySelector(':scope > .ec-position-vacant-rank');
   if(!group){group=document.createElement('div');group.className='ec-hierarchy-rank ec-position-vacant-rank';group.innerHTML='<div class="ec-hierarchy-rank-people"></div>';area.appendChild(group);}
   group.querySelector('.ec-hierarchy-rank-people').insertAdjacentHTML('beforeend',card(p,missing,v));
  }
  if(publicView)return;
  const panel=document.createElement('section');panel.className='ec-department-manager ec-position-manager';
  panel.innerHTML='<div><strong>Planned positions</strong><p class="small">Unfilled roles appear in the existing organisation chart. Accepted appointments reduce vacancies automatically.</p></div><form class="form" data-position-create><label>Role title<input name="title" required maxlength="120" placeholder="e.g. Teacher of English"></label><label>Department<select name="department_id" required><option value="">Select department</option>'+(depts.data||[]).map(d=>'<option value="'+esc(d.id)+'">'+esc(d.name)+'</option>').join('')+'</select></label><label>Rank ID<input type="number" name="rank_code" min="1" max="255" value="1" required></label><label>Number of positions<input type="number" name="planned_count" min="1" max="500" value="1" required></label><button class="button" type="submit">Add planned role</button></form><div class="ec-department-manage-list">'+(positions.data||[]).map(p=>'<div class="ec-department-config"><strong>'+esc(p.title)+' ×'+p.planned_count+'</strong><button type="button" class="button light" data-position-recruit="'+esc(p.id)+'">Recruit</button><button type="button" class="button light" data-position-delete="'+esc(p.id)+'">Remove</button></div>').join('')+'</div>';
  panel.dataset.orgType=type;panel.dataset.orgId=id;
  const manager=root.querySelector('.ec-department-manager');if(manager)manager.after(panel);else root.prepend(panel);
 }
 if(typeof renderOrganisationChart==='function'){
  const original=renderOrganisationChart;
  renderOrganisationChart=async function(type,id){await original.apply(this,arguments);await enhance(type,id,false);};
 }
 if(typeof loadShareableOrgChart==='function'){
  const original=loadShareableOrgChart;
  loadShareableOrgChart=async function(route){await original.apply(this,arguments);const [type,id]=route.split(':');await enhance(type,id,true);};
 }
 document.addEventListener('submit',async e=>{
  const form=e.target.closest('[data-position-create]');if(!form)return;e.preventDefault();
  const panel=form.closest('.ec-position-manager'),type=panel.dataset.orgType,id=panel.dataset.orgId,d=Object.fromEntries(new FormData(form));
  const r=await db.from('ec_org_positions').insert({org_type:type,org_id:id,title:d.title.trim(),department_id:d.department_id,rank_code:Number(d.rank_code),planned_count:Number(d.planned_count)});
  if(r.error){alert(r.error.message);return;}await renderOrganisationChart(type,id);
 });
 document.addEventListener('click',async e=>{
  const apply=e.target.closest('[data-position-apply]');
  if(apply){window.ecCareerTargetJob=apply.dataset.positionApply;window.ecPositionOpenApplication=apply.dataset.positionApply;go('org-jobs');return;}
  const del=e.target.closest('[data-position-delete]'),recruit=e.target.closest('[data-position-recruit]');if(!del&&!recruit)return;
  const panel=e.target.closest('.ec-position-manager');if(!panel)return;
  const type=panel.dataset.orgType,id=panel.dataset.orgId;
  if(del){if(!confirm('Remove this planned position? Existing staff will remain unchanged.'))return;const r=await db.from('ec_org_positions').delete().eq('id',del.dataset.positionDelete).eq('org_type',type).eq('org_id',id);if(r.error)alert(r.error.message);else await renderOrganisationChart(type,id);return;}
  const r=await db.from('ec_org_positions').select('*').eq('id',recruit.dataset.positionRecruit).eq('org_type',type).eq('org_id',id).maybeSingle();if(!r.data)return;
  ecShowOrgSubtool('vacancies');await loadOrgVacancies(type,id);
  const form=document.getElementById('ecOrgVacancyForm');if(!form)return;
  for(const name of ['title','department_id','rank_code','description','requirements'])if(form.elements[name])form.elements[name].value=r.data[name]||'';
  if(form.elements.category)form.elements.category.value='Staff';
  form.scrollIntoView({block:'start',behavior:'smooth'});
 });
 const oldFilter=window.ecFilterOrgJobs;
 if(typeof oldFilter==='function')window.ecFilterOrgJobs=function(){oldFilter.apply(this,arguments);const id=window.ecPositionOpenApplication;if(!id)return;const button=document.querySelector('[data-apply-job="'+id+'"]');if(button){window.ecPositionOpenApplication=null;button.click();}};
})();
