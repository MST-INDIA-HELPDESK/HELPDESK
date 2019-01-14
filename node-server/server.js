var http = require("http");
var https = require("https");
var bodyParser = require("body-parser");
var express = require("express");
var multer  = require('multer');
var fs = require('fs');
var app = express();
var mysql = require('mysql');
var moment = require('moment');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const config = require('./config');
var generator = require('generate-password');
var md5 = require('md5');
var dateFormat=require('dateformat')
const MailParser = require('mailparser').MailParser;
const simpleParser = require('mailparser').simpleParser;

const util = require('util');

const Queue = require('bee-queue');
const queue = new Queue('example');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  dateStrings: 'date',
  password: 'mst#123',
  database: 'helpdesk'
});

/*

postmaster:    root
curl_email: "|curl --data-binary  @- https://www.shopemailer.com/api/emailToTicket

1. I’m using Twitter’s APIs to create tickets on their tweets on companies  twitter page
2. I plan to analyze Tweets to understand the problems that user facing
3. Yes, I will be Tweeting content to the twitter page tweet as reply to the users tweet 
4. Tweets will be displayed on twitter page of company.

*/
const privateKey = fs.readFileSync('/etc/letsencrypt/live/shopemailer.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/shopemailer.com/fullchain.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/shopemailer.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

var transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	secure: false,
	port: 25,
	auth: {
        user: 'vjsurve234@gmail.com',
        pass: 'VS8177823923'
	},
	tls: {
		rejectUnauthorized: false
	}
});

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
});

app.use(bodyParser.json({limit: '20mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


const job = queue.createJob({x: 2, y: 3})
job.save();
job.on('succeeded', (result) => {
  //console.log(`Job ${job.id} succeeded with result: ${result}`);
});

job.on('retrying', (err) => {
  //console.log(`Job ${job.id} failed with error ${err.message} but is being retried!`);
});

queue.process(function (job, done) {
  //console.log(`Processing job ${job.id}`);
  return done(null, test());
});

function test(){
 return 'BEE-QUE TEST'
}
/*if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message, 
            error: err
        });
     });
 }*/
 
function ensureAuthorized(req, res, next) {
   var bearerToken;
   var wid='';
   var uname='';
   var bearerHeader = req.headers["authorization"];
   //console.log(bearerHeader);
   if (typeof bearerHeader !== 'undefined') {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		decoded = jwt.verify(bearerToken, config.secret);
		var email = decoded.data;
		//console.log("data returns :: "+decoded.data);
		var queryString = "SELECT id FROM tbl_user_master WHERE email='"+email+"'";
        	connection.query(queryString,function(err,user){
			if (err) return next(err);
			//console.log('user at 119      '+user);
			var id = user[0].id;
			if(id)
			{
				req.user_id=user[0].id;
				next();
			}
			else{
			   console.log('user id not set');
			}                                       
        })
     } else {
       res.send('Token Is Invalid');
   }
}


function generateTicket(data,lastInsertId) {
	var date=dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  	var data = {user_id: lastInsertId, first_name: data.fnm || '', last_name: data.lnm || '', email: data.email, subject: data.subject, message: data.message, created_date: date, updated_date: date, priority: 'Medium', status:1, topic_id: 1,attached_file:data.attached_file || null};	
		connection.query("INSERT INTO tbl_tickets SET ?", data, function(err, rows) {
			if(err) {
				console.log("Error in generateTicket-Mysql :: "+err);
			}
			else {
				console.log('ticket created');
			}
	});					
}
function localDate(createdTime){
	var date1 = new Date();
	var newDate=dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
	return newDate;
	//console.log('Server Date ',newDate)
	//var date2 = new Date(date1+' GMT-05:30');
	//console.log('Local Date ',dateFormat(new Date(date2), "yyyy-mm-dd HH:MM:ss"))
	//return date2;
}


app.post("/api/fbToTicket", function(req,res) {	
	if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        	res.send(req.query['hub.challenge']);
    	} else {
        	res.send('Invalid verify token');
    	}
	var attached_file='';
	var fbData=req.body.entry[0].changes[0].value;
	console.log('Webhook ',req.body.entry[0].changes[0].value)	
	var date=localDate(fbData.created_time);
	var str = fbData.post_id;
  	var result = str.split("_");
	var ticket_id=result[1];
	console.log('ticket_id ',ticket_id)
	if(fbData.item==='post' || fbData.item==='photo' || fbData.item==='status'){
		if(fbData.item!='like' && fbData.item!='reaction'  && fbData.verb!='remove' ){
	    	console.log('Post by :: ',fbData.from.id)
		var user_id= fbData.from.id;
		var user_name=fbData.from.name;
		var subject=fbData.message;
		
		if(fbData.item=='photo'){
		    var attached_file=fbData.link;
		}
		if(user_id) {
    		connection.query("SELECT user_id FROM tbl_user WHERE user_id = ?", user_id, function(err, rows){
    			if(err) {
    				console.log("Error in MySql :: "+err);
    			}
    			else {	
			   var newUser = {user_id: user_id, first_name: user_name, last_name: '', profile_pic:null};
    			   if(rows.length == 0) {
				connection.query("INSERT INTO tbl_user SET ?", newUser, function(err1, rows1) {
					if(err1) {
						console.log("Error1 in MySql :: "+err1);
					}
			    	});
	    	        }
	    	    var data = {id:ticket_id,user_id: user_id, first_name: user_name, last_name: '', email: 'fb@gmail.com', subject:subject, message: '', created_date: date, updated_date: date, priority: 'Medium', status:1, topic_id: 1,attached_file:attached_file || null,type:'facebook'};	
        		    connection.query("INSERT INTO tbl_tickets SET ?", data, function(err, rows) {
            			if(err) {
            				console.log("Error in generateTicket-FB :: "+err);
            			}
            			else {
            				console.log('ticket created');
            			}
        	        });
     		    }
	        })
	    }
	}
	}
	else if(fbData.item=='comment'){
		console.log('Comment By :: ',fbData.from.id)
		var user_id= fbData.from.id;var user_name=fbData.from.name;
		var subject=fbData.message;var comment_id=fbData.comment_id;
		if(fbData.item=='photo'){
		    var attached_file=fbData.link;
		}
		var data={reply:subject,type:'comment',reply_id:user_id,ticket_id:ticket_id,create_date:date,update_date: date,img:attached_file}
	    var queryString = "INSERT INTO tbl_ticket_reply SET ? ";
    	connection.query(queryString,[data], function(err,result){
        	if(err){
        		console.log(err);
        	}
        	else{
    	        console.log('reply added');
    	    }
	    }); 
	
	}else{
		console.log('Neither post or comment ')	
	}

	
}); 

https://www.shopemailer.com/api/twitterToticket

app.get("/api/twitterToticket",function(req,res){
	var twitterData=req.body;
	console.log('Twitter : ',twitterData)
	res.json("get")
})

app.post("/api/twitterToticket",function(req,res){
	var twitterData=req.body;
	console.log('Twitter : ',twitterData)
	res.json("post")
})

app.post("/api/emailToTicket", function(req,res) {
	 console.log("Email :: ",req.body)
	 var parseMe = Object.keys(req.body)[0];
	 console.log("parseMe :: ",parseMe)
	
	/*var eId = req.body.email;
	console.log("password="+req.body.password);
	var data = {email: req.body.email, password: md5(req.body.password), type_id:req.body.utype };
	if(eId) {
		connection.query("Select id From tbl_user_master Where email =?", eId, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length == 0) {
					connection.query("INSERT INTO tbl_user_master SET ?", data, function(err1, rows1) {
						if(err1) {
							console.log("Error1 in MySql :: "+err1);
						}
						else {
							var lastInsertId = rows1.insertId;							
							if(lastInsertId) {
								var data1 = {user_id: lastInsertId, first_name: req.body.fNm, last_name: req.body.lNm};
								connection.query("INSERT INTO tbl_user SET ?", data1, function(err2, rows2){
									if(err2) {
										console.log("Error2 in MySql :: "+err2);
									}
									else {
										generateTicket(data,lastInsertId);
										var token = jwt.sign({data: eId}, config.secret);
										res.json({token:token,  expiresIn: 24 * 60 * 60  });
									}
								});
							}
						}
					});
				}else{
					generateTicket(data,rows[0].id);
					res.json({token:null, 'status':'user Exist'});
				}
			}
		});
	}*/

	//res.json("Proxy call - post email ticket")
});



app.get("/api/emailToTicket", function(req,res) {	
	console.log('GEt - emailToticket',req.body)
	res.json("Proxy call -get email ticket")
}); 

app.post("/api/fbPermission", function(req,res) {	
	console.log('POST - fbToTicket',req.body)
	if (req.query['hub.verify_token'] === 'verify_token') {
        	res.send(req.query['hub.challenge']);
    	} else {
        	res.send('Invalid verify token');
    	}

}); 





/* ---- Start ----- */

app.post('/api/login', function(req, res) {
	var eId = req.body.email;
	var pwd = req.body.password;
	if(eId) {
		connection.query("Select id,type_id,password From tbl_user_master Where email =?", eId, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length > 0) {
					if(rows[0].password == md5(req.body.password))
					{
						var token = jwt.sign({data: eId}, config.secret);
						res.json({id:rows[0].id,type_id:rows[0].type_id, token:token,  expiresIn: 24 * 60 * 60  });
					}else{
						res.json({token:null})
					}
				}else{
					res.json({token:null})
				}
			}
		});
	}
});

