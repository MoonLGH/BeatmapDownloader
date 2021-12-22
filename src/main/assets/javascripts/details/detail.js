const client = require("../assets/javascripts/api/client");
const beatmaps = require("../assets/javascripts/api/beatmapsets");
const moment = require("moment");
const {ipcRenderer} = require("electron");
const fs = require("fs");

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

async function init() {
  let user = JSON.parse(localStorage.getItem("user"));
  const refreshDate = new Date(user.refreshAfter);

  if (new Date() > refreshDate) {
    console.log("refreshing");
    const refreshed = await refresh(user.refresh);
    console.log(refreshed);
  }

  user = JSON.parse(localStorage.getItem("user"));
  const id = localStorage.getItem("DetailPage");

  await readFolders();
  const beatmap = await getBeatmapDetails(id, user);
  console.log(beatmap);
  appendBeatmap(beatmap);
  appendDownloadButton(beatmap);
}

async function getBeatmapDetails(id, user) {
  const {data} = await client.api.get(`/beatmapsets/${id}`, {
    headers: {
      "Authorization": `Bearer ${user.token}`,
    },
  });
  console.log(data);
  return new beatmaps(data);
}


function appendBeatmap(beatmap) {
  const beatmapdiv = document.querySelector(".beatmap");
  beatmapdiv.id = `${beatmap.id}`;
  beatmapdiv.innerHTML = `
    ${folders.find((f) => f.id == beatmap.id) ? "<div class=\"progress\" style=\"width: 100%;\"></div>" : ""}
    <div class="progress" id="${beatmap.id}-progress"></div>
    <div class="beatmapset-header__overlay beatmapset-header__overlay--gradient"></div>
    <div class="beatmapset-header__box beatmapset-header__box--main"><span
            class="beatmapset-header__details-text beatmapset-header__details-text--title"><a
                class="beatmapset-header__details-text-link">${beatmap.title}</a></span><span
            class="beatmapset-header__details-text beatmapset-header__details-text--artist"><a
                class="beatmapset-header__details-text-link">${beatmap.artist}</a></span>
        <div class="beatmapset-mapping"><a class="avatar avatar--beatmapset"
                style="background-image: url('${beatmap.creator.avatar}');"></a>
            <div class="beatmapset-mapping__content">
                <div class="beatmapset-mapping__mapper">mapped by <a
                        class="beatmapset-mapping__user js-usercard" data-user-id="${beatmap.creator.id}">${beatmap.creator.nickname}</a></div>
                <div>submitted <strong><time class="js-tooltip-time" datetime="${moment(beatmap.submitDate).format()}"
                            title="${moment(beatmap.submitDate).format()}">${moment(beatmap.submitDate).format("DD MMM YYYY")}</time></strong></div>
                <div>ranked <strong><time class="js-timeago" datetime="${moment(beatmap.rankedDate).format()}"
                            title="${moment(beatmap.rankedDate).format()}">${moment(beatmap.rankedDate).fromNow()}</time></strong></div>
            </div>
        </div>
    </div>
  `;
  beatmapdiv.style.backgroundImage = `url('${beatmap.covers.cover2x}')`;
}

function appendDownloadButton(beatmap) {
  document.getElementById("dlbutton").innerHTML = `
  ${folders.find((f) => f.id == beatmap.id) ? "" : `<button class="btn btn-primary" onclick="download('${escape(encodeURIComponent(beatmap.id))}','${escape(encodeURIComponent(beatmap.artist))}','${escape(encodeURIComponent(beatmap.title))}')">Download</button>`}
  `;
}

async function download(beatmapId, artist, title) {
  document.getElementById("dlbutton").remove();
  let user = JSON.parse(localStorage.getItem("user"));
  if (Date.now() > user.refreshAfter) {
    await client.refresh();
  }
  user = JSON.parse(localStorage.getItem("user"));
  ipcRenderer.send("download", {id: unescape(decodeURIComponent(beatmapId)), artist: unescape(decodeURIComponent(artist)), title: unescape(decodeURIComponent(title)), token: user.token, path: JSON.parse(localStorage.getItem("path")).filePaths[0]});
}

ipcRenderer.on("downloading", (event, data) => {
  // if there is a element with the id of the beatmap
  if (document.getElementById(`${data.id}-progress`)) {
    document.getElementById(`${data.id}-progress`).style.width = `${data.progress}`;
  }
});

init();
