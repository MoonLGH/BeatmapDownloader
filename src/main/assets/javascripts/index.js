const axios = require("axios");
const {ipcRenderer} = require("electron");
const client = require("./assets/javascripts/api/client");

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
  console.log(user);
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
  if (result === false) {
    makeAlert("Wrong username or password", "alert-danger");
  } else {
    makeAlert("Login successful. Please wait a minute, we will redirect you", "alert-success");
    setTimeout(() =>{
      document.location.reload();
    }, 1000);
  }
}

async function loginAccount(username, password) {
  try {
    const {data} = await axios.post("https://osu.ppy.sh/oauth/token", {
      username,
      password,
      grant_type: "password",
      client_id: 5,
      client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
      scope: "*",
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
    });
    if (!data.access_token) {
      return false;
    }
    const loginData = {
      token: data.access_token,
      refresh: data.refresh_token,
      refreshAfter: Date.now() + data.expires_in * 1e3 - 5e3,
    };
    localStorage.setItem("user", JSON.stringify(loginData));

    return true;
  } catch (err) {
    return false;
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
const alert = document.querySelector("#alerts");

function makeAlert(text, mode) {
  const newalert = document.createElement("div");
  newalert.classList.add("alert");
  newalert.classList.add(mode);
  newalert.innerText = text;
  alert.appendChild(newalert);
  setTimeout(()=>{
    removeAlert(newalert);
  }, 3000);
}

function removeAlert(ele) {
  ele.remove();
}

function logout() {
  localStorage.removeItem("user");
  document.location.reload();
}

function getIn() {
  document.location.href = "./main/index.html";
}