app.post('/api/signup', function(req, res) {
	var eId = req.body.email;
	var type=req.body.type;
	var profile_pic;
 	if(req.body.image){
		profile_pic=req.body.image;
	}else{
		profile_pic=null;	
	}
	var data = {email: req.body.email, password: md5(req.body.password), type_id:req.body.utype };
	if(eId) {
		connection.query("Select id From tbl_user_master Where email =?", eId, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length == 0) {
					connection.query("INSERT INTO tbl_user_master SET ?", data, function(err1, rows1) {
						if(err1) {
							console.log("Error1 in MySql :: "+err1);
						}
						else {
							var lastInsertId = rows1.insertId;							
							if(lastInsertId) {
								var data1 = {user_id: lastInsertId, first_name: req.body.fNm, last_name: req.body.lNm,profile_pic:profile_pic};
								connection.query("INSERT INTO tbl_user SET ?", data1, function(err2, rows2){
									if(err2) {
										console.log("Error2 in MySql :: "+err2);
									}
									else {
										var token = jwt.sign({data: eId}, config.secret);
										res.json({token:token, id:lastInsertId, expiresIn: 24 * 60 * 60  });
									}
								});
							}
						}
					});
				}else{
					if(type=='social'){
					var token = jwt.sign({data: eId}, config.secret);
						res.json({token:token, id:rows[0].id, expiresIn: 24 * 60 * 60  });
					}else{
						res.json({token:null,id:rows[0].id, 'status':'user Exist'});
					}	
				}
			}
		});
	}
});


app.post('/api/resetPass', function(req,res){
	var email=req.body.email;
	console.log("email"+email);
	var password = generator.generate({length: 8,numbers: true});
  	var data = {password:md5(password)}
	var queryString="UPDATE tbl_user_master SET ? WHERE email = ?";
	connection.query(queryString,[data,email],function(err,rows){
	if(err){
		console.log(err);
	}		
	else{
		res.json(rows);	
	}
	})
})

app.get('/api/getPriorities', ensureAuthorized, function(req,res){
	var queryString="select priority from tbl_priorities";
	connection.query(queryString,function(err,rows){
	if(err){
		console.log(err);
	}		
	else{
		res.json(rows);	
	}
	})
})


app.get('/api/getTags', ensureAuthorized, function(req,res){
	var queryString="select id,tag_name from tbl_tags";
	connection.query(queryString,function(err,rows){
	if(err){
		console.log(err);
	}		
	else{
		res.json(rows);	
	}
	})
})

app.post('/api/getTagsByTicket', ensureAuthorized, function(req,res){
	var ticket_id=req.body.ticket_id;
	var queryString="select tag_id from tbl_ticket_tags WHERE ticket_id="+ticket_id;
	connection.query(queryString,function(err,rows){
	if(err){
		console.log(err);
	}		
	else{
		res.json(rows);	
	}
	})
})

app.get("/api/getUsers", ensureAuthorized, function(req, res) {
	var queryString = "SELECT tbl_user_master.id, tbl_user_master.email, tbl_user.user_id, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS name FROM tbl_user_master INNER JOIN tbl_user ON tbl_user.user_id = tbl_user_master.id";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log("Error in MySql :: "+err);
		}
		else {
			res.json(rows);
		}
	});
});


app.get('/api/getTeams', function(req, res){
	var queryString = "SELECT * FROM tbl_teams";
	connection.query(queryString, function(err,rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});

app.get('/api/getTopics', function(req, res){
	var queryString = "SELECT * FROM tbl_topics";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});

app.get('/api/getAgents', function(req, res){
	var queryString = "SELECT tbl_user_master.id,CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS assignee FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user.user_id = tbl_user_master.id WHERE tbl_user_master.type_id = 2";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});
app.get('/api/getTicketStatus', function(req, res){
	var queryString = "SELECT id,status FROM tbl_ticketStatus";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});

app.post('/api/getTicketDetails', function(req, res){
var id=req.body.id;
var type=req.body.type;
console.log("type: "+type);
if(type== 'web'){
    var queryString ="SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,tbl_tickets.tag, tbl_tickets.email, subject, message, created_date, updated_date, priority,assignee, team,status,profile_pic as assignee_pic FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE tbl_tickets.id="+id;
}
else {
    var queryString ="SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,tbl_tickets.tag, tbl_tickets.email, subject, message, created_date, updated_date, priority,assignee, team,status FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE tbl_tickets.id="+id;
}
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});
app.post('/api/getHistory', function(req, res){
	var ticket_id=req.body.ticket_id;
	var queryString = "SELECT CONCAT(first_name, ' ', last_name) AS user_name,`create_date`,`update_date`,`type` FROM `tbl_ticket_reply` INNER JOIN `tbl_user` ON tbl_ticket_reply.reply_id=tbl_user.user_id WHERE ticket_id="+ticket_id;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}else{
			res.json(rows)
		}
	})
})

app.get('/api/getArticles', function(req, res){
	var queryString = "SELECT * FROM tbl_knowledgebase";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
}); 
app.get('/api/getCannedRes', function(req, res){
	var queryString = "SELECT * FROM tbl_canned_response";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/createCannedRes', function(req, res){
	var title=req.body.title;
	var message=req.body.mes;
	var data={title:title, message:message};
	var queryString = "INSERT INTO tbl_canned_response SET ?";
	connection.query(queryString, [data], function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/deleteCannedRes', function(req, res){
	var id=req.body.id;
	var queryString = "DELETE FROM tbl_canned_response WHERE id =?";
	connection.query(queryString, [id], function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/getSelectedRes', function(req, res){
	var resId=req.body.id;
	var queryString = "SELECT * FROM tbl_canned_response WHERE id ="+resId;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/getSolutions', function(req, res){
	var article_id=req.body.article_id;
	var parent_id=req.body.parent_id;

	var queryString = "SELECT id,(SELECT category_title FROM tbl_knowledgebase_newcategory WHERE id="+parent_id+") as category,content,rating FROM tbl_knowledgebase WHERE id ="+article_id;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/getYesNos', function(req, res){
	var article_id=req.body.article_id;
	//var id=req.body.id;
	var queryString = "SELECT id,no_of_yes,no_of_no,rating FROM tbl_knowledgebase WHERE id ="+article_id;	
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/calcRatings', function(req, res){
	var article_id=req.body.article_id;
	//var id=req.body.id;
	var data = {no_of_yes:req.body.no_of_yes, no_of_no:req.body.no_of_no,rating:req.body.rating}
	var queryString = "UPDATE tbl_knowledgebase SET ? WHERE id = ?";
	connection.query(queryString,[data,article_id],function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json('ratings updated');
		}
	});
});

