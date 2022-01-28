const client = require("../assets/javascripts/api/client");
const fs = require("fs");
const {ipcRenderer} = require("electron");

let folders = [];

function readFolders() {
  if (!fs.existsSync(JSON.parse(localStorage.getItem("path")).filePaths[0])) {
    localStorage.removeItem("path");
    document.location.href = "../index.html";
    return;
  }
  folders = fs.readdirSync(JSON.parse(localStorage.getItem("path")).filePaths[0], {
    withFileTypes: true,
  }).map((dirent) => dirent.name).map((str) =>{
    return {id: str.split(" ")[0], name: str};
  });
}

function init() {
  readFolders();
  console.log(folders);
  move("lists");
  const table = document.querySelector("#listsTable");
  for (const list of folders) {
    table.innerHTML += `<tbody><tr style="color:black"><td data-label="ID">${list.id}</td><td data-label="Name">${list.name}</td></tr></tbody>`;
  }
}

init();

function move(params) {
  document.querySelectorAll("body > div.prompts").forEach((div) => {
    if (div.id !== params) {
      div.style.display = "none";
    } else {
      div.style.display = "block";
    }
  });
}

function exportLists() {
  document.getElementById("ListsJson").value = JSON.stringify(folders);
}

async function importLists() {
  let lists = JSON.parse(document.getElementById("importJson").value);
  lists = lists.filter((list) => !isNaN(list.id));
  document.getElementById("importJson").style.display = "none";
  const table = document.querySelector("#importTable");

  let user = JSON.parse(localStorage.getItem("user"));
  const refreshDate = new Date(user.refreshAfter);

  if (new Date() > refreshDate) {
    console.log("refreshing");
    const refreshed = await refresh(user.refresh);
    console.log(refreshed);
  }

  user = JSON.parse(localStorage.getItem("user"));
  for (const list of lists) {
    const downloadbtn = `<div onclick="download('${escape(encodeURIComponent(list.id))}','${escape(encodeURIComponent(list.name))}',this)" class="download-button">
    <svg ${folders.find((f) => f.id == list.id) ? "style=\"pointer-events: none;\"" : ""} focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16 map-content-information__download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg>
    </div>`;
    table.innerHTML += `<tbody>
    <tr style="color:black">
    <td data-label="ID">${list.id}</td>
    <td data-label="Name">${list.name}</td>
    <td data-label="Download" id="${list.id}">
    ${folders.find((f) => f.id == list.id) ? "Downloaded" : downloadbtn}
    </td>
    </tr>
    </tbody>`;
  }
}

async function download(beatmapId, title, ele) {
  ele.style.pointerEvents = "none";
  ele.parentNode.removeChild(ele);
  let user = JSON.parse(localStorage.getItem("user"));
  if (Date.now() > user.refreshAfter) {
    await client.refresh();
  }
  user = JSON.parse(localStorage.getItem("user"));
  ipcRenderer.send("downloadExport", {id: unescape(decodeURIComponent(beatmapId)), fileName: unescape(decodeURIComponent(title)), token: user.token, path: JSON.parse(localStorage.getItem("path")).filePaths[0]});
}

ipcRenderer.on("downloading", (event, data) => {
  // if there is a element with the id of the beatmap
  if (document.getElementById(`${data.id}`)) {
    document.getElementById(`${data.id}`).innerHTML = data.progress;
  }

  if (data.progress === "100%") {
    readFolders();
  }
});

async function getBeatmapDetails(id, user) {
  const {data} = await client.api.get(`/beatmapsets/${id}`, {
    headers: {
      "Authorization": `Bearer ${user.token}`,
    },
  });
  console.log(data);
  return data;
}
