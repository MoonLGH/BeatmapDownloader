const axios = require("axios");
const fs = require("fs");
const {ipcRenderer} = require("electron");

const folders = fs.readdirSync(JSON.parse(localStorage.getItem("path")).filePaths[0], {
  withFileTypes: true,
}).map((dirent) => dirent.name).filter(hasNumber).map((str) =>{
  const str0 = str.split(" ")[0];
  let numb = str0.match(/\d/g);
  numb = numb.join("");
  return {id: numb, name: str};
});

function hasNumber(myString) {
  return /\d/.test(myString);
}

async function init() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (Date.now() > user.refreshAfter) {
    await client.refresh();
  }
  user = JSON.parse(localStorage.getItem("user"));
  const initialsearch = await searchBeatmaps(user.token, {});

  loadBeatmaps(initialsearch);
  document.querySelector("#general > div > label:nth-child(2) > span").innerHTML = `Recommended difficulty (${initialsearch.recommended_difficulty.toFixed(2)})`;
}

init();
async function searchBeatmaps(accesstoken, params) {
  const {data} = await axios.get("https://osu.ppy.sh/api/v2/beatmapsets/search", {
    headers: {
      "Authorization": `Bearer ${accesstoken}`,
    },
  });
  return data;
}

const beatmaps = require("../assets/javascripts/api/beatmapsets");
async function loadBeatmaps(maps) {
  console.log(maps);
  const beatmapmapped = maps.beatmapsets.map((s) => new beatmaps(s));

  beatmapmapped.forEach((beatmap) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="map">
        ${folders.find((f) => f.id == beatmap.id) ? "<div class=\"progress-exist\" style=\"width: 100%;\"></div>" : ""}
            <div class="progress" id="${beatmap.id}" style="width: 0%;"></div>
                <div class="map-header" style="background: url('${beatmap.covers.cover2x}') center center / cover;">
                    <div class="map-header__bubbles">
                        <span class="map-header__status">${beatmap.status}</span>
                </div>
            <div class="map-header-information"><span class="map-header-information__title">${beatmap.title}</span><span class="map-header-information__artist">${beatmap.artist}</span></div>
            </div>
            <div class="map-content">
                <div class="map-content-information">
                    <span class="map-content-information__text">mapped by <span class="map-content-information__mapper">${beatmap.creator.nickname}</span></span><span class="map-content-information__text">${beatmap.source}</span>
                    <div onclick="download('${beatmap.id}','${beatmap.artist}','${beatmap.title}'   )" class="download-button">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16 map-content-information__download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg>
                    </div>
                </div>
            <div class="icons">
                ${beatmap.beatmaps.map(loadIcons).join("")}
            </div>
        </div>
    </div>`;
    document.querySelector(".content-maps").appendChild(div);
  });
}

function calculateMode(diff) {
  switch (diff) {
    case 1:
      return "taiko";
    case 2:
      return "catch";
    case 3:
      return "mania";
    default:
      return "standart";
  }
}

function loadIcons(beatmap) {
  const diffclass = getDiffClass(beatmap.stars);
  const tooltip = "";
  return `<div onmouseover="hover(this)" onmouseout="unhover(this)">
    <div class="icons-tooltip">
        <span>${beatmap.version}</span>
        <span>${beatmap.stars}★</span>
    </div>
    <img width="20px" height="20px" title="" src="../assets/icons/${calculateMode(beatmap.mode)}-icon.svg" class="${diffclass} diff-icon" onload="SVGInject(this)">
    </div>
    `;
}

function unhover(element) {
  element.querySelector(".icons-tooltip").style.display = "none";
}

function hover(element) {
  element.querySelector(".icons-tooltip").style.display = "flex";
}
function getDiffClass(stars) {
  if (stars < 2) return "diff-easy";
  else if (stars < 2.7) return "diff-normal";
  else if (stars < 4) return "diff-hard";
  else if (stars < 5.3) return "diff-insane";
  else if (stars < 6.5) return "diff-expert";
  else return "diff-expertplus";
}

async function download(beatmapId, artist, title) {
  let user = JSON.parse(localStorage.getItem("user"));
  if (Date.now() > user.refreshAfter) {
    await client.refresh();
  }
  user = JSON.parse(localStorage.getItem("user"));
  ipcRenderer.send("download", {id: beatmapId, artist: artist, title: title, token: user.token, path: JSON.parse(localStorage.getItem("path")).filePaths[0]});
}

ipcRenderer.on("downloading", (event, data) => {
  // if there is a element with the id of the beatmap
  if (document.getElementById(`${data.id}`)) {
    document.getElementById(`${data.id}`).style.width = `${data.progress}`;
  }
});

function deleteAllMaps() {
  document.querySelector(".content-maps").innerHTML = "";
}
