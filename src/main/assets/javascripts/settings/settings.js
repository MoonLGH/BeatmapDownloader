const client = require("../assets/javascripts/api/client");
const fs = require("fs");
const {ipcRenderer} = require("electron");
async function init() {
  const path = JSON.parse(localStorage.getItem("path"));

  if (!fs.existsSync(JSON.parse(localStorage.getItem("path")).filePaths[0])) {
    localStorage.removeItem("path");
    document.location.href = "../index.html";
    return;
  }

  document.querySelector("#ToggleBox").checked = JSON.parse(localStorage.getItem("rpc"));
  document.querySelector("#input-folder").value = path.filePaths[0];
  const loginData = await client.login(JSON.parse(localStorage.getItem("user")));

  ipcRenderer.send("rpcState", {state: "Settings", details: "Messings with settings"});

  Welcome(loginData);
}

function Welcome(user) {
  if (!user) {
    document.querySelector(".username-welcome").innerText = "You are offline, but you can log off anyways";
    return;
  }
  console.log(user);
  document.querySelector(".username-welcome").innerText = `Logined as: ${user.username}`;
  document.querySelector("#avatarimg").setAttribute("src", user.avatar_url);
}
init();

function logout() {
  localStorage.removeItem("user");
  document.location.href = "../index.html";
}

function move(id) {
  if (id === "path") {
    document.querySelector("#accounts").style.display = "none";
    document.querySelector("#rpc").style.display = "none";
    document.querySelector("#path").style.display = "block";
  } else if (id === "accounts") {
    document.querySelector("#path").style.display = "none";
    document.querySelector("#rpc").style.display = "none";
    document.querySelector("#accounts").style.display = "block";
  } else if (id === "rpc") {
    document.querySelector("#path").style.display = "none";
    document.querySelector("#accounts").style.display = "none";
    document.querySelector("#rpc").style.display = "block";
  }
}
function removePath() {
  localStorage.removeItem("path");
  document.location.href = "../index.html";
}

document.querySelector("#ToggleBox").addEventListener("change", (e) => {
  localStorage.setItem("rpc", JSON.stringify(e.target.checked));
  ipcRenderer.send("rpcToggle", {toggle: e.target.checked});
  ipcRenderer.send("rpcState", {state: "Settings", details: "Messings with settings"});
});
