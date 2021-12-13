document.querySelector(".content-query__input").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        search();
    }
})

async function search(){
    const query = document.querySelector(".content-query__input").value;
    const mode = document.querySelector("#mode input:checked").getAttribute("data");
    const categories = document.querySelector("#categories input:checked").getAttribute("data");
    const general = []

    if(!query.length > 0) {
        deleteAllMaps()
        init()
        return
    }
    document.querySelectorAll("#general input:checked").forEach(input => {
        if(!input.getAttribute("data") || !input.getAttribute("data").length > 0) return;
        general.push(input.getAttribute("data"));
    })

    let user = JSON.parse(localStorage.getItem("user"))
    if(Date.now() > user.refreshAfter){
        await client.refresh()
    }
    user = JSON.parse(localStorage.getItem("user"))
    const searchdata = await searchQuery({ 
        q: query || undefined,
        s: categories || 'leaderboard',
        m: mode || undefined,
        c: general.length > 0 ? general.join('.') : undefined
    },user.token)

    deleteAllMaps()
    
    loadBeatmaps(searchdata)
}

async function searchQuery(params,accesstoken) {
    let { data } = await axios.get(`https://osu.ppy.sh/api/v2/beatmapsets/search?${stringify(params)}`,{
        headers: {
            'Authorization': `Bearer ${accesstoken}`
        }
    });
    return data
}

function stringifyValue(val) {
    switch(typeof val) {
        case "boolean":
            return val ? 'true' : 'false';
        default:
            return val.toString();
    }
}

function stringifyObject(base = '', obj = {}) {
    let values = [];
    for(let key in obj) {
        if(obj[key] === null || obj[key] === undefined) continue;
        values.push(`${base}[${key}]=${encodeURI(stringifyValue(obj[key]))}`);
    }
    return values;
}

function stringify(obj = {}) {
    let values = [];
    for(let key in obj) {
        if(obj[key] === null || obj[key] === undefined) continue;
        switch(typeof obj[key]) {
            case "object":
                values.push(...stringifyObject(obj[key]));
                break;
            default:
                values.push(`${key}=${encodeURI(stringifyValue(obj[key]))}`);
        }
    }
    return values.join("&");
}