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
            _db = new PouchDB('birthdays', {adapter: 'websql'});
        };

        function addBirthday(birthday) {
            return $q.when(_db.post(birthday));
        };

        function updateBirthday(birthday) {
            return $q.when(_db.put(birthday));
        };

        function deleteBirthday(birthday) {
            return $q.when(_db.remove(birthday));
        };

        function getAllBirthdays() {

            if (!_birthdays) {
                return $q.when(_db.allDocs({ include_docs: true}))
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
                         });
            } else {
                // Return cached data as a promise
                return $q.when(_birthdays);
            }
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
