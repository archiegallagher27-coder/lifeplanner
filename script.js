// Highlight correct tab
const navPlanner = document.getElementById('navPlanner');
if (navPlanner) navPlanner.classList.add('active');

// === Life Planner Script ===
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

const STORAGE_KEY = "lifeplanner_v1";
const HOURS_START = 6, HOURS_END = 22;

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);
const datePicker = $('#datePicker');
datePicker.value = selectedDate.toISOString().slice(0,10);
datePicker.addEventListener('change', e => {
  selectedDate = new Date(e.target.value);
  renderAll();
});

const selectedDayFancy = $('#selectedDayFancy');
const scheduleGrid = $('#scheduleGrid');
const eventsCount = $('#eventsCount');
const modalBackdrop = $('#modalBackdrop');
const evtTitle = $('#evtTitle'), evtTime = $('#evtTime'), evtLength = $('#evtLength'), evtNote = $('#evtNote');
const modalTitle = $('#modalTitle'), modalDelete = $('#modalDelete');
const modalSave = $('#modalSave'), modalCancel = $('#modalCancel');

let editingIndex = null;

function getDayData() {
  const iso = datePicker.value;
  const data = readStore();
  if(!data[iso]) data[iso] = { events: [], goals: [], reminders: [] };
  return data[iso];
}
function saveDayData(dayData) {
  const data = readStore();
  data[datePicker.value] = dayData;
  writeStore(data);
}

function renderAll() {
  selectedDayFancy.textContent = new Date(datePicker.value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  renderSchedule();
}
function renderSchedule() {
  scheduleGrid.innerHTML = '';
  for(let h=HOURS_START; h<=HOURS_END; h++){
    const hourLabel = document.createElement('div');
    hourLabel.className = 'hour';
    hourLabel.textContent = `${h%12===0?12:h%12} ${h<12?'AM':'PM'}`;
    scheduleGrid.appendChild(hourLabel);

    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.hour = h;
    slot.addEventListener('click', e=>{
      if(e.target.closest('.event')) return;
      openEventModal({time: `${String(h).padStart(2,'0')}:00`, length: 60});
    });
    scheduleGrid.appendChild(slot);
  }
  renderEvents();
}
function renderEvents() {
  const data = getDayData();
  $$('.slot', scheduleGrid).forEach(s=>s.innerHTML='');
  data.events.sort((a,b)=>a.time.localeCompare(b.time));
  data.events.forEach((evt, idx)=>{
    const hour = parseInt(evt.time.split(':')[0]);
    const slot = $(`.slot[data-hour="${hour}"]`);
    if(slot){
      const div = document.createElement('div');
      div.className = 'event';
      div.textContent = `${evt.time} - ${evt.title}`;
      div.addEventListener('click', e=>{
        e.stopPropagation();
        openEventModal(evt, idx);
      });
      slot.appendChild(div);
    }
  });
  eventsCount.textContent = `${data.events.length} events`;
}

document.querySelector('form')?.addEventListener('submit', e => {
  e.preventDefault(); // okay
});


// --- Modal ---
function openEventModal(evt={}, index=null){
  editingIndex = index;
  evtTitle.value = evt.title || '';
  evtTime.value = evt.time || '08:00';
  evtLength.value = evt.length || 60;
  evtNote.value = evt.note || '';
  modalTitle.textContent = index===null?'Add event':'Edit event';
  modalDelete.style.display = index===null?'none':'inline-block';
  modalBackdrop.style.display = 'flex';
}
function closeModal(){
  modalBackdrop.style.display = 'none';
  editingIndex = null;
}
modalCancel.onclick = closeModal;
modalBackdrop.addEventListener('click', e=>{
  if(e.target === modalBackdrop) closeModal();
});
modalSave.onclick = ()=>{
  const data = getDayData();
  const evt = {
    title: evtTitle.value || '(no title)',
    time: evtTime.value,
    length: parseInt(evtLength.value) || 60,
    note: evtNote.value
  };
  if(editingIndex===null) data.events.push(evt);
  else data.events[editingIndex] = evt;
  saveDayData(data);
  closeModal();
  renderEvents();
};
modalDelete.onclick = ()=>{
  const data = getDayData();
  if(editingIndex!==null) data.events.splice(editingIndex,1);
  saveDayData(data);
  closeModal();
  renderEvents();
};

// --- Clock ---
function refreshClock(){
  const now = new Date();
  $('#clock').textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
setInterval(refreshClock, 1000);
refreshClock();

// Initial render
renderAll();
// === Streak System ===
const STREAK_KEY = 'lifeplanner_streak';

function readStreak() {
  return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}');
}
function writeStreak(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}
function updateStreakDisplay() {
  const s = readStreak();
  $('#streakCount').textContent = s.count;
}

function checkAndUpdateStreak() {
  const streak = readStreak();
  const today = new Date().toISOString().slice(0,10);
  const data = getDayData(today);

  const hasGoals = data.goals && data.goals.some(g=>g.done);
  if (!hasGoals) return; // no progress yet today

  if (streak.lastDate === today) return; // already counted

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yISO = yesterday.toISOString().slice(0,10);

  if (streak.lastDate === yISO) {
    streak.count += 1; // consecutive day
  } else {
    streak.count = 1; // reset streak
  }

  streak.lastDate = today;
  writeStreak(streak);
  updateStreakDisplay();
}

// Call once on load
updateStreakDisplay();

// Check streak when goals change
function handleGoalCompletion() {
  checkAndUpdateStreak();
}
// Register the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(reg => console.log("✅ Service Worker registered:", reg.scope))
      .catch(err => console.log("❌ Service Worker registration failed:", err));
  });
}
