(() => {
  const KEY = "arpit_exam_prep_v1";
  const DATA = window.EXAM_DATA;
  let state = loadState();
  let supabaseClient = null;
  let currentUser = null;
  let progressChannel = null;
  let applyingRemote = false;

  function loadState(){
    try { return JSON.parse(localStorage.getItem(KEY)) || {done:{}}; }
    catch(e){ return {done:{}}; }
  }
  function setStatus(message){
    const el = document.getElementById("saveStatus");
    if(el) el.textContent = message;
  }
  async function saveState(){
    localStorage.setItem(KEY, JSON.stringify(state));
    setStatus(currentUser ? "Saving to cloud…" : "Saved on this device");
    renderAll();
    if(currentUser && supabaseClient && !applyingRemote){
      const { error } = await supabaseClient.from("study_progress").upsert({
        user_id: currentUser.id, progress: state, updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if(error){ setStatus("Cloud save failed"); showAuthMessage("Cloud save failed: " + error.message); }
      else setStatus("Synced just now");
    }
  }
  function showAuthMessage(message){
    const el=document.getElementById("authMessage"); if(el) el.textContent=message;
  }
  function setAuthenticatedUI(user){
    currentUser=user;
    const form=document.getElementById("authForm"), actions=document.getElementById("signedInActions");
    const email=document.getElementById("accountEmail"), stateEl=document.getElementById("accountState");
    if(form) form.hidden=!!user;
    if(actions) actions.hidden=!user;
    if(email) email.textContent=user ? user.email : "";
    if(stateEl) stateEl.textContent=user ? "Signed in · progress sync is enabled" : "Sign in to sync progress across your devices.";
    setStatus(user ? "Connecting to cloud…" : "Saved on this device");
  }
  async function connectAccount(user){
    setAuthenticatedUI(user);
    if(!user) return;
    const { data, error } = await supabaseClient.from("study_progress").select("progress").eq("user_id",user.id).maybeSingle();
    if(error){ showAuthMessage("Could not load cloud progress: " + error.message); return; }
    if(data && data.progress && data.progress.done){
      state={done:data.progress.done}; localStorage.setItem(KEY,JSON.stringify(state)); renderAll();
      showAuthMessage("Your latest cloud progress has been loaded on this device.");
    } else {
      const { error: saveError } = await supabaseClient.from("study_progress").upsert({user_id:user.id,progress:state,updated_at:new Date().toISOString()},{onConflict:"user_id"});
      if(saveError) showAuthMessage("Could not create cloud progress: " + saveError.message);
      else showAuthMessage("Cloud sync is ready. This device's existing progress was uploaded.");
    }
    if(progressChannel) await supabaseClient.removeChannel(progressChannel);
    progressChannel=supabaseClient.channel("progress-"+user.id)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"study_progress",filter:"user_id=eq."+user.id},payload=>{
        if(payload.new && payload.new.progress && payload.new.progress.done){
          applyingRemote=true; state={done:payload.new.progress.done}; localStorage.setItem(KEY,JSON.stringify(state)); renderAll(); applyingRemote=false;
          setStatus("Updated from another device"); showAuthMessage("A progress update from another device has been received.");
        }
      }).subscribe();
    setStatus("Synced");
  }
  async function initCloudSync(){
    const cfg=window.SUPABASE_CONFIG||{};
    const configured=cfg.url && cfg.anonKey && !cfg.url.includes("YOUR_") && !cfg.anonKey.includes("YOUR_");
    const buttons=["signInBtn","signUpBtn"];
    if(!configured || !window.supabase){
      buttons.forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=true;});
      showAuthMessage("Cloud sync is not configured yet. Add your Supabase project URL and anon key in supabase-config.js.");
      return;
    }
    supabaseClient=window.supabase.createClient(cfg.url,cfg.anonKey);
    document.getElementById("signInBtn").addEventListener("click",async()=>{
      const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
      if(!email||!password){showAuthMessage("Enter your email and password.");return;}
      const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error){showAuthMessage(error.message);return;} await connectAccount(data.user);
    });
    document.getElementById("signUpBtn").addEventListener("click",async()=>{
      const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
      if(!email||password.length<6){showAuthMessage("Enter a valid email and a password with at least 6 characters.");return;}
      const {data,error}=await supabaseClient.auth.signUp({email,password});
      if(error){showAuthMessage(error.message);return;}
      if(data.session) await connectAccount(data.user);
      else showAuthMessage("Account created. Check your email to confirm it, then sign in here.");
    });
    document.getElementById("signOutBtn").addEventListener("click",async()=>{
      if(progressChannel) await supabaseClient.removeChannel(progressChannel);
      await supabaseClient.auth.signOut(); setAuthenticatedUI(null); showAuthMessage("Signed out. This device's local copy remains available.");
    });
    const {data:{session}}=await supabaseClient.auth.getSession();
    if(session) await connectAccount(session.user); else setAuthenticatedUI(null);
    supabaseClient.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_OUT") setAuthenticatedUI(null);
    });
  }
  function allChapters(){
    return DATA.subjects.flatMap(s => s.chapters.map((c,i)=>({id:`${s.id}-${i}`,subject:s,chapter:c,index:i})));
  }
  function isDone(id){ return !!state.done[id]; }
  function counts(subject){
    const total = subject.chapters.length;
    const done = subject.chapters.filter((_,i)=>isDone(`${subject.id}-${i}`)).length;
    return {total,done,pct: total ? Math.round(done/total*100):0};
  }
  function dateObj(str){ return new Date(str+"T12:00:00"); }
  function niceDate(str, opts={weekday:"short",day:"numeric",month:"short"}) {
    return dateObj(str).toLocaleDateString("en-IN",opts);
  }
  function getPlanForToday(){
    const today = new Date();
    const local = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    return DATA.plan.find(p=>p[0]===local) || null;
  }
  function subjectById(id){ return DATA.subjects.find(s=>s.id===id); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

  window.showView = function(view){
    document.querySelectorAll(".view").forEach(el=>el.classList.toggle("hidden",el.id!==view));
    document.querySelectorAll(".tab").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
    window.scrollTo({top:0,behavior:"smooth"});
  };
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));

  function renderOverview(){
    const all = allChapters(), done = all.filter(x=>isDone(x.id)).length;
    const pct = all.length ? Math.round(done/all.length*100):0;
    document.getElementById("overallPct").textContent = pct+"%";
    document.getElementById("overallRing").style.setProperty("--progress",(pct*3.6)+"deg");
    document.getElementById("overallText").textContent = `${done} of ${all.length} chapters completed`;
    document.getElementById("doneCount").textContent = done;
    document.getElementById("leftCount").textContent = all.length-done;
    document.getElementById("subjectCount").textContent = DATA.subjects.length;
    const first = dateObj(DATA.examDates[0].date); first.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    document.getElementById("daysLeft").textContent = Math.max(0,Math.ceil((first-now)/86400000));
    const plan = getPlanForToday();
    const todayTasks = document.getElementById("todayTasks");
    if(plan){
      document.getElementById("todayLabel").textContent = niceDate(plan[0],{weekday:"long",day:"numeric",month:"long"});
      const s1=subjectById(plan[1]),s2=subjectById(plan[2]);
      todayTasks.innerHTML = taskCard(s1,plan[3],"12:00–2:00 PM","7:00–8:00 PM") + taskCard(s2,plan[4],"2:15–4:00 PM","8:00–9:00 PM");
    } else {
      document.getElementById("todayLabel").textContent = "No preparation block assigned for today";
      todayTasks.innerHTML = `<div class="task"><h4>Use today wisely</h4><p>Check the study plan tab for scheduled days. On exam days, revise the next paper after your exam.</p></div><div class="task"><h4>Daily revision</h4><p>Spend time on BK formats and Maths problem-solving if those are your weakest areas.</p></div>`;
    }
    document.getElementById("subjectCards").innerHTML = DATA.subjects.map(s=>{
      const c=counts(s);
      return `<div class="subject"><div class="subject-top"><h4>${escapeHtml(s.name)}</h4><span class="tag ${s.priority!=="high"?"normal":""}">${s.priority==="high"?"PRIORITY":"REGULAR"}</span></div><div class="bar"><i style="width:${c.pct}%"></i></div><div class="muted">${c.done}/${c.total} chapters · ${c.pct}%</div></div>`;
    }).join("");
  }
  function taskCard(s,topic,learn,rev){
    return `<div class="task"><div class="time">${learn} · NEW LEARNING</div><h4>${escapeHtml(s.name)}</h4><p>${escapeHtml(topic)}</p><div class="time" style="margin-top:12px">${rev} · REVISION</div><p>Recall without notes, then practise questions and correct mistakes.</p></div>`;
  }
  function renderPlan(){
    document.getElementById("planList").innerHTML = DATA.plan.map(p=>{
      const s1=subjectById(p[1]),s2=subjectById(p[2]);
      return `<div class="day"><div class="daydate">${niceDate(p[0])}<small>${p[0]}</small></div><div class="plan-sub"><strong>${escapeHtml(s1.name)}</strong><small>12–2 learning · 7–8 revision</small><div class="muted">${escapeHtml(p[3])}</div></div><div class="plan-sub"><strong>${escapeHtml(s2.name)}</strong><small>2:15–4 learning · 8–9 revision</small><div class="muted">${escapeHtml(p[4])}</div></div></div>`;
    }).join("");
  }
  function renderSyllabus(){
    document.getElementById("syllabusList").innerHTML = DATA.subjects.map(s=>{
      const c=counts(s);
      return `<section class="subject-block"><div class="subject-title"><h4>${escapeHtml(s.name)}</h4><span class="muted">${c.done}/${c.total} done · ${c.pct}%</span></div><div class="bar" style="margin:0;border-radius:0"><i style="width:${c.pct}%"></i></div><div class="chapter-list">${s.chapters.map((ch,i)=>{
        const id=`${s.id}-${i}`,done=isDone(id);
        return `<div class="chapter ${done?"done":""}"><input type="checkbox" id="${id}" data-chapter="${id}" ${done?"checked":""}><label for="${id}">${escapeHtml(ch)}</label><small>${done?"DONE":"PENDING"}</small></div>`;
      }).join("")}</div></section>`;
    }).join("");
    document.querySelectorAll("[data-chapter]").forEach(cb=>cb.addEventListener("change",()=>{
      state.done[cb.dataset.chapter]=cb.checked;
      saveState();
    }));
  }
  function renderExams(){
    document.getElementById("examList").innerHTML = DATA.examDates.map(e=>{
      const d=dateObj(e.date);
      return `<div class="exam"><div class="exam-date"><b>${d.getDate()}</b><small>${d.toLocaleDateString("en-IN",{month:"short"})}</small></div><div><strong>${escapeHtml(e.subject)}</strong><p>${niceDate(e.date,{weekday:"long",day:"numeric",month:"long"})} · 3:15–6:15 PM</p></div></div>`;
    }).join("");
  }
  function renderAll(){ renderOverview(); renderPlan(); renderSyllabus(); renderExams(); }
  window.exportBackup = function(){
    const payload={version:1,exportedAt:new Date().toISOString(),progress:state};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="exam-prep-progress-backup.json";a.click();URL.revokeObjectURL(url);
  };
  document.getElementById("importFile").addEventListener("change",async e=>{
    const file=e.target.files[0]; if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());
      const incoming=parsed.progress || parsed;
      if(!incoming.done || typeof incoming.done!=="object") throw new Error("Invalid backup");
      state={done:incoming.done}; saveState(); alert("Backup imported successfully.");
    }catch(err){alert("Could not import this file. Choose a backup exported from this dashboard.");}
    e.target.value="";
  });
  window.resetProgress = function(){
    if(!confirm("Reset all chapter progress on this device? Export a backup first if you may need it."))return;
    state={done:{}}; saveState();
  };
  renderAll();
  initCloudSync();
})();