/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      let searchParam = {...req.query} || undefined;
      if('open' in searchParam){
        let open = searchParam.open == 'true' ? true : false;
        searchParam.open = {$eq: open}
      }

      MongoClient.connect(CONNECTION_STRING,{ useUnifiedTopology: true }, (err, db)=>{
        if (err) throw err;
        var dbo = db.db("issueTrackers");
        dbo.collection('issueTrackers').find(searchParam).toArray ((err, result)=>{
          if (err) throw err;
          res.json(result)
          db.close();
        })
      })

    })
    
    .post(function (req, res){
      var project = req.params.project;
      
      let {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
      let created_on = new Date();
      let updated_on = new Date();
      let open = Math.random() >= 0.5;
      let data = {...req.body, open, created_on, updated_on }

      if(!issue_title || !issue_text || !created_by){
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'invalid params'
        });
      }
      MongoClient.connect(CONNECTION_STRING,{ useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        var dbo = db.db("issueTrackers");
        dbo.collection("issueTrackers").insertOne(data, (err, result)=> {
          if (err) throw err;
          res.status(201).json({
            code: 201,
            status: 'success',
            message: 'created',
            data: result.ops[0]
          });
          db.close();
        });
      });
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
      let {_id, ...data} = req.body;

      if(!data || !_id){
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'invalid params',
        });
      }

      MongoClient.connect(CONNECTION_STRING,{ useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        var dbo = db.db("issueTrackers");
        dbo.collection("issueTrackers").findOneAndUpdate(
          {_id: ObjectId(_id)}, 
          {$set: data}, 
          { returnOriginal: false , $upsert: true},
          (err, result)=> {
          if (err) throw err;
          res.status(200).json({
            code: 200,
            status: 'success',
            message: 'updated',
            data: result.value
          });
          db.close();
        });
      });
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var id = req.body._id;
      let isValid = ObjectId.isValid(id);
      if(! isValid){
        return res.json({
          code: 400,
          status: 'fails',
          message: 'invalid id',
          failed: `could not delete ${id}`
        })
      }
      MongoClient.connect(CONNECTION_STRING,{ useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        var dbo = db.db("issueTrackers");
        dbo.collection("issueTrackers").deleteOne({_id: ObjectId(id)}, (err, result)=> {
          if (err) throw err;
          res.json({
            code: 200,
            status: 'success',
            message: 'deleted',
            success: `deleted ${id}`
          })
          db.close();
        });
      });
      
    });
    
};
