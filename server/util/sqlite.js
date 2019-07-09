const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// define DB
const DB = {};

// DB set sqlite
DB.SqliteDB = function(file){
    // creare a db file
    DB.db = new sqlite3.Database(file);
    // check db file
    DB.exist = fs.existsSync(file);
    if(!DB.exist){
        console.log("Creating db file!");
        fs.openSync(file, 'w');
    };
};
// DB Util of Error Print
DB.error = function(err){
    console.error("Error Message:" + err.message + " ErrorNumber:" + errno);
};
DB.log = function(err){
    console.log("Error Message:" + err.message + " ErrorNumber:" + errno);
};

// create table
DB.SqliteDB.prototype.createTable = function(sql){
    DB.db.serialize(function(){
        DB.db.run(sql, function(err){
            if(null != err){
                DB.error(err);
                return;
            }
        });
    });
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function(sql, objects, done){
    DB.db.serialize(function(){
        var stmt = DB.db.prepare(sql);
        for(var i = 0; i < objects.length; ++i){
            stmt.run(objects[i]);
        }
        stmt.finalize();
        if (done) done();
    });
};

/**
 * query
 */
DB.SqliteDB.prototype.queryData = function(sql, done, error){
    DB.db.all(sql, function(err, rows){
        if(null != err){
            DB.error(err);
            if (error) {
                error();
            }
            return
        }
        /// deal query data.
        if(done){
            done(rows);
        }
    });
};

/**
 * execute sql
 */
DB.SqliteDB.prototype.executeSql = function(sql, done, error){
    DB.db.run(sql, function(err){
        if(null != err){
            DB.error(err);
            if (error) {
                error();
            }
            return;
        }
        if (done) done();
    });
};

/**
 * close connect
 */
DB.SqliteDB.prototype.close = function(){
    DB.db.close();
};
 
/**
 * export SqliteDB.
 */
exports.SqliteDB = DB.SqliteDB;