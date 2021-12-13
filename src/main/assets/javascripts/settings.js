const client = require("../assets/javascripts/api/client")

async function init(){

    const path = JSON.parse(localStorage.getItem("path"))

    document.querySelector("#input-folder").value = path.filePaths[0]
    let loginData = await client.login(JSON.parse(localStorage.getItem("user")))

    Welcome(loginData)
}

function Welcome(user){
    console.log(user)
    document.querySelector(".username-welcome").innerText = `Logined as: ${user.username}`
    document.querySelector("#avatarimg").setAttribute("src",user.avatar_url)
}
init()

function logout(){
    localStorage.removeItem("user")
    document.location.href = "../index.html"
}

function move(id){
    if(id === "path"){
        document.querySelector("#accounts").style.display = "none"
        document.querySelector("#path").style.display = "block"
    }else{
        document.querySelector("#path").style.display = "none"
        document.querySelector("#accounts").style.display = "block"
    }
}
function removePath(){
    localStorage.removeItem("path")
    document.location.href = "../index.html"
}