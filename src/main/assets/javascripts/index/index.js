const {ipcRenderer} = require("electron");
const client = require("./assets/javascripts/api/client");

const alert = document.querySelector("#alerts");

async function init() {
  if (localStorage.getItem("user") == null) {
    showPrompt(".prompt-login");
    return;
  }

  if (localStorage.getItem("path") == null) {
    showPrompt(".prompt-path");
    return;
  }

  const loginData = await client.login(JSON.parse(localStorage.getItem("user")));
  Welcome(loginData);
}

function Welcome(user) {
  document.querySelector(".username-welcome").innerText = `Logined as: ${user.username}`;
  document.querySelector("#avatarimg").setAttribute("src", user.avatar_url);
  showPrompt(".prompt-welcome");
}

init();

function showPrompt(q) {
  document.querySelector(q).style.display = "block";
}

async function login() {
  const username = document.querySelector("#input-name").value;
  const password = document.querySelector("#input-pass").value;

  const result = await loginAccount(username, password);

  if (!result) {
    makeAlert("Login Failed", "alert-danger");
  } else {
    makeAlert("Login successful. Please wait a minute, we will redirect you", "alert-success");
    setTimeout(() =>{
      document.location.reload();
    }, 1000);
  }
}

async function loginAccount(username, password) {
  try {
    const data = await client.registerUser(username, password);
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      return true;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Path
function registerPath() {
  ipcRenderer.send("setpath");
}

ipcRenderer.on("pathdata", (event, path) => {
  if (path.canceled === true) return;

  localStorage.setItem("path", JSON.stringify(path));
  document.location.reload();
  return;
});

// Alerts

function makeAlert(text, mode) {
  const newalert = document.createElement("div");
  newalert.classList.add("alert");
  newalert.classList.add(mode);
  newalert.innerText = text;
  alert.appendChild(newalert);
  setTimeout(()=>{
    newalert.remove();
  }, 3000);
}

function logout() {
  localStorage.removeItem("user");
  document.location.reload();
}

function getIn() {
  document.location.href = "./main/index.html";
}

document.querySelector("#input-pass").addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    login();
  }
});
