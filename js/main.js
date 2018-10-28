angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);

var phoneNamez = [];

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

                    var phoneName = val.name.value;
                    //TODO var web = val.web.value;
                    var os = val.os.value;
                    var ss = val.ss.value;
                    var photo = val.photo.value;
                    var price = val.price.value;

                    $scope.phoneNames.push(val.name.value);

                    phoneNamez.push(val.name.value);

                    var str = "Name: " + phoneName + "\nSize:" + ss + " inch\nOS: " + os + "\nPrice:" + price

                    document.getElementById("phone" + count).innerText = str;

                    var img = document.createElement("img");
                    img.src = photo;
                    img.width = 90;
                    img.height = 180;
                    document.getElementById("photo" + count).appendChild(img);
                });
                $scope.results = data // =  TODO
            })
            .error(function(error ){
                console.log('Error :');
                console.dir(error);
            });
        $scope.results
    };

    $scope.fireInteraction();

}

function selectImage(container) {
    var name = phoneNamez[container - 1];
    name = name.replaceAll(' ', '_');
    window.location.href = "phone.html?phone=" + name;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};