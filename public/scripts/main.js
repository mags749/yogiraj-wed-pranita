var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "https://yogiraj-weds-pranita.firebaseio.com",
  storageBucket: "yogiraj-weds-pranita.appspot.com",
  messagingSenderId: "230525947412",
};
firebase.initializeApp(config);

var ywpApp = angular.module("ywpApp", ["ui.router", "ngAnimate"]);

ywpApp.config([
  "$stateProvider",
  "$urlRouterProvider",
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state("welcome", {
        url: "/welcome",
        templateUrl: "templates/welcome.html",
        controller: "WelcomeController",
      })
      .state("wedding", {
        url: "/wedding",
        templateUrl: "templates/wedding.html",
        controller: "WeddingController",
      });
    $urlRouterProvider.otherwise("/welcome");
  },
]);

ywpApp.directive("repeatDone", function () {
  return function (scope, element, attrs) {
    if (scope.$last) {
      scope.$eval(attrs.repeatDone);
    }
  };
});

ywpApp.controller("WelcomeController", [
  "$scope",
  "$state",
  "$timeout",
  function ($scope, $state, $timeout) {
    navInvitation = function () {
      $state.go("wedding");
    };

    $timeout(navInvitation, 3000);
  },
]);

ywpApp.controller("WeddingController", [
  "$scope",
  function ($scope) {
    $scope.init = function () {
      $scope.users = {
        messages: [],
      };
      var database = firebase.database();
      var ref = database.ref("users");
      ref.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var user = childSnapshot.val();
          $scope.users.messages.push(user);
        });
        $scope.$apply();
      });
    };

    $scope.googleSignIn = function () {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
          var token = result.credential.accessToken;
          $scope.user = {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoUrl: result.user.photoURL,
          };
          $scope.$apply();
          $("#myModal").modal("show");
        })
        .catch(function (error) {});
    };

    $scope.saveData = function () {
      $scope.user.message = $scope.messageContent;
      var database = firebase.database();
      database
        .ref("users/" + $scope.user.uid)
        .set($scope.user)
        .then(function (current) {
          var database = firebase.database();
          var ref = database.ref("users");
          ref.once("value").then(function (snapshot) {
            $scope.users.messages.length = 0;
            snapshot.forEach(function (childSnapshot) {
              var user = childSnapshot.val();
              $scope.users.messages.push(user);
            });
            $scope.$apply();
          });
          firebase
            .auth()
            .signOut()
            .then(
              function () {
                $scope.$apply();
                $("#myModal").modal("toggle");
              },
              function (error) {}
            );
        });
    };

    $scope.changeNotifier = function () {
      $("#notifier").val("true").trigger("change");
    };

    $scope.init();
  },
]);