app.post('/api/updateCannedRes', function(req, res){
	var title=req.body.title;
	var message=req.body.mes;
	console.log("Update Canned ",req.body.id)
	var data={title:title, message:message };
	var queryString = "UPDATE tbl_canned_response SET ? WHERE id= ?";
	connection.query(queryString, [data,req.body.id], function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.post('/api/updateReply', function(req, res){
	var param=req.body.data;
	var data={reply:param.reply, update_date: param.updated_date};
	var queryString = "UPDATE tbl_ticket_reply SET ? WHERE id= ? ";
	connection.query(queryString, [data,param.id], function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
}); 
app.post('/api/getReply', function(req, res){
	var data=req.body.data;
	var queryString = "SELECT tbl_ticket_reply.id,reply_id,reply,profile_pic, CONCAT(first_name, ' ', last_name) AS user_name,type,update_date FROM tbl_ticket_reply INNER JOIN tbl_user ON tbl_user.user_id = tbl_ticket_reply.reply_id WHERE ticket_id="+data.ticket_id+" AND type='"+data.type+"' ";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});

app.post('/api/postReply', function(req, res){
console.log("Post")
var param=req.body.data;
var data={reply:param.reply,type:param.type,reply_id:param.reply_id,ticket_id:param.ticket_id,create_date: param.created_date, update_date: param.updated_date,img:param.img}
	var queryString = "INSERT INTO tbl_ticket_reply SET ? ";
	connection.query(queryString,[data], function(err,result){
	if(err){
		console.log(err);
	}
	else{
		var queryString = "SELECT COUNT(reply) as count FROM `tbl_ticket_reply` WHERE ticket_id="+param.ticket_id;
		connection.query(queryString,[data], function(err,rows){
		if(rows[0].count==1){
		var queryString = "UPDATE `tbl_tickets` SET assignee = "+param.reply_id+" WHERE id="+param.ticket_id;
				connection.query(queryString,[data], function(err,rows){
					res.json('assignee updated');
				})			
	
		}else{
			res.json('reply inserted');
		}
		})
	}
	}); 
});

app.post('/api/deleteReply', function(req, res){
	var reply_id=req.body.reply_id;
	var queryString = "DELETE FROM tbl_ticket_reply WHERE id="+reply_id;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
/*app.get('/api/showknowledgebasearticle', function(req, res){
   var queryString = "SELECT id, subject FROM tbl_knowledgebase_newarticle WHERE category_title=0";
   connection.query(queryString, function(err,rows){
       if(err){
           console.log(err);
       }
       else{
           res.json(rows);
       }
   });
});*/
app.post('/api/getAllReply', function(req, res){
var ticket_id=req.body.ticket_id;
var queryString = "SELECT tbl_ticket_reply.id,reply_id,reply,profile_pic, CONCAT(first_name, ' ', last_name) AS user_name,type,update_date FROM tbl_ticket_reply INNER JOIN tbl_user ON tbl_user.user_id = tbl_ticket_reply.reply_id WHERE ticket_id="+ticket_id+" ORDER BY update_date DESC ";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
app.get('/api/getArticlesDesc', function(req, res){
	var queryString = "select id,article,parent_category from tbl_knowledgebase ORDER BY id DESC LIMIT 5";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});

const DIR1 = '/var/www/shopemailer.com/tickets/';
let storage1 = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR1);
    },
    filename: function (req, file, cb) {
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
	  cb(null, Date.now() + ext);
    }
}); 
let uploadFile = multer({storage: storage1});

app.post('/api/fileUpload', ensureAuthorized, uploadFile.single('image'), function (req, res) {
	//console.log(req.file.filename);
	if (!req.file) {
		//console.log("No file received");
		console.log("Error! in image upload.");
	} else {
		console.log("Successfully! uploaded");
		res.json([{result:'success'},{file_name:req.file.filename}]);
	}
});

app.post("/api/genTickets", ensureAuthorized, function(req, res) {
	var user = req.body.email;
	if(user) {
		connection.query("SELECT id,email FROM tbl_user_master WHERE email = ?", user, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				generateTicket(req.body, rows[0].id,function(err, result){
					if(err) {
						console.log("error in MySql :: "+err);
					}
					else {
						res.json(result.insertId);
					}
				});
			}
		});
	}
});

app.post("/api/addTeam", function(req,res) {	
	var data = {name: req.body.tnm, description: req.body.tdesc};
	connection.query("INSERT INTO tbl_teams SET ?", data, function(err, rows) {
		if(err) {
			console.log("error in MySql :: "+err);
		}
		else {
			var gId = rows.insertId;
			var queryResult;
			req.body.tmem.forEach(function(item) { 
				var data1 = {team_id: gId, user_id: item};
				queryResult = connection.query("INSERT INTO tbl_teams_master SET ?", data1, function(err1, rows1){
					if(err1) {
						console.log("error 1 in MySql :: "+err1);
					}
					else {
						return rows1;
					}
				});
			});
			if(queryResult.values !== 'undefined') {
				var queryString = "SELECT * FROM tbl_teams";
				connection.query(queryString, function(err2, rows2) {
					if(err2) {
						console.log("error 2 in MySql :: "+err2);
					}
					else {
						res.json(rows2);
					}
				});
			}
		}
	});
});

app.get('/api/getMembers', function(req, res){
	var queryString = "SELECT tbl_user_master.id, tbl_user_master.email, tbl_user.user_id, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS name FROM tbl_user_master INNER JOIN tbl_user ON tbl_user.user_id = tbl_user_master.id Where tbl_user_master.type_id = 2";
	connection.query(queryString, function(err,rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});

app.post("/api/getTeamDetailsById", function(req,res) {
	var tid = req.body.tid;
	connection.query("SELECT name, description FROM tbl_teams WHERE id = ?", tid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});

app.post("/api/getTeamMembersById", function(req,res) {
	var tid = req.body.tid;
	connection.query("SELECT tbl_teams_master.user_id, tbl_user_master.email, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS member_name FROM tbl_teams_master RIGHT JOIN tbl_user_master ON tbl_user_master.id = tbl_teams_master.user_id INNER JOIN tbl_user ON tbl_user.user_id = tbl_teams_master.user_id WHERE tbl_teams_master.team_id = ?", tid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});

app.post("/api/addTeamMembersById", function(req,res) {
	var queryResult;
	req.body.tmem.forEach(function(item) { 
		connection.query("SELECT * FROM tbl_teams_master WHERE team_id = ? AND user_id = ?", [req.body.tid, item], function(err,rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length == 0) {
					var data = {team_id: req.body.tid, user_id: item};
					connection.query("INSERT INTO tbl_teams_master SET ?", data, function(err1, rows1){
						if(err1) {
							console.log("error 1 in MySql :: "+err1);
						}
						else {
							connection.query("SELECT tbl_teams_master.user_id, tbl_user_master.email, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS member_name FROM tbl_teams_master RIGHT JOIN tbl_user_master ON tbl_user_master.id = tbl_teams_master.user_id INNER JOIN tbl_user ON tbl_user.user_id = tbl_teams_master.user_id WHERE tbl_teams_master.team_id = ?", req.body.tid, function(err2, rows2) {
								if(err2) {
									console.log("Error 2 in MySql : "+err);
								}
								else {
									res.json(rows2);
								}
							});
						}
					});
				}
			}
		});
	});
});

app.post("/api/remTeamMembersById", function(req,res) {	
	connection.query("SELECT * FROM tbl_teams_master WHERE team_id = ? AND user_id = ?", [req.body.tid, req.body.tmem], function(err,rows){
		if(err) {
			console.log("Error in MySql :: "+err);
		}
		else {
			if(rows.length > 0) {
				connection.query("DELETE FROM tbl_teams_master WHERE team_id = ? AND user_id = ?", [req.body.tid, req.body.tmem], function(err1, rows1){
					if(err1) {
						console.log("error 1 in MySql :: "+err1);
					}
					else {
						connection.query("SELECT tbl_teams_master.user_id, tbl_user_master.email, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS member_name FROM tbl_teams_master RIGHT JOIN tbl_user_master ON tbl_user_master.id = tbl_teams_master.user_id INNER JOIN tbl_user ON tbl_user.user_id = tbl_teams_master.user_id WHERE tbl_teams_master.team_id = ?", req.body.tid, function(err2, rows2) {
							if(err2) {
								console.log("Error 2 in MySql : "+err);
							}
							else {
								res.json(rows2);
							}
						});
					}
				});
			}
		}
	});
});

app.post("/api/updateTeamById", function(req,res) {	
	var data = {name: req.body.tnm, description: req.body.tdesc};
	connection.query("UPDATE tbl_teams SET ? WHERE id = ?", [data, req.body.tid], function(err,rows){
		if(err) {
			console.log("Error in MySql :: "+err);
		}
		else {
			connection.query("SELECT name, description FROM tbl_teams WHERE id = ?", req.body.tid, function(err1, rows1) {
				if(err1) {
					console.log("Error 1 in MySql : "+err);
				}
				else {
					res.json(rows1);
				}
			});
		}
	});
});

app.post("/api/delTeam", function(req,res) {
	connection.query("DELETE FROM tbl_teams WHERE id = ?", req.body.tid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			connection.query("DELETE FROM tbl_teams_master WHERE team_id = ?", req.body.tid, function(err1, rows1){
				if(err1) {
					console.log("Error1 in MySql : "+err1);
				}
				else {
					var queryString = "SELECT * FROM tbl_teams";
					connection.query(queryString, function(err2, rows2){
						if(err2) {
							console.log("Error1 in MySql : "+err2);
						}
						else {
							res.json(rows2);
						}
					});
				}
			});
		}
	});
});

app.get("/api/getUser", ensureAuthorized, function(req,res) {
var queryString = "SELECT first_name,last_name,CONCAT(first_name,' ',last_name) as user_name, profile_pic FROM tbl_user WHERE user_id ="+req.user_id;
	connection.query(queryString, function(err, rows) {
		if(err){
			console.log("Error in MySql : "+err)
		}
		else {
			res.json(rows);
		}
	});
});

app.get("/api/getUserProfile", ensureAuthorized, function(req,res) {
var queryString = "SELECT * FROM tbl_user INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id WHERE tbl_user_master.id ="+req.user_id;
	connection.query(queryString, function(err, rows) {
		if(err){
			console.log("Error in MySql : "+err)
		}
		else {
			res.json(rows);
		}
	});
});

app.post("/api/newknowledgebasecategory",ensureAuthorized, function(req,res) {	
	var data = {user_id: req.user_id, category_title: req.body.cattitle, type: req.body.type};
    	connection.query("INSERT INTO tbl_knowledgebase_newcategory SET ?", data, function(err, rows) {
        if(err) {
            console.log("error in MySql :: "+err);
        }
        else {            
            res.json(rows);                
        }
    });
});

const articledir = '/var/www/shopemailer.com/uploadArticle/';
let articlestorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, articledir);
    },
    filename: function (req, file, cb) {
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
	  cb(null, Date.now() + ext);
    }
}); 
let articleupload = multer({storage: articlestorage});

app.post('/api/articlefileUpload', ensureAuthorized, articleupload.single('attachmentFile'), function (req, res) {
	console.log("article file :: "+req.file.filename);
var data = {article_file:req.file.filename};
  //message : "Error! in image upload."
    if (!req.file) {
        console.log("No file received");
         // message = "Error! in image upload."    
      } else {
      	console.log("successfully get article file...");
		res.json([{result:'success'},{article_file:req.file.filename},{url:'https://www.shopemailer.com/uploadArticle/'+req.file.filename}]);
		/*var sql = "UPDATE tbl_knowledgebase SET ? WHERE id = ?";
			connection.query(sql, [data, 1], function(err, result){
			console.log('inserted data');					                  
		});	*/
      }
      });

app.post("/api/newkbarticle",ensureAuthorized, function(req,res) {	
	var data = {user_id: req.user_id, parent_category:req.body.parent_cat, article: req.body.article, article_type: req.body.articletype, content: req.body.content, keywords: req.body.keywords };
	connection.query("INSERT INTO tbl_knowledgebase SET ?", data, function(err, rows) {
		if(err) {
			console.log("error in MySql :: "+err);
		}
		else{
			res.json(rows);
		}		
	});
});

app.post('/api/getArticleById', function(req, res){ 
    connection.query("SELECT article, article_type, content, keywords FROM tbl_knowledgebase WHERE id = ?", req.body.artid, function(err, rows) {    
        if(err){
            console.log(err);
        }
        else{
            res.json(rows);
        }
    });
});

app.post('/api/updatekbarticle', function(req, res) {	
	var data = { article: req.body.article, article_type: req.body.articletype, content: req.body.content, keywords: req.body.keywords };
	var sql = "UPDATE tbl_knowledgebase SET ? WHERE id = ?";
	connection.query(sql, [data, req.body.article_id], function(err, result){
	if (err) {
		throw err;
	}
	else{	
		res.json(result);
	}	
	});
});

