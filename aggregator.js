const fs	= require('fs');
const _		= require('lodash');

fs.readFile('public/raw.json', 'utf8', (err, res) => {
	if (err) {
		console.log(err);
	} else {
		let data	= JSON.parse(res);
		let grouped	= _.chain(data).flatMap('tags').groupBy().map((o, key) => ({ word: key, len: o.length })).orderBy('len', 'desc').value();

		// fs.writeFile("public/aggregated.csv", grouped.map((o) => ([o.word, o.len].join(', '))).join('\n'), (err) => { if(err) { return console.log(err); }});
		// fs.writeFile("public/parsed.csv", _.flatMap(data, 'tags').join('\n'), (err) => { if(err) { return console.log(err); }});
	}
});
