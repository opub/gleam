function getLinks() {
    console.log("links.getLinks");
    var host = window.location.hostname;
    var links = document.links;
    var hrefs = [];
    for (var i = 0; i < links.length; i++) {
        var href = links[i].href;
        if (href.indexOf(host) < 0 && (href.indexOf("http://") === 0 || href.indexOf("https://") === 0 || href.indexOf("ftp://") === 0)) {
            hrefs.push(href);
        }
    }
    return hrefs;
}

chrome.extension.sendMessage({
    action: "getLinks",
    links: getLinks()
});