app.post("/api/delarticle", function(req,res) {
	connection.query("DELETE FROM tbl_knowledgebase WHERE id = ?", req.body.aid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else{
			var queryString = "SELECT * FROM tbl_knowledgebase";
			connection.query(queryString, function(err2, rows2){
				if(err2) {
					console.log("Error1 in MySql : "+err2);
				}
				else {
					res.json(rows2);
				}
			});			
		}		
	});
});

const logodir = '/var/www/shopemailer.com/logos/';
let logostorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, logodir);
    },
    filename: function (req, file, cb) {
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
	  cb(null, Date.now() + ext);
    }
}); 
let logoupload = multer({storage: logostorage});
app.post('/api/logoUpload', ensureAuthorized, logoupload.single('imageUpload'), function (req, res) {
	console.log("logo image :: "+req.file.filename);
var data = {logoimage:req.file.filename};
  //message : "Error! in image upload."
    if (!req.file) {
        console.log("No file received");
         // message = "Error! in image upload."    
	  } else {
		console.log("successfully get logo image...");
		res.json([{result:'success'},{logoimage:req.file.filename},{url:'https://www.shopemailer.com/logos/'+req.file.filename}]);
		/*var queryString = "SELECT logo_img FROM tbl_generalsetting";
		connection.query(queryString, function(err1,result1){
			if(err1){
				console.log(err1);
			}
			else{
				res.json(result1);
			}
		});*/ 
	  }
      });


app.post("/api/setgensetting",ensureAuthorized, function(req,res) {	
	var data = {user_id: req.user_id, website_title:req.body.websitetitle, helpdesk_title: req.body.helpdesktitle, helpdesk_url: req.body.helpdeskurl, webmaster_email: req.body.webmasteremail, from_email: req.body.fromemail, fromname: req.body.fromname, logo_img: req.body.imageUpload };
	connection.query("INSERT INTO tbl_generalsetting SET ?", data, function(err, rows) {
		if(err) {
			console.log("error in MySql :: "+err);
		}
		else{
			res.json(rows);
		}		
	});
});

app.post('/api/updtgeneralstg',ensureAuthorized, function(req, res) {
    var data = {user_id: req.user_id, website_title:req.body.websitetitle, helpdesk_title: req.body.helpdesktitle, helpdesk_url: req.body.helpdeskurl, webmaster_email: req.body.webmasteremail, from_email: req.body.fromemail, fromname: req.body.fromname, logo_img: req.body.imageUpload};
    connection.query("UPDATE tbl_generalsetting SET ?", data, function(err, rows) {
	    if(err) {
		    console.log("Error1 in MySql :: "+err);
	    }
	    else {
		    res.json(rows);					
	    }
    });
});

app.post("/api/newtag", function(req,res) {	
var tag_id = req.body.tagnm;
var data = { tag_name: req.body.tagnm };
	if(tag_id) {
		connection.query("Select id From tbl_tags Where tag_name =?", tag_id, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length == 0) {
					connection.query("INSERT INTO tbl_tags SET ?", data, function(err1, rows1) {
						if(err1) {
							console.log("error in MySql :: "+err1);
						}
						else{
							res.json(rows1);
						}		
					});
				}
				else{
					res.json("Tag Exist");
				}
			}
		});
	}
});

app.post("/api/getTagById", function(req,res) {	
	connection.query("SELECT * from tbl_tags WHERE id ="+req.body.tagid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});

app.post("/api/updatetag", function(req,res) {	
var tagname = req.body.tagnm;
var id=req.body.tag_id;	
var data = { tag_name: req.body.tagnm };
	if(tagname) {
		connection.query("Select id From tbl_tags Where tag_name =?", tagname, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				console.log(rows);
				if(rows.length == 0) {					
					var queryString = "UPDATE tbl_tags SET ? WHERE id = ?";
					connection.query(queryString,[data,id],function(err1,rows1){
						if(err1){
							console.log(err1);
						}
						else{
							res.json(rows1);
						}		
					});
				}
				else{					
					res.json("Tag Exist");
				}
			}
		});
	}
});

app.post("/api/deltag", function(req,res) {
var tagid = req.body.tagid;
	connection.query("DELETE FROM tbl_tags WHERE id = ?", req.body.tagid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else{
			var data = { tag_id: null }
			//var tagidd= tagid.toString();
	
			//var queryString = "UPDATE tbl_ticket_tags SET ? WHERE tag_id = ?";
			//connection.query(queryString,[data,tagid],function(err1,rows1){
				connection.query("DELETE FROM tbl_ticket_tags WHERE tag_id = ?", tagid, function(err1, rows1){
				if(err1){
					console.log(err1);
				}
				else{
					var queryString = "SELECT tbl_tags.id, tbl_tags.tag_name, COUNT(tbl_ticket_tags.ticket_id) AS ticketcount FROM tbl_ticket_tags RIGHT JOIN tbl_tags ON tbl_tags.id = tbl_ticket_tags.tag_id GROUP BY tbl_tags.id";
					connection.query(queryString, function(err3, rows3){
					if(err3) {
						console.log("Error1 in MySql : "+err3);
					}
					else {
						res.json(rows3);
					}
				});	
				}			
			});		
		}		
	});
});

app.get('/api/getalltag', function(req, res){	
	var queryString = "SELECT tbl_tags.id, tbl_tags.tag_name, COUNT(tbl_ticket_tags.ticket_id) AS ticketcount FROM tbl_ticket_tags RIGHT JOIN tbl_tags ON tbl_tags.id = tbl_ticket_tags.tag_id GROUP BY tbl_tags.id";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});


app.post("/api/emailToTicket", function(req,res) {	
	console.log('emailToticket',req.body)
	res.json("Email to ticket")
});

app.get('/api/getgensetting', function(req, res){
	var queryString = "SELECT * FROM tbl_generalsetting";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});


app.get('/api/getProfilePic',ensureAuthorized, function(req, res){
	var queryString = "SELECT profile_pic FROM tbl_user WHERE user_id ="+req.user_id;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});

app.post('/api/getAssigneePic', function(req, res){
	var user_id=req.body.user_id;
	var queryString = "SELECT profile_pic FROM tbl_user WHERE user_id ="+user_id;
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});
 
app.get('/api/showknowledgebasecategory', function(req, res){
	var queryString = "SELECT id, category_title FROM tbl_knowledgebase_newcategory ";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
});

app.post('/api/getkbsubcategory', function(req, res){ 
    connection.query("SELECT id, category_title FROM tbl_knowledgebase_newcategory WHERE parent_category = ?", req.body.subcatid, function(err, rows) {    
        if(err){
            console.log(err);
        }
        else{
            res.json(rows);
        }
    });
});

app.get('/api/getTest', function(req, res){ 
    connection.query("SELECT parent_category FROM tbl_knowledgebase_newcategory GROUP BY `parent_category`", function(err, rows) {    
        if(err){
            console.log(err);
        }
        else{
            res.json(rows);
        }
    });
});

app.post('/api/getkbsubcatarticle', function(req, res){ 
    connection.query("SELECT id, article,parent_category FROM tbl_knowledgebase WHERE parent_category = ?", req.body.subcatid, function(err, rows) {    
        if(err){
            console.log(err);
        }
        else{
            res.json(rows);
        }
    });
});

app.get('/api/newknowledgebasecategory', function(req, res){
	var queryString = "SELECT id, category_title FROM tbl_knowledgebase_newcategory";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);
		}
	});
}); 

/*
var queryString = "SELECT DISTINCT tbl_tickets.id,tbl_ticket_tags.ticket_id,user_id,email,status,CONCAT(first_name, ' ', last_name) AS user_name, created_date, updated_date, email, subject, message, priority, assignee,type FROM tbl_tickets LEFT JOIN tbl_ticket_tags ON tbl_tickets.id=tbl_ticket_tags.ticket_id ";
		if(params.priority=="" && params.assignee=="" && params.team==""){
			queryString+=" WHERE tbl_ticket_tags.tag_id IN ('"+tags+"')";
		}else{
			queryString+=" and tbl_ticket_tags.tag_id IN ('"+tags+"')";
		}
*/


app.post('/api/filterTickets',ensureAuthorized, function(req, res){
var params=req.body.param;
var queryString;
if(params.tag!=""){
queryString = "SELECT DISTINCT tbl_tickets.id,tbl_ticket_tags.ticket_id,user_id,email,status,CONCAT(first_name, ' ', last_name) AS user_name, created_date, updated_date, email, subject, message, priority, assignee,type FROM tbl_tickets LEFT JOIN tbl_ticket_tags ON tbl_tickets.id=tbl_ticket_tags.ticket_id ";
}
else{
queryString="SELECT id,user_id,email,status,CONCAT(first_name, ' ', last_name) AS user_name, created_date, updated_date, email, subject, message, priority, assignee,type FROM tbl_tickets";
}
	if(params.team!=""){
		var team= params.team.join("','");
		queryString+=" WHERE team IN ('"+team+"')";
	}	
	if(params.priority!=""){
		var prior= params.priority.join("','");
		if(params.team==""){
			queryString+=" WHERE priority IN ('"+prior+"')";
		}else{
			queryString+=" and priority IN ('"+prior+"')";
		}
	}
	if(params.status!=""){
		var status= params.status;
		if(params.priority=="" && params.team==""){
			queryString+=" WHERE status IN ("+status+")";
		}else{
			queryString+=" and status IN ("+status+")";
		}
	}
	
	if(params.assignee!=""){
		var assignee= params.assignee;
		if(params.priority=="" && params.status=="" && params.team==""){
			queryString+=" WHERE assignee IN ("+assignee+")";
		}else{
			queryString+=" and assignee IN ("+assignee+")";
		}
		
	}
	if(params.date!=""){
		if(params.priority=="" && params.status=="" && params.assignee=="" && params.team==""){
			queryString+=" WHERE created_date ='"+params.date+"'";
		}else{
			queryString+=" and created_date ='"+params.date+"'";
		}
	}
	if(params.tag!=""){
		var tags= params.tag.join("','");
		if(params.priority=="" && params.assignee=="" && params.team=="" && params.status==""){
			queryString+=" WHERE tbl_ticket_tags.tag_id IN ('"+tags+"')";
		}else{
			queryString+=" and tbl_ticket_tags.tag_id IN ('"+tags+"')";
		}
	}
	if(params.user_type_id == 2){
		if(params.date=="" && params.priority=="" && params.assignee=="" && params.team=="" && params.tag=="" ){
			queryString+=" WHERE ( assignee="+req.user_id+" OR assignee=6 )";
		}else{
			queryString+=" AND ( assignee="+req.user_id+" OR assignee=6 )";	
		}
	}else{
	
	}
	
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{	
			res.json(rows);
		}
	});

}); 


