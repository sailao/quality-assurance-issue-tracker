/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 201);
          assert.equal(res.body.code, 201);
          assert.equal(res.body.status, 'success');
          assert.equal(res.body.message, 'created');
          assert.property(res.body.data, '_id');
          assert.property(res.body.data, 'issue_title');
          assert.property(res.body.data, 'issue_text');
          assert.property(res.body.data, 'created_by');
          assert.property(res.body.data, 'assigned_to');
          assert.property(res.body.data, 'status_text');
          assert.property(res.body.data, 'open');
          assert.property(res.body.data, 'created_on');
          assert.property(res.body.data, 'updated_on');
          done()
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 201);
          assert.equal(res.body.code, 201);
          assert.equal(res.body.status, 'success');
          assert.equal(res.body.message, 'created');
          assert.property(res.body.data, '_id');
          assert.property(res.body.data, 'issue_title');
          assert.property(res.body.data, 'issue_text');
          assert.property(res.body.data, 'created_by');
          assert.property(res.body.data, 'open');
          assert.property(res.body.data, 'created_on');
          assert.property(res.body.data, 'updated_on');
          done();
        });
      });

      let cases = [
        {
          case: 'Missing required fields for Title',
          data: { issue_text: 'text', created_by: 'Functional Test - Every field filled in'}
        },
        {
          case: 'Missing required fields for issueText',
          data: { issue_title: 'Title', created_by: 'Functional Test - Every field filled in' }
        },
        {
          case: 'Missing required fields for createdBy',
          data: { issue_title: 'Title', issue_text: 'text' }
        }
      ];

      cases.map(testCase => {
        test(testCase.case, function(done) {
          chai.request(server)
          .post('/api/issues/test')
          .send(testCase.data)
          .end(function(err, res){
            assert.equal(res.status, 400);
            assert.equal(res.body.message, 'invalid params')
            done();
          });
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/5e63c3a5e4232e4cd0274ac2')
        .end((err, res)=> {
          assert.equal(res.status, 400);
          assert.equal(res.body.message, 'invalid params')
          done()
        })
      });
      
      test('One field to update', async() =>{
        let createIssue = await chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        });

        const id = createIssue.body.data._id;
        let updateData = { _id: id, issue_title: 'Update Title'}
        
        let updateIssue = await chai.request(server)
        .put('/api/issues/5e63c3a5e4232e4cd0274ac2')
        .send(updateData);

        assert.equal(updateIssue.status, 200);
        assert.equal(updateIssue.body.code, 200);
        assert.equal(updateIssue.body.status, 'success');
        assert.equal(updateIssue.body.data._id, id);
        assert.equal(updateIssue.body.data.issue_title, updateData.issue_title);
      });
      
      test('Multiple fields to update', async() => {
        let createIssue = await chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        });

        const id = createIssue.body.data._id;
        let updateData = { _id: id, issue_title: 'Update Title', issue_text: 'update Issue Text'}
        
        let updateIssue = await chai.request(server)
        .put('/api/issues/5e63c3a5e4232e4cd0274ac2')
        .send(updateData);

        assert.equal(updateIssue.status, 200);
        assert.equal(updateIssue.body.code, 200);
        assert.equal(updateIssue.body.status, 'success');
        assert.equal(updateIssue.body.data._id, id);
        assert.equal(updateIssue.body.data.issue_title, updateData.issue_title);
        assert.equal(updateIssue.body.data.issue_text, updateData.issue_text);
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', async() =>{
        let createIssue = await chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        });

        let filterIssue = await chai.request(server)
        .get('/api/issues/5e63c3a5e4232e4cd0274ac2')
        .query({open: createIssue.body.data.open})

        assert.equal(filterIssue.body[0].open, createIssue.body.data.open);
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', async() => {
        let createIssue = await chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Multi Filter',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        });

        let filterIssue = await chai.request(server)
        .get('/api/issues/5e63c3a5e4232e4cd0274ac2')
        .query({open: createIssue.body.data.open, issue_title: createIssue.body.data.issue_title})

        assert.equal(filterIssue.body[0].open, createIssue.body.data.open);
        assert.equal(filterIssue.body[0].issue_title, createIssue.body.data.issue_title);
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', () =>{
      test('No _id', done => {
        chai.request(server)
        .delete('/api/issues/test')
        .end((err, res)=>{
          assert.equal(res.body.code, 400)
          assert.equal(res.body.status, 'fails')
          assert.equal(res.body.message, 'invalid id')
          assert.equal(res.body.failed, `could not delete undefined`)
          done()
        })
      });
      
      test('Valid _id', async() => {
        let createIssue = await chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        });

        const id = createIssue.body.data._id;

        let deleteIssue = await chai.request(server)
        .delete('/api/issues/test')
        .send({_id: id});

        assert.equal(deleteIssue.body.code, 200)
        assert.equal(deleteIssue.body.status, 'success')
        assert.equal(deleteIssue.body.success, `deleted ${id}`)
      });
    });
});
