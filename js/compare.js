angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);

var phoneNamez = []

var phone1URL = "";
var phone2URL = ""

var phone1Name = "";
var phone2Name = "";

function loadDataFromURL() {
    var parameters = location.search.substring(1).split("&");
    for (var i = 0; i < parameters.length; i++) {
        var splitted = parameters[i].split("=");
        var first = splitted[0];
        var second = splitted[1];

        second = second.replaceAll('_', ' ');

        if (first == "phone1") {
            phone1Name = second;
        }
        else if(first == "phone2"){
            phone2Name = second;
        }

        var things = document.getElementsByClassName(first);
        for (var i2 = 0; i2 < things.length; i2++) {
            things[i2].innerHTML = second;
        }
    }
}

function mainCtrl($scope, $http, ChartJsProvider){
    $scope.fireInteraction = function(){
        $scope.sparqplallphone = "SELECT ?smartphone ?name ?price ?web ?os ?ss ?photo WHERE { ?smartphone spd:onWebsite \"true\"^^xsd:boolean . OPTIONAL {?smartphone spd:display_name ?name} OPTIONAL {?smartphone spd:get_price ?price} OPTIONAL {?smartphone spd:get_os ?os} OPTIONAL {?smartphone spd:get_screensize ?ss} OPTIONAL {?smartphone spd:get_photo ?photo}}"

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
                    //TODO var web = val.web.value;
                    var os = val.os.value;
                    var ss = val.ss.value;
                    var photo = val.photo.value;
                    var price = val.price.value;

                    var smartphone = val.smartphone.value;
                    console.log(smartphone);

                    var intcount = 0;

                    if(phone1Name == phone) {
                        intcount = 1;
                        phone1URL = smartphone;
                    }
                    else if(phone2Name == phone) {
                        intcount = 2;
                        phone2URL = smartphone;
                    }

                    if(intcount > 0) {
                        document.getElementsByClassName("price" + intcount)[0].innerHTML = "€" + price;
                        document.getElementsByClassName("size" + intcount)[0].innerHTML = ss + " inch";
                        document.getElementsByClassName("os" + intcount)[0].innerHTML = os;
                        if(os == "iOS") {
                            document.getElementsByClassName("manu" + intcount)[0].innerText = "Apple"
                        }
                        var img = document.createElement("img");
                        img.src = photo;
                        img.width = 90;
                        img.height = 180;
                        document.getElementById("imside" + intcount).appendChild(img);
                    }
                });
                $scope.checkDBPedia(1);
                $scope.checkDBPedia(2);
            })
            .error(function(error ){
                console.log('Error :');
                console.dir(error);
            });
    };

    $scope.checkDBPedia = function(phonenum){
        var unp = phone1URL;
        if(phonenum == 2) {
            unp = phone2URL;
        }
        var par = unp.replace('http://dbpedia.org/resource/', '');

        console.log(par);

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
                        document.getElementsByClassName("desc" + phonenum)[0].innerHTML = val.desc.value;
                    }
                    if(val.manuname != null) {
                        if(val.manuname["xml:lang"] == "en") {
                            document.getElementsByClassName("manu" + phonenum)[0].innerHTML = val.manuname.value;
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


function selectImage(container) {
    var name = phone1Name;
    if(container == 2) {
        name = phone2Name;
    }
    name = name.replaceAll(' ', '_');
    window.location.href = "phone.html?phone=" + name;
}