app.post('/api/myFilterTickets',ensureAuthorized, function(req, res){
var params=req.body.param;
var usr_id=req.body.prof_id;
var queryString="SELECT id,email,status,CONCAT(first_name, ' ', last_name) AS user_name, created_date, updated_date, email, subject, message, priority, assignee FROM tbl_tickets";
	if(params.priority!=""){
		var prior= params.priority.join("','");
		queryString+=" WHERE priority IN ('"+prior+"') AND user_id="+req.body.prof_id;

	}
	if(params.status!=""){
		var status= params.status;
		if(params.priority==""){
			queryString+=" WHERE status IN ("+status+") AND user_id="+req.body.prof_id;
		}else{
			queryString+=" and status IN ("+status+") and user_id="+req.body.prof_id;
		}
	}
	
	if(params.assignee!=""){
		var assignee= params.assignee ;
		if(params.priority=="" && params.status=="" ){
			queryString+=" WHERE assignee IN ("+assignee+") AND user_id="+req.body.prof_id;
		}else{
			queryString+=" and assignee IN ("+assignee+") and user_id="+req.body.prof_id;
		}
		
	}
	
	if(params.priority=="" && params.status=="" && params.assignee=="")
	{
		queryString+=" WHERE user_id="+req.body.prof_id;
	}
	
	if(params.user_type_id == 2){
		if(params.priority=="" && params.status=="" && params.assignee==""){
			queryString+=" WHERE ( assignee="+req.user_id+" OR assignee=6 AND user_id="+req.body.prof_id+")";
		}else{
			queryString+=" AND ( assignee="+req.user_id+" OR assignee=6 WHERE user_id="+req.body.prof_id+")";	
		}
	}else{
		console.log('Else Type_id :',params.user_type_id)		
	}
	//console.log(queryString)
	//queryString+=" WHERE (user_id="+req.body.prof_id+")";
	connection.query(queryString, function(err,rows){
		if(err){
			console.log(err);
		}
		else{		
			res.json(rows);
		}
	});
}); 


app.get('/api/getTickets',ensureAuthorized, function(req, res){
	var  user_type_id= req.query.user_type_id;
	var queryString;
	if(user_type_id==2){
		queryString="SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,assignee ,tbl_tickets.email, subject, message, created_date, updated_date, priority, team,profile_pic, status,type FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE ( assignee ="+req.user_id+" OR assignee = 6 ) ORDER BY created_date desc";
	
	}else{
		queryString = "SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,assignee ,tbl_tickets.email, subject, message, created_date, updated_date, priority, team,profile_pic, status,type FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id ORDER BY created_date desc";
		//queryString = "SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,assignee ,tbl_tickets.email, subject, message, created_date, updated_date, priority, team,profile_pic, status,type FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE tbl_tickets.status=1 ORDER BY created_date desc";
	}
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});

app.post('/api/getMyTickets',ensureAuthorized, function(req, res){
	var  user_type_id= req.query.user_type_id;
	var userId = req.body.usr_id;
	var queryString;
	queryString="SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,assignee ,tbl_tickets.email, subject, message, created_date, updated_date, priority, team,profile_pic, status FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE tbl_tickets.user_id ="+userId+" AND status="+req.body.selectedStatus;
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
});

app.get('/api/getAllTickets',ensureAuthorized, function(req, res){
	console.log("getAllTickets")
	queryString="SELECT tbl_tickets.id,tbl_tickets.user_id,CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS user_name,assignee ,tbl_tickets.email, subject, message, created_date, updated_date, priority, team,profile_pic, status FROM tbl_tickets INNER JOIN tbl_user on tbl_user.user_id=tbl_tickets.user_id WHERE ( assignee ="+req.user_id+" OR assignee = 6 ) ";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});	
})

app.post('/api/updateProfile', ensureAuthorized, function(req, res) {
	var data = {first_name:req.body.fname, last_name:req.body.lname, company: req.body.company, address:req.body.address, phone: req.body.phone, facebook:req.body.facebook, twitter:req.body.twitter, email:req.body.email};
	var sql = "UPDATE tbl_user INNER JOIN tbl_user_master ON tbl_user.user_id = tbl_user_master.id SET ? WHERE user_id = ?";
	connection.query(sql, [data, req.user_id], function(err, result){
	if (err) {
		throw err;
	}
	else{	
		res.json(result);
	}	
	});
});

app.post('/api/updateSignature', ensureAuthorized, function(req, res) {
	var data = {signature:req.body.sign};
	var sql = "UPDATE tbl_user INNER JOIN tbl_user_master ON tbl_user.user_id = tbl_user_master.id SET ? WHERE user_id = ?";
	connection.query(sql, [data, req.user_id], function(err, result){
	if (err) {
		throw err;
	}
	else{	
		var queryString = "SELECT signature FROM tbl_user WHERE user_id ="+req.user_id;
		connection.query(queryString, function(err1,rows){
			if(err1){
				console.log(err1);
			}
			else{
				res.json(rows);
			}	
	});
	}
	});
});



app.post('/api/insertTicketTag',function(req, res) {
	var data = req.body.data;
	var updateData = []
	for(let i=0; i<data.tag.length; i++){
	var sql = "SELECT tag_id,ticket_id FROM tbl_ticket_tags WHERE ticket_id=? AND tag_id=?";
	connection.query(sql, [data.ticket_id,data.tag[i]], function(err, result){
	if (err) {
		throw err;
	}
	else{		
		if(result.length==0){
		      var updateData={ticket_id:data.ticket_id,tag_id:data.tag[i]};
		    		var sql = "INSERT INTO tbl_ticket_tags SET ?";
		    		connection.query(sql, [updateData], function(err, result){
		    			if (err) {
		    				throw err;
		    			}
	 	    			else{	
						var done=data.tag.length - 1;
					   	if(i == done){
						res.json("inserted")
						}
	    		    	}
		    		})
			}
	    	}
	})
    }   
})

app.post('/api/deleteTicketTag',function(req, res) {
	console.log("delet ticket")
	var data = req.body.data;
	var updateData = []
	var sql = "DELETE FROM tbl_ticket_tags WHERE ticket_id=? AND tag_id=?";
	connection.query(sql, [data.ticket_id,data.tag], function(err, result){
		if (err) {
			throw err;
		}
		else{	
			res.json("Deleted")
	    	}
	})

})

app.post('/api/updateTicket',function(req, res) {
	
	var data = req.body.data;
	var updateData=[];

	if(data.type=="status"){
		updateData={status:data.status};		
	}else if(data.type=="priority"){
		updateData={priority:data.priority};
	}else if(data.type=="assignee"){
		updateData={assignee:data.assignee}	
	}
	else{
		updateData={team:data.team.toString()}	
	}
	var sql = "UPDATE tbl_tickets SET ? WHERE id = ?";
	connection.query(sql, [updateData, data.ticket_id], function(err, result){
	if (err) {
		throw err;
	}
	else{	
		console.log("updateTicket "+sql)
		if(data.type=="assignee"){
			var queryString = "SELECT user_id,CONCAT(first_name, ' ', last_name) as assignee ,profile_pic FROM tbl_user WHERE tbl_user.user_id="+data.assignee;
			connection.query(queryString, function(err, rows) {
			if(err) {
				console.log(err);
			}
			else {
				res.json(rows);
			}
			});
		}else{
			res.json("nothingToReturn");
		}	
	}	
	});
});
app.post('/api/deleteTicket',function(req, res) {
	var ids = [];
	ids=req.body.data;
	var sql = "DELETE FROM tbl_tickets WHERE id IN ("+ ids +")";
	connection.query(sql, function(err, result){
	if (err) {
		throw err;
	}
	else{	
		var queryString = "SELECT * FROM tbl_tickets";
		connection.query(queryString, function(err, rows) {
			if(err) {
				console.log(err);
			}
			else {
				res.json(rows);
			}
		})
	}	
	});
});
app.post('/api/assignTicket',function(req, res) {
	var data = [];
	data=req.body.data;
	var assignee=req.body.assignee;
	var updateData={assignee:assignee}
	for(let i=0; i<data.length; i++){
	var queryString = "UPDATE tbl_tickets SET ? WHERE id = ?";
	connection.query(queryString, [updateData, data[i]], function(err, result){
	if (err) {
		throw err;
	}
	else{	
		if(i==data.length-1){
			var queryString = "SELECT * FROM tbl_tickets";
			connection.query(queryString, function(err, rows) {
				if(err) {
					console.log(err);
				}
				else {
					console.log("DOne");
					res.json(rows);
				}
			})			
		}
	}	
	})
	}
});

