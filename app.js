(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.filter('searchTerm', SearchTermFilter)
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItemsDirective);


function FoundItemsDirective() {
  // var ddo = {
  //   templateUrl: 'foundItems.html',
  //   scope: {
  //     items: '<',
  //     myTitle: '@title',
  //     onRemove: '&'
  //   },
  //   controller: FoundItemsDirectiveController,
  //   controllerAs: 'list',
  //   bindToController: true
  // };
  //
  // return ddo;
  var ddo = {
  templateUrl: 'foundItems.html',
  scope: {
    items: '<',
    title: '@'
  },
  // controller: 'ShoppingListDirectiveController as list',
  controller: FoundItemsDirectiveController,
  controllerAs: 'list',
  bindToController: true
};

return ddo;
}


function FoundItemsDirectiveController() {
  var list = this;

  // list.cookiesInList = function () {
  //   for (var i = 0; i < list.items.length; i++) {
  //     var name = list.items[i].name;
  //     if (name.toLowerCase().indexOf("cookie") !== -1) {
  //       return true;
  //     }
  //   }

    return false;
  //};
}


NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  let narrowItDown = this;
  narrowItDown.searchText = "";
  narrowItDown.title = "Narrowed items list";
  narrowItDown.found = [];

  narrowItDown.narrowItForMe = (searchText) => {
    console.log(searchText);
    let promise = MenuSearchService.getMatchedMenuItems(searchText);
    promise.then((foundItems) => {
      if(foundItems.length === 0) {
        narrowItDown.errorMessage = "Nothing Found!";
        narrowItDown.found = [];
      } else {
        narrowItDown.errorMessage = "";
        narrowItDown.found = foundItems;
        console.log(narrowItDown.found)
      }
    })
    .catch(function (error) {
        console.log("Something went terribly wrong.");
    });

    // narrowItDown.removeItem = function (itemIndex) {
    //   this.lastRemoved = "Last item removed was " + this.items[itemIndex].name;
    //   shoppingList.removeItem(itemIndex);
    //   this.title = origTitle + " (" + list.items.length + " items )";
    // };
  }
}

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

  service.getMenuItems = function () {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
    });

    return response;
  };

}

})();
