const fs = require('fs-extra');
const toml = require('toml');
const config = toml.parse(fs.readFileSync('config.toml', 'utf-8'));
const request = require('request').defaults({jar: true});
const url = config.params.wikiUrl + "api.php";

function getLoginToken() {
    console.log("Fetching login-token ...");
    request.get(url + "?format=json&action=query&meta=tokens&type=login", function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        var path = "data/login.json";
        fs.writeFile(path, body, err => {
            if (err) {console.error(err)};
        });
        loginRequest(data.query.tokens.logintoken);
    });
}
function loginRequest(login_token) {
    console.log("Logging in ...");
    var params = {
        format: "json",
        action: "login",
        lgname: config.params.botUser,
        lgpassword: config.params.botPassword,
        lgtoken: login_token
    };
    request.post({ url: url, form: params }, function (error, res, body) {
        if (error) {
            return;
        }
        retrieveData();
    });
}
function retrieveData() {
    console.log("Receiving Data from " + config.params.wikiName + " ...");
    request.get(url + "?format=json&action=query&list=categorymembers&cmtitle=" + config.params.wikiCategory + "&cmlimit=500", function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        var path = "data/sites.json";
        fs.writeFile(path, body, err => {
            if (err) {console.error(err)};
        });
        var sites = data.query.categorymembers;
        idList = "";
        for (var i = 0; i <= sites.length; i++){
            if (i < sites.length) {
                var obj = sites[i];
                idList = idList + obj.pageid + "|";
            }
            else if (i = sites.length) {
                idList = idList.slice(0, -1);
                retrieveText(idList);
                retrieveGeoData(idList);
                retrieveExtraContent(idList);
            }
        }
    });
}
function retrieveText(idList) {
    request.get(url + "?format=json&action=query&prop=extracts|links&exintro=true&pageids=" + idList, function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        var path = "data/text.json";
        fs.writeFile(path, body, err => {
            if (err) {console.error(err)};
        });
    });
}
function retrieveGeoData(idList) {
    request.get(url + "?format=json&action=query&prop=coordinates&pageids=" + idList, function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        var path = "data/coordinates.json";
        fs.writeFile(path, body, err => {
            if (err) {console.error(err)};
        });
    });
}
function retrieveExtraContent(idList) {
    parentIdList = idList.split("|");
    for (index in parentIdList) {
        parentId = parentIdList[index]
        getLinkList(parentId)
    }
}
function getLinkList(parentId) {
    request.get(url + "?format=json&action=query&prop=links&pageids=" + parentId, function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        linkList = data.query.pages[parentId].links
        if (linkList.length > config.params.precedingLinkCount) {
            linkList.splice(0, config.params.precedingLinkCount);
            titles = "";
            for (var i = 0; i <= linkList.length; i++){
                if (i < linkList.length) {
                    obj = linkList[i];
                    titles = titles + obj.title + "|";
                }
                else if (i = linkList.length) {
                    titles = titles.slice(0, -1);
                    getExtraContent(titles, parentId);
                }
            }
        }
    });
}
function getExtraContent(titles, parentId) {
    request.get(url + "?format=json&action=query&prop=extracts|images&exintro=true&titles=" + titles, function (error, res, body) {
        if (error) {
            return;
        }
        var data = JSON.parse(body);
        var path = "data/extraContent/page" + parentId + ".json";
        fs.writeFile(path, body, err => {
            if (err) {
                console.error(err)
            }
            else {
                getImages(parentId)
            }
        });
    });
    
}
function getImages(parentId) {
    let fileContent = fs.readFileSync("data/extraContent/page" + parentId + ".json");
    let data = JSON.parse(fileContent)
    for (index in data.query.pages) {
        if (data.query.pages[index].images) {
            var extraId = data.query.pages[index].pageid;
            var imageTitle = data.query.pages[index].images[0].title;
            request.get(url + "?format=json&action=query&prop=imageinfo&iiprop=url&titles=" + imageTitle, function (error, res, body) {
                if (error) {
                    return;
                }
                var imageData = JSON.parse(body);
                writeImages(imageData, data, parentId, extraId);
            });   
        }
    }
}
function writeImages(imageData, data, parentId, extraId) {
    for (index in imageData.query.pages) {
        imageUrl = imageData.query.pages[index].imageinfo[0].url
        data.query.pages[extraId].images[0].url = imageUrl
        jsonData = JSON.stringify(data);
        var path = "data/extraContent/page" + parentId + ".json";
        fs.writeFile(path, jsonData, err => {
            if (err) {
                console.error(err)
            }
        })
    }
}
getLoginToken();