app.post('/api/UpdatePassword', ensureAuthorized, function(req, res){
var data = {password:md5(req.body.pwd)};
var sql = "UPDATE tbl_user_master SET ? WHERE id = ?";
	connection.query(sql, [data, req.user_id], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});

app.post('/api/getUsersDetails',function(req,res){
		var queryString;
		if(req.body.param == "admin")
		{	
			queryString ="SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user.profile_pic,tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE tbl_user_master.type_id = 1";
		}
		else if(req.body.param == "agent")	
		{
			queryString ="SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user.profile_pic, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE tbl_user_master.type_id = 2";
		}	
		else if(req.body.param == "managers")
		{
			queryString ="SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user.profile_pic, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE tbl_user_master.type_id = 3";
		}
		else if(req.body.param == "users")	
		{
			queryString ="SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user.profile_pic, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE tbl_user_master.type_id = 4";
		}
		else
		{	
			queryString ="SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user.profile_pic, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE type_id != 0";	
		}
		connection.query(queryString,function(err,rows){
		if(err){
			console.log(err);
		}
		else
		{
			res.json(rows);
		}	
	});
});

app.post('/api/deleteUserDetails',function(req,res){
	var queryString ="UPDATE tbl_user_master SET type_id=0 where id="+req.body.uid;
	connection.query(queryString,function(err,rows){
		if(err){
			console.log(err);
		}
		else
		{
			var queryString = "SELECT tbl_user.user_id, tbl_user.first_name, tbl_user.last_name, tbl_user.company, tbl_user.phone, tbl_user.facebook, tbl_user.twitter, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user` INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_user.user_id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE type_id != 0";
			connection.query(queryString, function(err2, rows2){
				if(err2) {
					console.log("Error1 in MySql : "+err2);
				}
				else {
					res.json(rows2);
				}
			});
		}	
	})
});

app.post('/api/deleteAllUsers',function(req,res){
	var len=req.body.deleteArr.length;
	var i=0;
	for(var k=0;k < len; k++)
	{
		
		var queryString ="UPDATE tbl_user_master SET type_id=0 where id="+req.body.deleteArr[k];
		connection.query(queryString,function(err,rows){
			if(err){
				console.log(err);
			}
			else
			{
				i=i+1;
				if(i == req.body.deleteArr.length)
				res.json('success');
			}
			
		}); 
	}
});

app.post('/api/editUsers',function(req,res){
	var queryString ="SELECT tbl_user.first_name,tbl_user.last_name,tbl_user.company,tbl_user.address,tbl_user.phone,tbl_user.facebook,tbl_user.twitter,tbl_user.profile_pic,tbl_user_master.email, tbl_user_master.type_id, tbl_users_type.type FROM `tbl_user`INNER JOIN tbl_user_master ON tbl_user.user_id = tbl_user_master.id INNER JOIN tbl_users_type ON tbl_users_type.id = tbl_user_master.type_id WHERE tbl_user.user_id="+req.body.usrid;
	connection.query(queryString,function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			res.json(rows);	
		}
	});
});

app.post('/api/updateUsersDetails',function(req,res){
	var data = {first_name:req.body.uFname,last_name:req.body.uLname,address:req.body.uAddr,phone:req.body.uPh,facebook:req.body.uFb,twitter:req.body.uTwit,company:req.body.uComp}
	var sql = "UPDATE tbl_user SET ? where user_id= ?";
	connection.query(sql, [data, req.body.uId], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});

/*app.post('/api/getUserById',function(req,res){
	var queryString ="SELECT *";
}); */
app.get('/api/getUserType',function(req,res){
	var sql = "SELECT * FROM tbl_users_type where id != 1";
	connection.query(sql,function(err,rows){
	if(err){
		throw err;
	}
	else{
		res.json(rows);
	}	
	});
});

app.get("/api/getAllTicketsById",ensureAuthorized,function(req,res){
	var queryString = "SELECT tbl_tickets.id, tbl_tickets.subject, tbl_tickets.created_date, tbl_tickets.updated_date, tbl_tickets.priority, tbl_ticketStatus.status FROM tbl_tickets INNER JOIN tbl_ticketStatus ON tbl_ticketStatus.id = tbl_tickets.status WHERE tbl_tickets.user_id = "+req.user_id;
	connection.query(queryString, function(err, rows){
	if(err) {
			console.log("Erroe In MySql :: "+err);
		}else{
		res.json(rows)
	}
	})
});

app.post("/api/getTicketsByEmail",function(req,res){
	if(req.body.usChoice == 'Open') {
		var queryString = "SELECT tbl_tickets.id, tbl_tickets.subject, tbl_tickets.created_date, tbl_tickets.updated_date, tbl_tickets.priority, tbl_ticketStatus.status FROM tbl_tickets INNER JOIN tbl_ticketStatus ON tbl_ticketStatus.id = tbl_tickets.status WHERE tbl_tickets.email = '"+ req.body.usEmail +"' AND tbl_ticketStatus.status = '"+ req.body.usChoice +"'";
	}
	else {
		var queryString = "SELECT tbl_tickets.id, tbl_tickets.subject, tbl_tickets.created_date, tbl_tickets.updated_date, tbl_tickets.priority, tbl_ticketStatus.status FROM tbl_tickets INNER JOIN tbl_ticketStatus ON tbl_ticketStatus.id = tbl_tickets.status WHERE tbl_tickets.email = '"+ req.body.usEmail +"'";
	}
	connection.query(queryString, function(err, rows){
		var userHtml = '';
		if(err) {
			console.log("Erroe In MySql :: "+err);
		}
		else {
			
			if(rows.length > 0) {
				for(let i = 0; i < rows.length; i++) {
					userHtml += "<table>"+
					"<tr><th>Ticket Id :</th> <td>"+rows[i].id+"</td></tr>"+
					"<tr><th>Created Date :</th> <td>"+rows[i].created_date+"</td></tr>"+
					"<tr><th>Updated Date :</th> <td>"+rows[i].updated_date+"</td></tr>"+
					"<tr><th>Subject :</th> <td>"+rows[i].subject+"</td></tr>"+
					"<tr><th>Priority :</th> <td>"+rows[i].priority+"</td></tr>"+
					"<tr><th>Status :</th> <td>"+rows[i].status+"</td></tr>"+
					"</table><br />";
				}
				
				// setup email data with unicode symbols
				let mailOptions = {
					from: '"Admin" <vjsurve234@gmail.com>', // sender address
					to: 'vjsurve234@gmail.com', // list of receivers
					subject: 'Your Ticket Details', // Subject line
					text: 'Hello world?', // plain text body
					html: userHtml // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.log(error);
					}
					else {
						//console.log('Message sent');						
						res.json("sent");
					}
					// Preview only available when sending through an Ethereal account
					//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

					// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
					// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
				});			
			}
			else {
				
			}
		}
	});
});

app.post("/api/getTypeIdByEmail",function(req,res){
	//var ticket_id=req.body.ticket_id;
	var queryString = "SELECT id, type_id FROM tbl_user_master WHERE email = '"+ req.body.email+"'";
	connection.query(queryString, function(err, rows){
		if(err) {
			console.log("Erroe In MySql :: "+err);
		}else{
			res.json(rows)
		}
	});
});

app.post("/api/getUserTicketsById",ensureAuthorized,function(req,res){
	//var ticket_id=req.body.ticket_id;
	var queryString = "SELECT tbl_tickets.id, CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS name, tbl_tickets.email, tbl_tickets.subject, tbl_tickets.message, tbl_tickets.created_date, tbl_tickets.updated_date, tbl_tickets.priority, tbl_tickets.team, tbl_tickets.status, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS assignee_name, tbl_ticketStatus.status, tbl_topics.topic FROM tbl_tickets INNER JOIN tbl_user ON tbl_user.user_id = tbl_tickets.assignee INNER JOIN tbl_ticketStatus ON tbl_ticketStatus.id = tbl_tickets.status INNER JOIN tbl_topics ON tbl_topics.id = tbl_tickets.topic_id WHERE tbl_tickets.id = "+ req.body.ticketid;
	connection.query(queryString, function(err, rows){
		if(err) {
			console.log("Erroe In MySql :: "+err);
		}else{
			res.json(rows)
		}
	});
});

app.post('/api/viewTicketInfo', function(req, res){
	var queryString = "SELECT tbl_tickets.id, CONCAT(tbl_tickets.first_name, ' ', tbl_tickets.last_name) AS name, tbl_tickets.email, tbl_tickets.subject, tbl_tickets.message, tbl_tickets.created_date, tbl_tickets.updated_date, tbl_tickets.priority, tbl_tickets.team, tbl_tickets.status, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS assignee_name, tbl_ticketStatus.status, tbl_topics.topic FROM tbl_tickets INNER JOIN tbl_user ON tbl_user.user_id = tbl_tickets.assignee INNER JOIN tbl_ticketStatus ON tbl_ticketStatus.id = tbl_tickets.status INNER JOIN tbl_topics ON tbl_topics.id = tbl_tickets.topic_id WHERE tbl_tickets.email = '"+ req.body.email +"' AND tbl_tickets.id = "+ req.body.ticketid;
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			res.json(rows);
		}
	});
});

app.post('/api/getTicketsReplys', function(req, res) {
	var queryString = "SELECT tbl_ticket_reply.id, tbl_ticket_reply.ticket_id, tbl_ticket_reply.reply_id, tbl_ticket_reply.reply, tbl_ticket_reply.type, tbl_ticket_reply.create_date, tbl_ticket_reply.update_date, tbl_ticket_reply.img, tbl_ticket_reply.rating, tbl_user.user_id, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS user_name, tbl_user.profile_pic, tbl_user_master.email AS user_email, tbl_user_master.type_id FROM tbl_ticket_reply INNER JOIN tbl_user ON tbl_user.user_id = tbl_ticket_reply.reply_id INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_ticket_reply.reply_id WHERE tbl_ticket_reply.type = 'comment' AND tbl_ticket_reply.ticket_id = "+ req.body.tid+ " ORDER BY create_date desc";
	connection.query(queryString, function(err, rows) {
		if(err) {
			console.log(err);
		}
		else {
			if(rows.length > 0) {
				res.json(rows);
			}
		}
	});	
});

