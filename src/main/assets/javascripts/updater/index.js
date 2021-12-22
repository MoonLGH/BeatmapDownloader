const {ipcRenderer} = require("electron");

async function init() {
  document.querySelector("#updater > h1").innerText = "Checking for updates...";
  document.querySelector("#updater").style.display = "block";
  checkUpdate();
}

function checkUpdate() {
  ipcRenderer.send("checkUpdate");
}

function getIn() {
  document.location.href = "../main/index.html";
}

init();

function update() {
  document.getElementById("btnUpdate").disabled = true;
  ipcRenderer.send("update");
}

// renderer side
ipcRenderer.on("updateAvailable", () => {
  document.querySelector("#updater > h1").innerText = "Update Is Avilable";
  document.querySelector("#updateExist").style.display = "flex";
});

ipcRenderer.on("updateNotAvailable", () => {
  document.querySelector("#updateNotExist").style.display = "block";
  document.querySelector("#updater > h1").innerText = "No Update Avilable";
});

ipcRenderer.on("downloadProgress", (e, args) =>{
  document.querySelector("#progressbar").style.width = args.progress + "%";
});
