// reminders.js
const STORAGE_KEY = 'lifeplanner_v1';
const STREAK_KEY = 'lifeplanner_streak';

function readStreak() {
  return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":null}');
}
function updateStreakDisplay() {
  const s = readStreak();
  const el = document.getElementById('streakCount');
  if (el) el.textContent = s.count;
}
updateStreakDisplay();

// highlight nav tab
document.getElementById('navMotivation').classList.add('active');

// Motivation text logic
const quotes = [   
        "It always seems impossible until it's done - Nelson Mandela",
        "Always be a first version of yourself and not a second rate version of someone else - Judy Garland",   
        "Don't dream of winning, train for it! - Mo Farah",   
        "The brain is like a muscle. When it is in use we feel very good. Understanding is joyous - Carl Sagan",   
        "Beware; for I am fearless, and therefore powerful - Mary Shelly",   
        "Nowadays people know the price of everything and the value of nothing - Oscar Wilde",   
        "All we can know is that we know nothing. And that's the height of human wisdom - Leo Tolstoy",   
        "I can't go back to yesterday because I was a different person then - Lewis Carroll"
     ];
const motivationText = document.getElementById('motivationText');
const newMotivationBtn = document.getElementById('newMotivationBtn');
function newQuote(){
  motivationText.textContent = `"${quotes[Math.floor(Math.random()*quotes.length)]}"`;
}
newMotivationBtn.onclick = newQuote;
newQuote();

// Reminder list rendering (same as before)
function loadReminders() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const list = document.getElementById('reminderList');
  let allRem = [];
  Object.keys(data).forEach(day=>{
    const d = data[day];
    if (d.reminders) d.reminders.forEach(r=> allRem.push({...r, day}));
  });
  list.innerHTML = '';
  if (!allRem.length) {
    list.innerHTML = `<p class="muted">No reminders yet — go crush your goals!</p>`;
    return;
  }
  allRem.sort((a,b)=> a.time.localeCompare(b.time));
  allRem.forEach(r=>{
    const div = document.createElement('div');
    div.className = 'reminder';
    div.innerHTML = `<div class="time">${r.time}</div><div class="text">${r.text}</div><div class="day muted">${r.day}</div>`;
    list.appendChild(div);
  });
}
loadReminders();
