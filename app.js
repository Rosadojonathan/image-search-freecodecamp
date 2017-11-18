const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const Bing = require('node-bing-api')({accKey: 'b6eb4729acae4927b798e2a8cb41a90f'});
const Search = require('bing.search') //*****
const port = process.env.PORT || 3000;
const searchTerm = require('./models/searchTerm');
app.use(bodyParser.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');

var search = new Search('b6eb4729acae4927b798e2a8cb41a90f')


app.get('/api/latest', (req,res,next)=>{
	searchTerm.find({},(err,data)=>{
		res.json(data);
	})
})
app.get('/api/imagesearch/:searchVal*', (req,res, next)=>{
	let { searchVal } = req.params;
	let { offset } = req.query;

var data = new searchTerm({
	searchVal,
	searchDate: new Date()
});

data.save(err =>{
	if(err){
		return res.send(err);
	}
});

var searchOffset;

if(offset){
	if(offset === 1){
		offset=0;
		searchOffset = 1;
	}
	else if(offset > 1){
		searchOffset = offset +1;
	}
}


search.images(searchVal, {top:offset},(error,results)=>{
	if(error){
		res.status(500).json(error);
	} else{
		res.status(200).json(results.map(createResults))
	}



});
});
function createResults(image) {
  return {
    url: image.url,
    title: image.title,
    thumbnail: image.thumbnail.url,
    source: image.sourceUrl,
    type: image.type
  }
}


app.listen(port, ()=>{
	console.log(`server running on port : ${port}`);
})