app.post('/api/giveReply', function(req, res){
	var param=req.body.data;
	var data={reply:param.reply,type:param.type,reply_id:param.reply_id,ticket_id:param.ticket_id,create_date: param.created_date, update_date: param.updated_date, img: param.img}
	var queryString = "INSERT INTO tbl_ticket_reply SET ? ";
	var queryString2 = "SELECT tbl_ticket_reply.id, tbl_ticket_reply.ticket_id, tbl_ticket_reply.reply_id, tbl_ticket_reply.reply, tbl_ticket_reply.type, tbl_ticket_reply.create_date, tbl_ticket_reply.update_date, tbl_ticket_reply.img, tbl_ticket_reply.rating, tbl_user.user_id, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS user_name, tbl_user.profile_pic, tbl_user_master.email AS user_email, tbl_user_master.type_id FROM tbl_ticket_reply INNER JOIN tbl_user ON tbl_user.user_id = tbl_ticket_reply.reply_id INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_ticket_reply.reply_id WHERE tbl_ticket_reply.type = 'comment' AND tbl_ticket_reply.ticket_id = "+ param.ticket_id +" ORDER BY create_date desc";
	connection.query(queryString,[data], function(err,row){
		if(err){
			console.log(err);
		}
		else{
			connection.query(queryString2, function(err1, rows1) {
				if(err1) {
					console.log(err1);
				}
				else {
					if(rows1.length > 0) {
						res.json(rows1);
					}
				}
			});				
		}
	}); 
});

app.post('/api/calcSolutionRatings', function(req, res){	
	var queryString = "UPDATE tbl_ticket_reply SET rating =? WHERE ticket_id = ? AND id = ?";
	connection.query(queryString, [req.body.rating, req.body.tid, req.body.rid], function(err, rows){
		if(err) {
			console.log("Error in Mysql :: "+err);
		}
		else {
			var queryString1 = "SELECT tbl_ticket_reply.id, tbl_ticket_reply.ticket_id, tbl_ticket_reply.reply_id, tbl_ticket_reply.reply, tbl_ticket_reply.type, tbl_ticket_reply.create_date, tbl_ticket_reply.update_date, tbl_ticket_reply.img, tbl_ticket_reply.rating, tbl_user.user_id, CONCAT(tbl_user.first_name, ' ', tbl_user.last_name) AS user_name, tbl_user.profile_pic, tbl_user_master.email AS user_email, tbl_user_master.type_id FROM tbl_ticket_reply INNER JOIN tbl_user ON tbl_user.user_id = tbl_ticket_reply.reply_id INNER JOIN tbl_user_master ON tbl_user_master.id = tbl_ticket_reply.reply_id WHERE tbl_ticket_reply.type = 'comment' AND tbl_ticket_reply.ticket_id = "+ req.body.tid +" ORDER BY create_date desc";
			connection.query(queryString1, function(err1,rows1){
				if(err1) {
					console.log("Error1 in MySql :: "+err1);
				}
				else {
					res.json(rows1);
				}
			});
		}
	});	
});

const DIR = '/var/www/shopemailer.com/uploadpics/';
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
	  cb(null, Date.now() + ext);
    }
}); 
let upload = multer({storage: storage});

app.post('/api/uploadfile', ensureAuthorized, upload.single('image'), function (req, res) {
var data = {profile_pic:req.file.filename};
  message : "Error! in image upload."
    if (!req.file) {
        console.log("No file received");
          message = "Error! in image upload."    
      } else {
     	var sql = "UPDATE tbl_user SET ? WHERE user_id = ?";
			connection.query(sql, [data, req.user_id], function(err, result){
			console.log('inserted data');					                  
		});
		message = "Successfully! uploaded";
		var queryString = "SELECT profile_pic FROM tbl_user WHERE user_id ="+req.user_id;
		connection.query(queryString, function(err1,result1){
			if(err1){
				console.log(err1);
			}
			else{
				res.json(result1);
			}
		});      
      }
});

