(function(){
angular.module('starter').controller('OverviewController', ['$scope', '$ionicModal', '$ionicPlatform', 'BirthdayService', OverviewController]);

function OverviewController($scope, $ionicModal, $ionicPlatform, birthdayService) {
	var vm = this;

	// Initialize the database.
	$ionicPlatform.ready(function() {
		birthdayService.initDB();

		// Get all birthday records from the database.
		birthdayService.getAllBirthdays().then(function(birthdays) {
			vm.birthdays = birthdays;
		});
	});
	
	// Initialize the modal view.
	$ionicModal.fromTemplateUrl('add-or-edit-birthday.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	vm.showAddBirthdayModal = function() {
		$scope.birthday = {};
		$scope.action = 'Add';
		$scope.isAdd = true;
		$scope.modal.show();			
	};
	
	vm.showEditBirthdayModal = function(birthday) {
		$scope.birthday = birthday;
		$scope.action = 'Edit';
		$scope.isAdd = false;			
		$scope.modal.show();
	};

	$scope.saveBirthday = function() {
		if ($scope.isAdd) {
			birthdayService.addBirthday($scope.birthday);				
		} else {
			birthdayService.updateBirthday($scope.birthday);				
		}						
		$scope.modal.hide();
	};
	
	$scope.deleteBirthday = function() {
		birthdayService.deleteBirthday($scope.birthday);			
		$scope.modal.hide();
	};
			
	$scope.$on('$destroy', function() {
		$scope.modal.remove(); 
	});

	return vm;
}
})();