
let href = document.location.href;
let lastPathSegment = href.substring(href.lastIndexOf('/') + 1);
let hdr = document.getElementById("hdr");
let footer = document.getElementById("footer");
let hdrComp = '<h1 class="pl-2">West Metro Builders for Christ</h1>' +
    '<nav class="navbar navbar-expand-sm bg-light navbar-light">' +
    '<a class="navbar-brand" href="#">logo</a>' +
    '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">' +
    '<span class="navbar-toggler-icon"></span>' +
    '</button>' +
    '<div class="collapse navbar-collapse" id="collapsibleNavbar">' +
    '<ul class="navbar-nav">'
let pages = [{ name: "index.html", title: "Home", id: 0 }, { name: "about.html", title: "About", id: 1 }, { name: "contact.html", title: "Contact", id: 2 }];

window.addEventListener('load', async function () {
    //console.info("lastPathSegment: " + lastPathSegment)
    pages.forEach(function (item, index) {
        if (lastPathSegment == '' || lastPathSegment == null) {
            if (item.name == "index.html") {
                hdrComp += '<li class="nav-item" id="navLink0"><a class="nav-link active" href="index.html">' + item.title + '</a></li>';
            } else {
                hdrComp += '<li class="nav-item" id="navLink0"><a class="nav-link" href="index.html">' + item.title + '</a></li>';
            }
        } else if (item.name == lastPathSegment) {
            hdrComp += '<li class="nav-item" id="navLink' + index + '"><a class="nav-link active" href="' + item.name + '">' + item.title + '</a></li>';
        } else {
            hdrComp += '<li class="nav-item" id="navLink' + index + '"><a class="nav-link" href="' + item.name + '">' + item.title + '</a></li>';
        }
    });
    hdr.innerHTML = hdrComp + '</ul></div></nav>';
    let responseFtr = await fetch('https://jplovett.net/bfcwestmetro/comp/footer.html');
    if (responseFtr.ok) { // if HTTP-status is 200-299
        footer.innerHTML = await responseFtr.text();
    } else {
        console.warn("HTTP-Error getting footer: " + responseFtr.status);
    }
    document.getElementById("year").innerHTML = new Date().getFullYear();
    //console.info(window.location);
});
