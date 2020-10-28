window.addEventListener('DOMContentLoaded',()=>{
        let puGitLink = document.createElement("a");
    puGitLink.setAttribute("href","https://github.com/upadhyaypushpendra");
    puGitLink.setAttribute("target","_blank");

    let puGitButtonDiv = document.createElement('div');
    puGitButtonDiv.style.backgroundImage = "url(https://i.ibb.co/M5XB8jS/git.png)";
    puGitButtonDiv.style.backgroundColor = "transparent";
    puGitButtonDiv.style.position = "absolute";
    puGitButtonDiv.style.right = "30px";
    puGitButtonDiv.style.bottom = "30px";
    puGitButtonDiv.style.width = "32px";
    puGitButtonDiv.style.height = "32px";
    puGitButtonDiv.style.borderRadius = "50%";
    puGitButtonDiv.style.backgroundPosition = "center center";
    puGitButtonDiv.style.backgroundSize = "130% 130%"
    puGitButtonDiv.style.zIndex = "1000";
    puGitButtonDiv.style.boxShadow = "0 0 10px 3px black";

    puGitLink.appendChild(puGitButtonDiv);

    document.body.appendChild(puGitLink);

    let puLinkedInLink = document.createElement("a");
    puLinkedInLink.setAttribute("href","https://LinkedInhub.com/upadhyaypushpendra");
    puLinkedInLink.setAttribute("target","_blank");


    let puLinkedInButtonDiv = document.createElement('div');
    puLinkedInButtonDiv.style.backgroundImage = `url("https://i.ibb.co/NW6S90t/linkedIn.png")`;
    puGitButtonDiv.style.backgroundColor = "transparent";
    puLinkedInButtonDiv.style.position = "absolute";
    puLinkedInButtonDiv.style.right = "80px";
    puLinkedInButtonDiv.style.bottom = "30px";
    puLinkedInButtonDiv.style.width = "32px";
    puLinkedInButtonDiv.style.height = "32px";
    puLinkedInButtonDiv.style.backgroundPosition = "center center";
    puLinkedInButtonDiv.style.backgroundSize = "110% 110%"
    puLinkedInButtonDiv.style.borderRadius = "50%";
    puLinkedInButtonDiv.style.zIndex = "1000";
    puLinkedInButtonDiv.style.boxShadow = "0 0 10px 3px black";

    puLinkedInLink.appendChild(puLinkedInButtonDiv);

    document.body.appendChild(puLinkedInLink);
});
