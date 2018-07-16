var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
inspect = require('util').inspect;
var Busboy = require('busboy');

const BUCKET_NAME = 'parangat-test';
const IAM_USER_KEY = 'AKIAJMIZJ77RPEYLRHWQ';
const IAM_USER_SECRET = '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';


function uploadToS3(res, file) {
  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME,
  });
  s3bucket.createBucket(function () {
    var params = {
     Bucket: BUCKET_NAME,
     Key: file.name,
     Body: file.data,
     ContentType: file.mimetype,
     ACL: 'public-read'
    };
    s3bucket.upload(params, function (err, data) {
     if (err) {
      console.log('error in callback');
      console.log(err);
     }
     console.log('success');
     console.log(data);
     res.redirect('/uploaded');
    });
  });
 }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function(req, res, next) {

  var busboy = new Busboy({headers: req.headers});

   var uploadStartTime = new Date(),
      busboyFinishTime = null,
      s3UploadFinishTime = null;

   busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
       
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      var obj = {name : filename, data: file , mimetype: mimetype};
      uploadToS3(res, obj);
   });
   busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
   });
   busboy.on('finish', function() {
      console.log('Done parsing form!');
   });
   req.pipe(busboy);

  

});

router.get('/uploaded', function(req, res, next) {
  res.json({"mesaage": "uploaded"});
});

module.exports = router;
