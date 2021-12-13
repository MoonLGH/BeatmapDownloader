const axios = require("axios")

module.exports = {
    login,
    refresh
}

async function login(user){
    let refreshDate = new Date(user.refreshAfter)
    
    if(new Date() > refreshDate){
        console.log("refreshing")
        let refreshed = await refresh(user.refresh)
        console.log(refreshed)
    }

    let userobj = JSON.parse(localStorage.getItem("user"))
    let ownUser = await getOwnUser(userobj)
    return ownUser
}

async function refresh(refresh_token){
    let { data } = await axios.post('https://osu.ppy.sh/oauth/token', {
        client_id: 5,
        client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        scope: "*"
    }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*'
        }
    });
    let loginData = {
        token: data.access_token,
        refresh: data.refresh_token,
        refreshAfter: Date.now() + data.expires_in * 1e3 - 5e3,
    }
    localStorage.setItem("user",JSON.stringify(loginData));
    return true;
}

async function getOwnUser(user){
    let { data } = await axios.get(`https://osu.ppy.sh/api/v2/me`, {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    });
    return data
}