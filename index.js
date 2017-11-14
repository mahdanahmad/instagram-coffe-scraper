const fs 		= require('fs');
const csv		= require('csvtojson');
const _			= require('lodash');
const async		= require('async');
const request	= require('request');

const caffeURL	= "http://demo.caffe.berkeleyvision.org/classify_url?imageurl=";

function getImageURL(url, callback) {
	request({ url }, (err, res, body) => {
		if (body) {
			let tagIdx	= body.indexOf('<meta property="og:image"');
			if (tagIdx > 0) {
				let full		= body.substring(tagIdx, body.indexOf('/>', tagIdx) + 2);
				let startRes	= full.indexOf('content="') + 9;
				callback(null, full.substring(startRes, full.indexOf('"', startRes)));
			} else {
				callback('Tag no found. :(');
			}
		} else {
			callback('No Body found!');
		}
	});
}

function getCaffeTag(url, callback) {
	request( caffeURL + url, (err, res, body) => {
		if (body) {
			let divIdx	= body.indexOf('<div class="tab-pane fade in active" id="infopred">') + 52;
			if (divIdx > 0) {
				let div	= body.substring(divIdx, body.indexOf("</div>", divIdx));

				callback(null, (div.match(/<a(.*?)<\/a>/g) || []).map((o) => (o.substring(o.indexOf('>') + 1, o.indexOf('</a>')))));
			} else {
				callback("Me no found div. :(");
			}
		} else {
			callback("no Body found!");
		}
	});
}

let URLs	= [];
let images	= [];
let tags	= [];
csv().fromFile('public/data.csv')
	.on('json', (data) => {
		if (data.URL) { URLs.push(data.URL); }
	}).on('done', (err) => {
		async.eachLimit(URLs, 1, (url, callback) => {
			getImageURL(url, (err, result) => {
				if (result) {
					// console.log(result);
					getCaffeTag(result, (err, res) => { if (_.isArray(res) && !_.isEmpty(res)) { images.push({ url: result, tags: res }); tags = _.concat(tags, res); callback(); } else { callback(); }});
				} else {
					callback();
				}
			});
		}, (err) => {
			// console.log(_.compact(tags).join(' '));
			fs.writeFile("public/raw.json", JSON.stringify(images), (err) => { if(err) { return console.log(err); }});
			fs.writeFile("public/list_coffe_result.csv", _.compact(tags).join(' '), (err) => { if(err) { return console.log(err); }});
		});
	});
