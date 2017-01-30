var express = require('/usr/apps/nodejs/lib/node_modules/express/');
var app = express();
var fs = require('fs');
var http = require('http');
var _mysql = require('mysql');
var request = require('request');
var pg = require('pg');
var assert = require('assert');
var ldap = require('ldapjs');
var sys = require('sys')
var exec = require('child_process').exec;
var util  = require('util'),
spawn = require('child_process').spawn;

//const output = fs.createWriteStream('stdout.log');
//const errorOutput = fs.createWriteStream('stderr.log');
//const logger = new Console(output, errorOutput);

app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});


app.post('/getMyMariaDBData', function (req, res)
{
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	 multipleStatements: true,
	 host     : 'localhost',
 	 user     : 'bonita',
 	 password : 'bonita',
  	database : 's2im'
	});
	connection.connect();
	var environment_status_check;

	function getEnvironmentStatusForAlertName(alertName, callback){
		var queryStr = 'Select * from ticketauto'; 
		var rowsx = connection.query(queryStr, function(err, rows, fields) 
		{
			if (err)
				throw err;
			var items = eval(rows[0]);
			if (items){
				environment_status_check = items;
				console.log("1. alertName: " + items['alert_name']);
				if (items['alert_name'] != alertName){
					callback(null);
				}else
				{
					console.log("1. environment_status_check: " + items['environment_status']);
  	 			//	console.log(query.sql);  
					callback(items['environment_status']);
				}
			}else{
				callback(null);
			}		
			
		});
	}

	function getEverythingFromTicketAuto(callback){
		var rowsx = connection.query('Select * from ticketauto', function(err, rows, fields) 
		{
			if (err)
				throw err;
			var items = eval(rows[0]);
			if (items){
				environment_status_check = items;
				console.log("2. environment_status_check: " + items['alert_id']);	
				callback(rows[0]);
			}else{
				callback(null);
			}		

			
		});
	}
	
	var alertNameSearchValue = '00test1';
	getEnvironmentStatusForAlertName(alertNameSearchValue, function(queryresults){
		console.log("3. getEnvironmentStatusForAlertName");
		if (queryresults){
            console.log('4. queryresults: ' + queryresults);
			res.send("record already exists" + queryresults);
		}else{
			console.log("4. no record found");
			var str = JSON.stringify(req.body);
			var object = JSON.parse(req.body);
        		var items = eval(object);
			//console.log('str: ' + str);
			var alert_id;
			var alert_name;
			var threshold;
			var callout;
			var environment_status;
			var staging_passed;
			//console.log('outside of loop: ' + items['alert_id']);
			alert_id =  items['alert_id'];
			alert_name =  items['alert_name'];
        		threshold =  items['threshold'];
        		callout =  items['callout'];
        		environment_status =  items['environment_status'];
        		staging_passed =  items['staging_passed'];                             
			var post  = {'alert_id':alert_id,'alert_name':alert_name,'threshold':threshold,'callout':callout,'environment_status':environment_status,'staging_passed':staging_passed,'submission_date':new Date()};
        		var query = connection.query('INSERT INTO ticketauto SET ?', post, function(err, result) {
        		//console.log('checking err : ' + err);
        		if (err) throw err;
        			//console.log("performing the query");
     			});
			res.send("record inserted");
		}
		console.log("7. connection to DB ended");	
		connection.end();
	});

});



app.get('/getpostgresData', function (req, res)
{
	
	var massive = require("massive");
	var connectionString = 'postgres://bonita:bonita@localhost/business_data';
	//pg.connect(connectionString, onConnect);
 	
	var db = massive.connectSync({connectionString : connectionString});
	db.aclline.find(function(err,res){
	//db.aclline.find({"persistenceid >" : 0}, function(err,res){
  		if (err){
		    console.log(err);	
		}
		else
		{
		    console.log(res);
		}
	});


	//function onConnect(err, client, done) {
    //		//Err - This means something went wrong connecting to the database.
   // 	   if (err) {
   // 		   console.error(err);
   // 	           process.exit(1);
    //       }
     //      else
//	   {
//		console.log("got connection");   
//		
//		db.users.find(1, function(err,res){
 // 			console.log(res);
//		});
//
///		
//		
//		var query = client.query("SELECT hostname FROM aclline");
  //		query.on('error', function(err) {
   //			 console.error('error: ' + err.message);
//		});
//		query.on('row', function(row, result) {
  //  			console.log(row);
///		});
//
//		query.on('end', function(result) {
  //  			client.end();
//		}); 
	   
//	   }        
           //For now let's end client
 //          client.end();
               //                     }
//	}
});




function puts(error, stdout, stderr) { sys.puts(stdout) }

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})
