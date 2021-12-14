const axios = require("axios");

module.exports = {
  login,
  refresh,
};

async function login(user) {
  const refreshDate = new Date(user.refreshAfter);

  if (new Date() > refreshDate) {
    console.log("refreshing");
    const refreshed = await refresh(user.refresh);
    console.log(refreshed);
  }

  const userobj = JSON.parse(localStorage.getItem("user"));
  const ownUser = await getOwnUser(userobj);
  return ownUser;
}

async function refresh(token) {
  const {data} = await axios.post("https://osu.ppy.sh/oauth/token", {
    client_id: 5,
    client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
    grant_type: "refresh_token",
    refresh_token: token,
    scope: "*",
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
  });
  const loginData = {
    token: data.access_token,
    refresh: data.refresh_token,
    refreshAfter: Date.now() + data.expires_in * 1e3 - 5e3,
  };
  localStorage.setItem("user", JSON.stringify(loginData));
  return true;
}

async function getOwnUser(user) {
  const {data} = await axios.get("https://osu.ppy.sh/api/v2/me", {
    headers: {
      "Authorization": `Bearer ${user.token}`,
    },
  });
  return data;
}
