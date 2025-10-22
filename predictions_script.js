// Initialize Supabase client
const supabaseUrl = "https://fgxbcpdyubvzkcdroubn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZneGJjcGR5dWJ2emtjZHJvdWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjY0MzEsImV4cCI6MjA3NTQ0MjQzMX0.xH-dUDqeez5X90rQ6CIviMlYwfggN_6uwRVee07Y3I8";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


let adminBtn = document.getElementById('admin');

let form = document.getElementById("predictionForm");
let nameInputField = document.getElementById('name');
let timeInputField = document.getElementById('time');
let submitBtn = document.getElementById('submit');

let refreshBtn = document.getElementById('refreshBtn');

let table = document.getElementById('predictionsTable');
let tableBody = document.getElementById('tableBody');
let successMsg = document.getElementById("successMsg");

let winnersTable = document.getElementById('winnersTable');
let winnersTableBody = document.getElementById('winnersTableBody');

let actualTime = document.getElementById('actualTime');
let setActualTimeBtn = document.getElementById('setActual');

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayIso = today.toISOString()

window.addEventListener('DOMContentLoaded', loadPredictions);
window.addEventListener('DOMContentLoaded', loadWinners);

// window.addEventListener('DOMContentLoaded', () => {
//     disableInputsOutsideTimespan();
//     // Recheck every minute
//     setInterval(disableInputsOutsideTimespan, 60 * 1000);
// });

form.addEventListener('submit', async function(event) {
  // Prevent the default form submission behavior (which causes page reload)
  event.preventDefault(); 

  const name = nameInputField.value.trim();
  const time = timeInputField.value.trim();
  const submittedAt = new Date().toISOString();

  if (!validateForm(name, time)) {
    return;
  }

  const { data, error } = await supabase
    .from('predictions')
    .insert([
        { name: name, predicted_time: time, submitted_at: submittedAt}])
    .select();

    if (error) {
        if (error.message.includes("duplicate key")) {
            alert("Tvoje ime i/ili vreme je već uneto danas!");
        } else {
            alert("There was an error submitting your prediction.");
        }
    } else {
        console.log("Inserted data:", data);
        successMsg.textContent = "✅ Predikcija uspešno sačuvana!";
        form.reset(); // clear inputs
    }
    
    loadPredictions();
});

refreshBtn.addEventListener("click", () => loadPredictions())

function validateForm(name, time) {
    if (name == "" || time == "") {
        alert("Popuni polje za ime i/ili vreme!");
        return false;
    } 
    return true;
}

async function fetchPredictions() {

    const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .gte('submitted_at', todayIso)
    .order('submitted_at', { ascending: false }); // newest first

    if (error) {
        console.error("Error fetching predictions:", error);
        return [];
    }
    
    console.log("Fetched predictions:", data);
    return data; // this is an array of objects

}

async function loadPredictions() {
    const predictions = await fetchPredictions();
    renderTable(predictions); 
}

function renderTable(array) {
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    for (const rowData of array) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = rowData.name;
        row.appendChild(nameCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = rowData.predicted_time;
        row.appendChild(timeCell);

        const isoString = rowData.submitted_at;
        const dateObject = new Date(isoString);
        const humanReadableDateTime = dateObject.toLocaleString();
        const submittedCell = document.createElement('td');
        submittedCell.textContent = humanReadableDateTime;
        row.appendChild(submittedCell);

        tableBody.appendChild(row);
    };
}

function disableInputsOutsideTimespan() {
    const now = new Date();
    //const now = new Date(2025, 10, 16, 10, 59, 0, 0);

    const nowHr = now.getHours();
    const nowMin = now.getMinutes();

    const openHr = 9;
    const closeHr = 12;

    if((openHr <= nowHr && nowHr<= closeHr - 1) || (nowHr === closeHr && nowMin === 0)) {
        nameInputField.disabled = false;
        timeInputField.disabled = false;
    } else {
        nameInputField.disabled = true;
        timeInputField.disabled = true;
        statusMsg.textContent = "Predikcije su zatvorene. Vrati se na stranicu između 9:00 i 12:00.";
    }
}

async function fetchWinners() {
    const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('winner', true)
    .order('submitted_at', { ascending: false }); // newest first

    if (error) {
        console.error("Error fetching winners:", error);
        return [];
    }
    
    console.log("Fetched winners:", data);
    return data; // this is an array of objects
}

async function loadWinners() {
    const winners = await fetchWinners();
    renderWinners(winners); 
}

function renderWinners(array) {
    if (winnersTableBody) {
        winnersTableBody.innerHTML = '';
    }
    for (const rowData of array) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = rowData.name;
        row.appendChild(nameCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = rowData.predicted_time;
        row.appendChild(timeCell);

        const isoString = rowData.submitted_at;
        const dateObject = new Date(isoString);
        const humanReadableDateTime = dateObject.getDay();
        const submittedCell = document.createElement('td');
        submittedCell.textContent = dateObject.getUTCDate() + '.' + dateObject.getUTCMonth() + '.' + dateObject.getUTCFullYear() + '.';
        row.appendChild(submittedCell);

        winnersTableBody.appendChild(row);
    };
}

setActualTimeBtn.addEventListener('click', () => checkForWinners());

async function checkForWinners() {
  const arrivalTime = actualTime.value.trim();
  if (!arrivalTime) {
    alert("Morate uneti vreme!");
    return;
  }

  const { data, error } = await supabase
    .from('predictions')
    .update({ winner: true })
    .eq('predicted_time', arrivalTime)
    .gte('submitted_at', todayIso)
    .select();

  if (error) {
    console.error("Update error:", error);
    alert("There was an error updating winners!");
  } else {
    console.log("Updated winners:", data);
    alert("Vreme je uspešno uneto, proveravamo da li je neko pobedio...");
  }

  loadWinners()
}

