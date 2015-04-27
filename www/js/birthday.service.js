(function() {

    angular.module('starter').factory('BirthdayService', ['$q', BirthdayService]);

    function BirthdayService($q) {  
        var _db;    
        var _birthdays;

        return {
            initDB: initDB,

            getAllBirthdays: getAllBirthdays,
            addBirthday: addBirthday,
            updateBirthday: updateBirthday,
            deleteBirthday: deleteBirthday
        };

        function initDB() {
            // Creates the database or opens if it already exists
            _db = new PouchDB('birthdays');
        };

        function addBirthday(birthday) {
            var deferred = $q.defer();
            deferred.resolve(_db.post(birthday));
            return deferred.promise;
        };

        function updateBirthday(birthday) {
            var deferred = $q.defer();
            deferred.resolve(_db.put(birthday));
            return deferred.promise;
        };

        function deleteBirthday(birthday) {
            var deferred = $q.defer();
            deferred.resolve(_db.remove(birthday));
            return deferred.promise;
        };

        function getAllBirthdays() {

            var deferred = $q.defer();

            if (!_birthdays) {
                deferred.resolve(_db.allDocs({ include_docs: true})
                          .then(function(docs) {

                            // Each row has a .doc object and we just want to send an 
                            // array of birthday objects back to the calling controller,
                            // so let's map the array to contain just the .doc objects.
                            _birthdays = docs.rows.map(function(row) {
                                // Dates are not automatically converted from a string.
                                row.doc.Date = new Date(row.doc.Date);
                                return row.doc;
                            });

                            // Listen for changes on the database.
                            _db.changes({ live: true, since: 'now', include_docs: true})
                               .on('change', onDatabaseChange);

                           return _birthdays;
                         }));
            } else {
                // Return cached data as a promise
                deferred.resolve(_birthdays);
            }

           return deferred.promise;
        };

        function onDatabaseChange(change) {
            var index = findIndex(_birthdays, change.id);
            var birthday = _birthdays[index];

            if (change.deleted) {
                if (birthday) {
                    _birthdays.splice(index, 1); // delete
                }
            } else {
                if (birthday && birthday._id === change.id) {
                    _birthdays[index] = change.doc; // update
                } else {
                    _birthdays.splice(index, 0, change.doc) // insert
                }
            }
        }
        
        function findIndex(array, id) {
          var low = 0, high = array.length, mid;
          while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
          }
          return low;
        }
    }
})();
