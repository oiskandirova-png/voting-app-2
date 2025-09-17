const CRITERIA = 7;
let currentVote = {};
const API = window.location.origin; // теперь запросы идут на текущий сервер

document.querySelectorAll(".scale").forEach(scale=>{
  for(let i=1;i<=4;i++){
    const btn=document.createElement("button");
    btn.textContent=i;
    btn.onclick=()=>{currentVote[scale.dataset.crit]=i; [...scale.children].forEach(c=>c.style.background="none"); btn.style.background="#2cb67d";}
    scale.appendChild(btn);
  }
});

async function submitVote(){
  const speaker = document.getElementById("speakerId").value;
  if(!speaker){alert("Укажи номер спикера"); return;}
  if(Object.keys(currentVote).length<CRITERIA){alert("Заполни все критерии"); return;}

  await fetch(API+"/vote", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({speaker, scores:{...currentVote}})
  });

  alert("Спасибо за голос! 🎉");
  currentVote={};
  location.reload();
}

async function showResults(){
  const res = await fetch(API+"/results");
  const votes = await res.json();

  const resultsDiv = document.getElementById("results");
  const table = document.getElementById("resultsTable");
  resultsDiv.style.display = "block";
  table.innerHTML = "";

  const bySpeaker = {};
  votes.forEach(v=>{
    if(!bySpeaker[v.speaker]) bySpeaker[v.speaker] = [];
    bySpeaker[v.speaker].push(v.scores);
  });

  for(let sp in bySpeaker){
    let critAvg = [];
    for(let c=0; c<CRITERIA; c++){
      let sum = 0;
      let count = 0;
      bySpeaker[sp].forEach(v=>{
        if(v[c] !== undefined){
          sum += Number(v[c]);
          count++;
        }
      });
      critAvg.push(count>0 ? (sum/count).toFixed(1) : 0);
    }
    const overall = (critAvg.reduce((a,b)=>a+parseFloat(b),0)/CRITERIA).toFixed(2);

    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `<h3>Спикер ${sp}</h3>
                     <p>Средний балл по всем критериям: <b>${overall}</b></p>`;

    const barContainer = document.createElement("div");
    barContainer.className = "bar-container";
    critAvg.forEach((val, idx)=>{
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = (val*30)+"px";
      bar.textContent = val;
      bar.title = `Критерий ${idx+1}`;
      barContainer.appendChild(bar);
    });
    div.appendChild(barContainer);
    table.appendChild(div);
  }
}

document.getElementById("clearVotesBtn").addEventListener("click", async function() {
  if(confirm("Вы действительно хотите удалить все голоса?")){
    await fetch(API+"/votes", {method:"DELETE"});
    location.reload();
  }
});
