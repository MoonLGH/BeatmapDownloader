const client = require("../assets/javascripts/api/client");

async function init() {
  const login = document.querySelector("#login");
  const user = await client.login(JSON.parse(localStorage.getItem("user")));

  if (!user) {
    login.innerHTML = `
    <div class="row">
        <div class="col-md-12"><a style="font-size:15px" class="btn btn-primary" href="../settings/index.html">Settings</a></div>
        <div class="col-md-12"><a style="font-size:15px" class="btn btn-primary" href="../settings/index.html">Import/Export Lists</a></div>
    </div>
    `;
    return;
  }
  login.innerHTML = `
    <div class="row">
        <div class="col-md-6" style="text-align:right;">
            <div class="row">
                <div class="col-md-12"><a style="font-size:22.5px">${user.username}</a></div>
            </div>
        </div>
        <div class="col-md-6">
            <img src="${user.avatar_url}" width=75px" class="rounded-circle" style="margin-bottom: auto;">
        </div>
    </div>
    `;
}

init();