app.post('/api/rptPerUser',function(req,res){	
	var sql = "SELECT (SELECT CONCAT(first_name,' ', last_name) from tbl_user WHERE user_id IN (SELECT assignee tbl_tickets GROUP BY assignee)) as user,COUNT(assignee) as assigned_tickets,COUNT(IF(user_id IN (SELECT assignee FROM tbl_tickets GROUP BY assignee),1,null)) 'submitted_tickets',COUNT(IF(status=1,1, NULL)) 'Open',COUNT(IF(status=2,1,null)) 'Closed',COUNT(IF(status=3,1, NULL)) 'Resolved', (SELECT COUNT(reply_id) from tbl_ticket_reply WHERE reply_id IN (SELECT assignee tbl_tickets GROUP BY assignee)) as replied,(SELECT ROUND(AVG(rating),1) FROM tbl_ticket_reply WHERE reply_id IN (SELECT assignee tbl_tickets GROUP BY assignee)) as 'rating(avg)' FROM tbl_tickets WHERE created_date BETWEEN ? AND ? GROUP BY assignee";
	connection.query(sql,[req.body.fromdt, req.body.todt], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});


app.post('/api/rptPerCategory',function(req,res){	
	var sql = "SELECT tbl_knowledgebase_newcategory.category_title,COUNT(tbl_tickets.id) as submitted_tickets,COUNT(IF(status=1,1,null)) 'Open',COUNT(IF(status=2,1,null)) 'Closed',COUNT(IF(status=3,1, NULL)) 'Resolved',COUNT(IF(status=3,1,null)) 'Resolved' FROM tbl_tickets INNER JOIN tbl_knowledgebase_newcategory ON tbl_knowledgebase_newcategory.id=tbl_tickets.topic_id  WHERE created_date BETWEEN ? AND ? GROUP BY topic_id";
	connection.query(sql,[req.body.fromdt, req.body.todt], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});

app.post('/api/rptRun',function(req,res){	
	var sql = "SELECT DATE(created_date) as created_date,COUNT(id) as tickets,COUNT(IF(status=1,1,null)) 'Open',COUNT(IF(status=2,1,null)) 'Closed',COUNT(IF(status=2,1,null)) 'Resolved' FROM `tbl_tickets` WHERE created_date BETWEEN ? AND ? GROUP BY DATE(created_date) DESC"
	connection.query(sql,[req.body.fromdt, req.body.todt], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});

app.post('/api/rptCustomer',ensureAuthorized,function(req,res){	
	var sql = "SELECT ticket_id,COUNT(reply_id) as 'Total Replies', ROUND(AVG(rating),1) as 'Rating(avg)',(SELECT status from tbl_statusMaster WHERE id = tbl_tickets.status) as 'status' FROM `tbl_ticket_reply` INNER JOIN tbl_tickets ON tbl_ticket_reply.ticket_id=tbl_tickets.id WHERE create_date BETWEEN ? AND ? GROUP BY ticket_id"
	connection.query(sql,[req.body.fromdt, req.body.todt], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});
app.get('/api/getNotifications',ensureAuthorized,function(req,res){	
	var sql = "SELECT subject,created_date,ticket_id FROM tbl_notification WHERE target_id = "+req.user_id+" AND  status=0";
	connection.query(sql, function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});

app.get('/api/getAllnotifications',ensureAuthorized,function(req,res){	
	var sql = "SELECT status,subject,created_date,ticket_id FROM tbl_notification WHERE target_id = "+req.user_id;
	connection.query(sql, function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});
app.post('/api/notifyUser',ensureAuthorized,function(req,res){	
	var param=req.body.data; 
	var data ={ticket_id:param.ticket_id,user_id:param.user_id,target_id:param.target_id,subject:param.type,created_date:new Date()}
	console.log(data)
	var sql = "INSERT INTO tbl_notification SET ? ";
	connection.query(sql,[data], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json(result);
	}
	});	
});
app.post('/api/markAsRead',ensureAuthorized,function(req,res){	
	var ticket_id=req.body.ticket_id; 
	var data ={status:1} 
	var sql = "UPDATE tbl_notification SET ? WHERE ticket_id = ?";
	connection.query(sql,[data,ticket_id], function(err, result){
	if (err) {
		throw err;
	}
	else{
		res.json('marked as read');
	}
	});	
});
app.post('/api/saveOrBanEmailAddr', function(req, res) {
	var eId = req.body.email;
	
	var data = {email: req.body.email, status:req.body.status };
	if(eId) {
		connection.query("Select id From tbl_emailsettings_email Where email =?", eId, function(err, rows){
			if(err) {
				console.log("Error in MySql :: "+err);
			}
			else {
				if(rows.length == 0) {
					connection.query("INSERT INTO tbl_emailsettings_email SET ?", data, function(err1, rows1) {
						if(err1) {
							console.log("Error1 in MySql :: "+err1);
						}
						else {
							res.json(rows1);					
						}
					});
				}
				else{
					res.json("email Exist");
				}
			}
		});
	}
});

app.post('/api/getSettingsemails',function(req,res){
		var queryString;
		if(req.body.param == "chkbannedemail")
		{	
			queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 1";
		}		
		else
		{	
		    queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 0";
		}
		connection.query(queryString,function(err,rows){
		if(err){
			console.log(err);
		}
		else
		{
			res.json(rows);
		}	
	});
});
app.post("/api/delnewOrBannedEmail", function(req,res) {
	connection.query("DELETE FROM tbl_emailsettings_email WHERE id = ?", req.body.emailid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
        else{
			if(req.body.param == "chkbannedemail") {	
			    var queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 1";
		    }		
		    else {	
		        var queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 0";
		    }
		    connection.query(queryString,function(err1,rows1){
		        if(err1){
			        console.log(err1);
		        }
		        else {
			        res.json(rows1);
		        }
            });
		}				
	});
});
app.post("/api/getSettingEmailById", function(req,res) {
	var eid = req.body.eid;
	connection.query("SELECT * from tbl_emailsettings_email WHERE id ="+eid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});
app.post("/api/updateSettingEmailById", function(req,res) {	
    var email=req.body.email;
    var data={email:email};
	
	var sql = "UPDATE tbl_emailsettings_email SET ? WHERE id = ?";
	connection.query(sql, [data, req.body.eid], function(err1, rows1){
	if (err1) {
		throw err1;
	}
	else{		
		if(req.body.param == "chkbannedemail") {	
			var queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 1";
		}		
		else {	
			var queryString = "SELECT * FROM tbl_emailsettings_email WHERE status = 0";
		}
		connection.query(queryString,function(err2,rows2){
			if(err2){
				console.log(err2);
			}
			else {
				res.json(rows2);
			}
		});
	}			
	});
});
app.get("/api/getEmailGenSettings", function(req,res) {	
	var queryString = "SELECT * FROM tbl_emailsettings_gen_settings";
    connection.query(queryString, function(err, rows) {
        if(err){
            console.log("Error in MySql : "+err)
        }
        else {
            res.json(rows);
        }
    });
});
app.post("/api/saveEmailGenSettings", function(req,res) {			
	var data = {template_set: req.body.temp_set, system_email:req.body.sys_email, alert_email: req.body.alert_email, admin_email: req.body.admin_email, hostname: req.body.hostname, port_no: req.body.port_no, secure: req.body.secure, authentication:req.body.auth, encryption:req.body.encryption, header_spoofing:req.body.header_spoofing};
	connection.query("INSERT INTO tbl_emailsettings_gen_settings SET ?", data, function(err1, rows1) {
		if(err1) {
			console.log("error in MySql :: "+err1);
		}
		else{
			res.json(rows1);
		}		
	});	
});
app.post("/api/updateEmailGenSettings", function(req,res) {			
	var data = {template_set: req.body.temp_set, system_email:req.body.sys_email, alert_email: req.body.alert_email, admin_email: req.body.admin_email, hostname: req.body.hostname, port_no: req.body.port_no, secure: req.body.secure, authentication:req.body.auth, encryption:req.body.encryption, header_spoofing:req.body.header_spoofing};
	connection.query("UPDATE tbl_emailsettings_gen_settings SET ?", data, function(err1, rows1) {
		if(err1) {
			console.log("error in MySql :: "+err1);
		}
		else{
			res.json(rows1);
		}		
	});	
});

app.post('/api/saveNewEmailTemp', function(req, res) {
    var data = {name:req.body.temp_name, status:req.body.temp_status, content:req.body.content};
    connection.query("INSERT INTO tbl_emailsettings_template SET ?", data, function(err1, rows1) {
	    if(err1) {
		    console.log("Error1 in MySql :: "+err1);
	    }
	    else {
		    res.json(rows1);					
	    }
    });
});
app.post('/api/updateEmailTemp', function(req, res) {
    var data = {name:req.body.temp_name, status:req.body.temp_status, content:req.body.content};
    var sql = "UPDATE tbl_emailsettings_template SET ? WHERE id = ?";
	connection.query(sql, [data, req.body.eid], function(err1, rows1){
	    if(err1) {
		    console.log("Error1 in MySql :: "+err1);
	    }
	    else {
		    res.json(rows1);					
	    }
    });
});
app.get("/api/getemail_templates", function(req,res) {
var queryString = "SELECT id, name, status, content FROM tbl_emailsettings_template";
    connection.query(queryString, function(err, rows) {
        if(err){
            console.log("Error in MySql : "+err)
        }
        else {
            res.json(rows);
        }
    });
});
app.post("/api/getEmailTempById", function(req,res) {
	var eid = req.body.eid;
	connection.query("SELECT * from tbl_emailsettings_template WHERE id ="+eid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});
app.post("/api/delEmailTemp", function(req,res) {
	connection.query("DELETE FROM tbl_emailsettings_template WHERE id = ?", req.body.tid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
        else{			
			 var queryString = "SELECT * FROM tbl_emailsettings_template";		    
		    connection.query(queryString,function(err1,rows1){
		        if(err1){
			        console.log(err1);
		        }
		        else {
			        res.json(rows1);
		        }
            });
		}				
	});
});
app.get("/api/getprofile_preferences", ensureAuthorized, function(req,res) {
var queryString = "SELECT * FROM tbl_profile_preferences WHERE user_id ="+req.user_id;
	connection.query(queryString, function(err, rows) {
		if(err){
			console.log("Error in MySql : "+err)
		}
		else {
			res.json(rows);
		}
	});
});
app.post('/api/profile_preferences', ensureAuthorized, function(req, res) {
	var data = {user_id:req.user_id, after_replying_to_tkt:req.body.after_replying};
	connection.query("Select * From tbl_profile_preferences Where user_id =?", req.user_id, function(err, rows){
		if(err) {
			console.log("Error in MySql :: "+err);
		}
		else {			
			if(rows.length == 0) {                
				connection.query("INSERT INTO tbl_profile_preferences SET ?", data, function(err1, rows1) {
					if(err1) {
						console.log("Error1 in MySql :: "+err1);
					}
					else {
						res.json(rows1);
					}
				});
			}
			else{
                var sql = "UPDATE tbl_profile_preferences SET ? WHERE user_id = ?"
				connection.query(sql, [data, req.user_id], function(err2, rows2) { 				
					if(err2) {
						console.log("Error1 in MySql :: "+err2);
					}
					else {
						res.json(rows2);
					}
				});
			}
		}
	});
});
app.get("/api/geprofile_notifications", ensureAuthorized, function(req,res) {
var queryString = "SELECT * FROM tbl_profile_notifications WHERE user_id ="+req.user_id;
	connection.query(queryString, function(err, rows) {
		if(err){
			console.log("Error in MySql : "+err)
		}
		else {
			res.json(rows);
		}
	});
});
app.post('/api/profile_notifications', ensureAuthorized, function(req, res) {
    var data = {user_id:req.user_id, new_tkt_assigned_to_admin:req.body.assigned_to};
	connection.query("Select * From tbl_profile_notifications Where user_id =?", req.user_id, function(err, rows){
		if(err) {
			console.log("Error in MySql :: "+err);
		}
		else {			
			if(rows.length == 0) {
				connection.query("INSERT INTO tbl_profile_notifications SET ?", data, function(err1, rows1) {
					if(err1) {
						console.log("Error1 in MySql :: "+err1);
					}
					else {
						res.json(rows1);
					}
				});
			}
			else{
                var sql = "UPDATE tbl_profile_notifications SET ? WHERE user_id = ?"
				connection.query(sql, [data, req.user_id], function(err2, rows2) {
					if(err2) {
						console.log("Error1 in MySql :: "+err2);
					}
					else {
						res.json(rows2);
					}
				});
			}
		}
	});
});
app.post("/api/saveSLApolicy", function(req,res) {			
	var data = {name: req.body.nm, grace_period:req.body.grace_prd, status: req.body.status, ticket_overdue_alerts: req.body.overdue_alerts, notes: req.body.notes};
	connection.query("INSERT INTO tbl_sla_policies SET ?", data, function(err1, rows1) {
		if(err1) {
			console.log("error in MySql :: "+err1);
		}
		else{
			res.json(rows1);
		}		
	});	
});
app.get("/api/getSLApolicies", function(req,res) {
var queryString = "SELECT id, name, grace_period, status, ticket_overdue_alerts, notes FROM tbl_sla_policies";
    connection.query(queryString, function(err, rows) {
        if(err){
            console.log("Error in MySql : "+err)
        }
        else {
            res.json(rows);
        }
    });
});
app.post("/api/getSLApoliciesById", function(req,res) {
	var sid = req.body.sid;
	connection.query("SELECT * from tbl_sla_policies WHERE id ="+sid, function(err, rows) {
		if(err) {
			console.log("Error in MySql : "+err);
		}
		else {
			res.json(rows);
		}
	});
});
app.post("/api/updateSLAPolicy", function(req,res) {			
	var data = {name: req.body.nm, grace_period:req.body.grace_prd, status: req.body.status, ticket_overdue_alerts: req.body.overdue_alerts, notes: req.body.notes};
    var sql = "UPDATE tbl_sla_policies SET ? WHERE id = ?";
	connection.query(sql, [data, req.body.sid], function(err1, rows1){
		if(err1) {
			console.log("error in MySql :: "+err1);
		}
		else{
			res.json(rows1);
		}		
	});	
});
app.post("/api/delSLAPolicy", function(req,res) {
	connection.query("DELETE FROM tbl_sla_policies WHERE id = ?", req.body.sid, function(err, rows){
		if(err) {
			console.log("Error in MySql : "+err);
		}
        else{			
			 var queryString = "SELECT * FROM tbl_sla_policies";		    
		    connection.query(queryString,function(err1,rows1){
		        if(err1){
			        console.log(err1);
		        }
		        else {
			        res.json(rows1);
		        }
            });
		}				
	});
});

/* ---- End ----- */



//const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

/*httpServer.listen(8090, () => {
	console.log('HTTP Server running on port 8090');
});*/

httpsServer.listen(8090, () => {
	console.log('HTTPS Server running on port 8090');
});



