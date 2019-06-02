(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.filter('searchTerm', SearchTermFilter)
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItemsDirective);


function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'foundItems.html',
    scope: {
      items: '<',
      title: '@',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'list',
    bindToController: true
  };
  return ddo;
}

//empty directive controller as this is not
//needed in the assignment to do anything
function FoundItemsDirectiveController() {}

NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  let narrowItDown = this;
  narrowItDown.searchText = "";
  narrowItDown.title = "Narrowed items list";
  narrowItDown.found = [];

//function to narrow down the menu and store it in found array
  narrowItDown.narrowItForMe = (searchText) => {
    let promise = MenuSearchService.getMatchedMenuItems(searchText);
    promise.then((foundItems) => {
      if(foundItems.length === 0) {
        narrowItDown.errorMessage = "Nothing Found!";
        narrowItDown.found = [];
      } else {
        narrowItDown.errorMessage = "";
        narrowItDown.found = foundItems;
      }
    })
    .catch(function (error) {
        console.log("Something went terribly wrong.");
    });

// function to remove the item the user doesnt want
    narrowItDown.removeItem = function (itemIndex) {
      narrowItDown.found.splice(itemIndex, 1);
    };

  }
}

//Filter to search menu items that match description
function SearchTermFilter() {
  return function (input, target, key) {
    //From input array find the item whose desciption key
    //includes the substring target
    let filteredItems = input.filter((inputItem) => {
      return inputItem[key].includes(target);
    })
    return filteredItems;
  }
}


MenuSearchService.$inject = ['$http', 'ApiBasePath', '$q', 'searchTermFilter'];
function MenuSearchService($http, ApiBasePath, $q, searchTermFilter) {
  var service = this;

//function that returns the response wrapped in a promise
  service.getMatchedMenuItems = function (searchTerm) {
    let deferred = $q.defer();
    if (searchTerm === "") {
      //retuen empty array if user didn enter any text
      deferred.resolve([]);
      return deferred.promise;
    } else {
      return service.getMenuItems().then((response) => {
        let menuItems = response.data.menu_items;
        let foundItems = searchTermFilter(menuItems, searchTerm, 'description');
        return foundItems;
      });
    }
  }

 //http request to the menu
  service.getMenuItems = function () {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
    });
    return response;
  };

}

})();
