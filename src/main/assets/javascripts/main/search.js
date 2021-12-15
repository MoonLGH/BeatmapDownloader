document.querySelector(".content-query__input").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    search();
  }
});


const cats = document.querySelectorAll("#categories input");
const modes = document.querySelectorAll("#mode input");
const generals = document.querySelectorAll("#general input");

cats.forEach(function(currentBtn) {
  currentBtn.addEventListener("click", function(event) {
    search();
  });
});

modes.forEach(function(currentBtn) {
  currentBtn.addEventListener("click", function(event) {
    search();
  });
});


generals.forEach(function(currentBtn) {
  currentBtn.addEventListener("click", function(event) {
    search();
  });
});


async function search() {
  const query = document.querySelector(".content-query__input").value;
  const mode = document.querySelector("#mode input:checked").getAttribute("data");
  const categories = document.querySelector("#categories input:checked").getAttribute("data");
  const general = [];

  document.querySelectorAll("#general input:checked").forEach((input) => {
    if (!input.getAttribute("data") || !input.getAttribute("data").length > 0) return;
    general.push(input.getAttribute("data"));
  });

  let user = JSON.parse(localStorage.getItem("user"));
  if (Date.now() > user.refreshAfter) {
    await client.refresh();
  }
  user = JSON.parse(localStorage.getItem("user"));
  const searchdata = await client.searchBeatmaps(user.token, {
    q: query || undefined,
    s: categories || "leaderboard",
    m: mode || undefined,
    c: general.length > 0 ? general.join(".") : undefined,
  });

  deleteAllMaps();

  if (query && query.length > 0) {
    ipcRenderer.send("rpcState", {details: "Beatmaps Searching", state: "Searching for " + query});
  } else {
    ipcRenderer.send("rpcState", {details: "Beatmaps Menu", state: "Searching Beatmaps"});
  }

  loadBeatmaps(searchdata);
}
