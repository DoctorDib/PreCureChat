//    id	               name	               picture      settings	       password	        email	   Servers	   create_date
// INT UNIQUE	      VARCHAR(50) UNIQUE	     TEXT	       TEXT      	VARCHAR(50)   	VARCHAR(150)	TEXT		TIMESTAMP

var Pool = require('pg').Pool;
var config = {
    host: 'localhost',
    user: 'postgres',
    password: 'SuperFatman69',
    database: 'database_master',
};

var pool = new Pool(config);

async function get_hits() {
    try {
        var response = await pool.query('SELECT * FROM items;');
        console.log(response.rows);
    } catch(e) {
        console.log(e);
    }
}

async function create_user(name){
    try {

		await pool.query("INSERT INTO " + name + "(id, name) VALUES (1, '" + name + "');");

    } catch(e) {
        console.log(e);
    }
}



create_user('test_account');


