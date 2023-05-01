import * as jose from 'https://cdn.skypack.dev/jose';

const TOKEN_NAME="translateJwtToken";

function has_valid_token() {
    let token = localStorage.getItem(TOKEN_NAME)
    if (token) {
        token = jose.decodeJwt(token)
    }
    let invalid = (!token) || (Date.now() / 1000) > (token.exp - 60)
    return !invalid
}
window.has_valid_token=has_valid_token;

console.log(" ... in google_sign_in.js")
async function handleCredentialResponse(response) {
    console.log("Encoded JWT token: " + response.credential)
    document.getElementById("buttonDiv").style.display = 'none'
    console.log(response)
    console.log(jose)
    console.log(jose.decodeJwt(response.credential))

    localStorage.setItem(TOKEN_NAME, response.credential)
}

function buildUI(){
    let token = localStorage.getItem(TOKEN_NAME)
    
}

window.addEventListener("load", (event) => {
    if (!has_valid_token()) {
        google.accounts.id.initialize({
            client_id: "470984582294-ciqa45m21eqsli2v0m8kqdsobl2690jg.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large" }  // customization attributes
        );
        google.accounts.id.prompt(); // also display the One Tap dialog
    } 

    document.getElementById("translateButton").addEventListener("click",async (event)=>{
        let spanishText = document.getElementById("text-es")
        if (spanishText.value.trim().length<1) {
            document.getElementById("resultsDiv").innerHTML = 'Spanish text is blank'
            return
        }
        let dev_url="http://localhost:8080"
        let cloud_url="https://us-east1-nih-nci-dceg-druss.cloudfunctions.net/HelloUser"
        let resp = await (await fetch(cloud_url, {
            headers:{
                "Content-Type":"application/JSON"
            },
            method: 'POST',
            body: JSON.stringify({
                "jwt": localStorage.getItem(TOKEN_NAME),
                "spanishText":spanishText.value
            })
        })).json()

        window.resp = resp
        console.log(resp)
        if (!resp.validuser){
            document.getElementById("resultsDiv").innerHTML = `
            Sorry but ${resp.user} is not authorized to run this.
            `
        } else {
            document.getElementById("resultsDiv").innerHTML = `Hello ${resp.user}
            The translation is : ${resp.translation}
            `
            console.log(resp)
            document.getElementById("text-en").innerText=resp.translation
            resp.sitf.forEach( (element,index) => {
                document.getElementById("soc2010_"+(index+1)).innerText=`${element.code}: ${element.label}`
            });
        }
    });
})