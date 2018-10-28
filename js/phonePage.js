angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);

var phoneNamez = []

var phoneURL = "";

var phoneName = "";

function loadDataFromURL() {
        var parameters = location.search.substring(1).split("&");
        for (var i = 0; i < parameters.length; i++) {
            var splitted = parameters[i].split("=");
            var first = splitted[0];
            var second = splitted[1];

            second = second.replaceAll('_', ' ');

            if (first == "phone") {
                phoneName = second;
                document.title = phoneName + " details!"
            }

            var things = document.getElementsByClassName(first);
            for (var i2 = 0; i2 < things.length; i2++) {
                things[i2].innerHTML = second;
            }
        }

        getYoutubeVideo();
}



// Load the parameters from the URL which can be used to process information about the phone which will have to be loaded.

function getYoutubeVideo() {
    var request = new XMLHttpRequest();
    var params = "part=snippet&key=AIzaSyDVtcZ_UlDXtM9ydW2wyMpAiJGd2NpIXEQ&maxResults=1&q=" + phoneName + "review";
    request.open("GET", "https://www.googleapis.com/youtube/v3/search?" + params, true);
    request.send(null);
    request.onreadystatechange = function() {
        if ( request.readyState === 4 && request.status === 200 ) {
            var textUnparsed = JSON.parse(request.responseText);
            console.dir(textUnparsed);
            var items = textUnparsed.items;
            var item1 = items[0];
            var id = item1.id;
            var idString = id.videoId;
            console.log(idString);
            document.getElementById("ytvid").src = "https://www.youtube.com/embed/" + idString + "?rel=0";

            var snippet = item1.snippet;
            var channel = snippet.channelTitle;
            document.getElementById("channelID").innerText = channel;
            document.getElementById("channellink").href = "https://youtube.com/channel/" + snippet.channelId;

            var uploadDate = snippet.publishedAt;
            var splitted = uploadDate.split('T');
            var doubleSplit = splitted[0].split('-');
            var newstr = doubleSplit[2] + "-" + doubleSplit[1] + "-" + doubleSplit[0];
            document.getElementById("videoupload").innerText = newstr;

            document.getElementById("videotitle").innerText = snippet.title;
        }
    }

}

function mainCtrl($scope, $http, ChartJsProvider){


    $scope.fireInteraction = function(){
        $scope.sparqplallphone = "SELECT ?smartphone ?name ?price ?web ?os ?ss ?photo WHERE { ?smartphone spd:onWebsite \"true\"^^xsd:boolean . OPTIONAL {?smartphone spd:display_name ?name} OPTIONAL {?smartphone spd:get_price ?price} OPTIONAL {?smartphone spd:get_os ?os} OPTIONAL {?smartphone spd:get_screensize ?ss} OPTIONAL {?smartphone spd:get_photo ?photo} OPTIONAL {?smartphone fgo:has_wiki_id ?web}}"

        $scope.endpoint = "http://localhost:5820/FinalAssignment/query?query="
        $scope.myQuery = encodeURI($scope.sparqplallphone).replace(/#/g, '%23');

        $http( {
            method: "GET",
            url : $scope.endpoint+$scope.myQuery,
            data: '',
            headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
        } )
            .success(function(data, status ) {
                $scope.phoneNames = [];
                var count = 0;
                angular.forEach(data.results.bindings, function(val) {
                    count += 1;
                    console.dir(val);
                    phoneNamez.push(val.name.value);

                    var phone = val.name.value;

                    var os = val.os.value;
                    var ss = val.ss.value;
                    var photo = val.photo.value;
                    var price = val.price.value;

                    var smartphone = val.smartphone.value;
                    console.log(smartphone);

                    if(phoneName == phone) {
                        document.getElementsByClassName("price")[0].innerHTML = "€" + price;
                        document.getElementsByClassName("size")[0].innerHTML = ss + " inch";
                        document.getElementsByClassName("os")[0].innerHTML = os;
                        if(os == "iOS") {
                            document.getElementsByClassName("manu")[0].innerText = "Apple"
                         }
                        var img = document.createElement("img");
                        img.src = photo;
                        img.width = 360;
                        document.getElementById("imageside").appendChild(img);
                        phoneURL = smartphone;
                        if(val.web != null && val.web.value != null) {
                            var web = val.web.value;
                            $scope.checkWikiData(web);
                        }
                    }
                    else {
                        var x = document.getElementById("selector");
                        var option = document.createElement("option");
                        option.text = phone;
                        x.add(option);
                    }
                });
                $scope.checkDBPedia();
            })
            .error(function(error ){
                console.log('Error :');
                console.dir(error);
            });
    };

    $scope.checkDBPedia = function(){

        var unp = phoneURL;
        var par = unp.replace('http://dbpedia.org/resource/', '');

        $scope.dbpediaQuery = "SELECT ?desc ?manuname WHERE { dbr:" + par + " dbo:abstract ?desc OPTIONAL { dbr:" + par + " dbo:manufacturer ?manul . ?manul rdfs:label ?manuname}}"

        console.log($scope.dbpediaQuery)

        $scope.dbpediaendpoint = "http://dbpedia.org/sparql?query="
        $scope.dbquerynew = encodeURI($scope.dbpediaQuery).replace(/#/g, '%23');

        $http( {
            method: "GET",
            url : $scope.dbpediaendpoint+$scope.dbquerynew,
            data: '',
            headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
        } )
            .success(function(data, status ) {
                $scope.phoneNames = [];
                var count = 0;
                angular.forEach(data.results.bindings, function(val) {
                    console.log("Result " + count)
                    count += 1;
                    console.dir(val);
                    if(val.desc["xml:lang"] == "en") {
                        document.getElementsByClassName("desc")[0].innerText = val.desc.value;
                    }
                    if(val.manuname != null) {
                        if(val.manuname["xml:lang"] == "en") {
                            document.getElementsByClassName("manu")[0].innerText = val.manuname.value;
                        }
                    }

                });
            })
            .error(function(error ){

                console.log('Error :');
                console.dir(error);
            });
    };

    $scope.checkWikiData = function(wikiID){

        if(document.getElementsByClassName("manu")[0].innerText =! "Unknown") {
            console.log("No need to query wikidata! So not doing this ")
            return;
        }

        var unp = phoneURL;
        var par = unp.replace('http://dbpedia.org/resource/', '');

        console.log(par);

        $scope.wikidataQuery = "SELECT ?name WHERE { wd:" + wikiID + " wdt:P176 ?manu . ?manu rdfs:label ?name }"

        console.log($scope.wikidataQuery)

        $scope.wikidataendpoint = "https://query.wikidata.org/sparql"
        $scope.wikiquerynew = encodeURI($scope.wikidataQuery).replace(/#/g, '%23');

        $http( {
            method: "GET",
            url : $scope.wikidataendpoint+$scope.wikiquerynew,
            data: '',
            headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
        } )
            .success(function(data, status ) {
                angular.forEach(data.results.bindings, function(val) {
                    console.dir(val);
                    if(val.name != null) {
                        if (val.name["xml:lang"] == "en") {
                            document.getElementsByClassName("manu")[0].innerText = val.desc.value;
                        }
                    }
                });
            })
            .error(function(error ){

                console.log('Error :');
                console.dir(error);
            });
    };

    $scope.fireInteraction(); //TODO





}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function handleCompare() {
    var selector = document.getElementById("selector");
    var selectorValue = selector.options[selector.selectedIndex].text;
    selectorValue = selectorValue.replaceAll(' ', '_');
    document.location.href = "compare.html?phone1=" + phoneName.replaceAll(' ', '_') + "&phone2=" + selectorValue;
}