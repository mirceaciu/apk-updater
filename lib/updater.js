'use strict';

var uuid = require('node-uuid'),
    winston = require('winston'),
    reader = require('./apkReader');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' })
  ]
});

const getHumanReadableDate = () => {
  const timestamp = Date.now();
  return new Date(timestamp).toLocaleString();
}

var HOUR = 3600000;

var androidUpdate = {}
  , expressApp
  , routePfx
  , links = [];

androidUpdate.updater = function (req, res){
  var name = req.body.pkgname,
     version = req.body.version,
     last = reader.last(name),
     key;
  if(last && last.version > version){
    key = name + "-" + version;
  	if(!links[key]){
  		links[key] = { 
  			url: routePfx + '/' + uuid.v4(),
  			timeoutId: setTimeout(function() {
  				var idx;
  				for(idx in expressApp._router.stack.get){
  					if(expressApp._router.stack.get[idx].path === links[key].url){
  					  expressApp._router.stack.get.splice(idx, 1);
  					  break;
  					}
  				}
  				links[key] = null;
  			}, 4 * HOUR)
  		};  		
  		expressApp.get(links[key].url, function(req, res){
  			res.download(last.filepath);
  		});
  		// hack to put this route at first
  		expressApp._router.stack.get.unshift(expressApp._router.stack.get.pop());
  	}
    logger.info(`${getHumanReadableDate()}: have update for version ${version} | ${links[key].url} | ${last.version}` );
    res.sendStatus("have update\n" + links[key].url + "\n" + last.version);
  } else {
    logger.debug(`${getHumanReadableDate()}: No update for ${name}-${version} / Last : ${last.version}` );
  	res.sendStatus(200);
  }
};


/**
 * Enable auto apk updater for provided Express application and route.
 * @param {@Object} app parent Express application
 * @param {@String} route route prefix for current updater
 * @param {@String} repoDir path for apk directory
 */
function enable(app, route, repoDir){
  expressApp = app;
  routePfx = route;
  if(repoDir){
    reader.setRepoDir(repoDir);
  }
  app.post(route, androidUpdate.updater);

  app.get(route, function (req, res){
    res.sendStatus(reader.available());
  });
};


/**
 * Module exports.
 */
module.exports = {
   'enable': enable
};
