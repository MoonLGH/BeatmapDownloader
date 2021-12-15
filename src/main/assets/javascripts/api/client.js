const axios = require("axios");
const qs = require("./qs");

const api = axios.create({
  baseURL: "https://osu.ppy.sh/api/v2",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  },
});

module.exports = {
  login,
  refresh,
  registerUser,
  api,
  searchBeatmaps,
};

async function login(user) {
  const refreshDate = new Date(user.refreshAfter);

  if (new Date() > refreshDate) {
    console.log("refreshing");
    const refreshed = await refresh(user.refresh);
    console.log(refreshed);
  }

  const userobj = JSON.parse(localStorage.getItem("user"));

  try {
    const ownUser = await api.get("/me", {
      headers: {
        "Authorization": `Bearer ${userobj.token}`,
      },
    });
    return ownUser.data;
  } catch (e) {
    return null;
  }
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
  localStorage.setItem("user", JSON.stringify(formatData(data)));
  return true;
}


async function registerUser(username, password) {
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
    return null;
  }

  return formatData(data);
}

function formatData(data) {
  return {
    token: data.access_token,
    refresh: data.refresh_token,
    refreshAfter: Date.now() + data.expires_in * 1e3 - 5e3,
  };
}

async function searchBeatmaps(accesstoken, params) {
  const {data} = await api.get(`/beatmapsets/search?${qs.stringify(params)}`, {
    headers: {
      "Authorization": `Bearer ${accesstoken}`,
    },
  });
  return data;
}
