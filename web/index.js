var express = require('express');
var fs = require("fs");
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var watson = require('watson-developer-cloud');

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static('public'));

app.get('/create', function () {
  var visual_recognition = watson.visual_recognition({
    api_key: '68950fee91477ebb122a9368ea0bdad8c85ae6cc',
    version: 'v3',
    version_date: '2016-05-19'
  });

  var params = {
    name: 'iotperson',
    negative_examples: fs.createReadStream('./public/files/other.zip'),
    dadak_positive_examples: fs.createReadStream('./public/files/dadak.zip'),
    mom_positive_examples: fs.createReadStream('./public/files/mom.zip'),
    dad_positive_examples: fs.createReadStream('./public/files/dad.zip')
  };

  visual_recognition.createClassifier(params,
    function (err, response) {
      if (err)
      		console.log(err);
    	 else
        console.log(JSON.stringify(response, null, 2));
    });
});

app.post('/img', function (req, res) {
  fs.writeFile("public/files/out.png", req.body.imgdata, 'base64', function (err) {
    console.log(err);

    var visual_recognition = watson.visual_recognition({
      api_key: '68950fee91477ebb122a9368ea0bdad8c85ae6cc',
      version: 'v3',
      version_date: '2016-05-20'
    });

    var params = {
      images_file: fs.createReadStream('./public/files/out.png'),
      parameters: fs.createReadStream('./public/myparams.json')
    };

    visual_recognition.getClassifier({
      classifier_id: 'iotperson_159878916'
    },
      function (err, response) {
        if (err)
          console.log(err);
        else
          console.log(JSON.stringify(response, null, 2));
      }
    );

    visual_recognition.classify(params, function (err, res) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(res, null, 2));
        var user = Math.random() > 0.5 ? "mom" : "dad";
        io.sockets.emit('redirect_to', user);
    });
  });
})

io.on('connection', function (socket) {
  console.log('connected ' + socket.id);
});

server.listen(8085, function () {

  console.log("listening");

})