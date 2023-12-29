let href = document.location.href;
let lastPathSegment = href.substring(href.lastIndexOf('/') + 1);
fetch('https://jplovett.net/bfcwestmetro/code/pages.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(json => {
            this.pages = json;
            for (let i = 0; i < this.pages.length; i++) {
                let page = this.pages[i];
                console.info(page);
                if (lastPathSegment == '' || lastPathSegment == null) {
                    if (page.name == "index.html") {
                        hdrComp += '<li class="nav-item" id="navLink0"><a class="nav-link active" href="index.html">' + page.title + '</a></li>';
                        //console.info(page.title);
                    } else {
                        hdrComp += '<li class="nav-item" id="navLink' + page.id + '"><a class="nav-link" href="' + page.name + '">' + page.title + '</a></li>';
                    }
                } else if (item.name == lastPathSegment) {
                    hdrComp += '<li class="nav-item" id="navLink' + page.id + '"><a class="nav-link active" href="' + page.name + '">' + page.title + '</a></li>';
                } else {
                    hdrComp += '<li class="nav-item" id="navLink' + page.id + '"><a class="nav-link" href="' + page.name + '">' + page.title + '</a></li>';
                }
            }
            hdr.innerHTML = hdrComp + '</ul></div></nav>';
            console.info(hdrComp);
        })
        .catch(function () {
            this.dataError = true;
        });
