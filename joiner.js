const fs 		= require('fs');
const csv		= require('csvtojson');
const _			= require('lodash');
const async		= require('async');
const request	= require('request');
const json2csv	= require('json2csv');

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

fs.readFile('public/raw.json', 'utf8', (err, res) => {
	if (err) {
		console.log(err);
	} else {
		let raw		= JSON.parse(res);
		let mapped	= _.chain(raw).keyBy((o) => (o.url.substring(_.lastIndexOf(o.url, '/') + 1, _.lastIndexOf(o.url, '.')))).mapValues('tags').value();

		let data	= [];

		// console.log(mapped);

		csv().fromFile('public/appended.csv')
			.on('json', (row) => {
				if (row.image_url) { data.push(_.assign({}, row, { tags: mapped[row.image_url.substring(_.lastIndexOf(row.image_url, '/') + 1, _.lastIndexOf(row.image_url, '.'))] })) }
				// console.log(row.image_url);
				// if (row.image_url) { console.log(); }
			}).on('done', (err) => {
				let out		= json2csv({ data, field: _.chain(data).first().keys().value() });
				fs.writeFile("public/another.csv", out, (err) => { if(err) { return console.log(err); }});
			});
	}
});
