/**
 *  @desc [Server - Express server - handling frontend requests]
 * importing all the required modules using require method
 * cheerio - javascript(jQuery) module used for web-scraping in server-side implementation.
 * express - a nodejs framework , provides plugins , middleware packages , routing functionality
 */
const cheerio = require('cheerio');
const request = require('request-promise');
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true}))
app.use(express.json());

let item = [];
let urlInfo="";
/**
 * post request handling
 * 
 */
app.post('/api/url',(req,res)=>{
    urlInfo = req.body.urldata;
    main(res,urlInfo);
  });
  /**
   * get request
   */
 app.get('/api/results',(req,res)=>{
    main(res,urlInfo);
  });
  /**
   * configure express server
   */
 var server = app.listen(8081, function () {
	var host = "localhost"
	var port = server.address().port
	console.log("Example app listening at http://%s:%s/api/result", host, port)
})

/**
 * load the url which need to be scraped
 * sending the response back to the client
 * @param {*} res 
 * @param {*} urlPath 
 */

async function main(res,urlPath){
   pathURL = "https://en.wikipedia.org/wiki/Women%27s_high_jump_world_record_progression";
  if (urlPath) pathURL = urlPath;  
 // console.log(pathURL);
  try{
  const result = await request.get(pathURL);
   const check = cheerio.load(result);
     item = processHTMLTable(check,['br']);
    if (item){
    let temp=[];
    for (let it of item )
      it && temp.push(it);
    res.json({item: temp ?? temp})
   }
/**
 * scrape logic 
 * @param {*} cheerio_table_object 
 * @param {*} remove_tags 
 * @returns 
 */
  function processHTMLTable(cheerio_table_object, remove_tags=[] ){
    let columns = [];
    let items = [];
    
    // preprocessing, eg. remove tags
     if (remove_tags.length){
      remove_tags.forEach(tag => { 
       cheerio_table_object(tag).replaceWith('');									
      });
    } 
    // finding first table , tr and th in the webpage
      cheerio_table_object('table').first().find('tr th').each((index, el) => { 
      cheerio_table_object('\n').replaceWith('');
      //find all '\n' matches rather than stopping after the first match 'g'
      columns.push(cheerio_table_object(el).text().replace(/\n/g, '')); 
    });
    // processing table rows
    cheerio_table_object('table').first().find('tr').each((tr_index, tr) => {
      let item = {}; 
     //  console.log('tr: ', cheerio.load(tr).html() );
      cheerio_table_object('td:not([colspan])', tr ).each((index, td) => { 
      item[columns[index]] = cheerio.load(td).text().replace(/\n/g, ''); 
      }); 
      // adding item into the items object	
      
      if (Object.entries(item).length !== 0 && Object.entries(item) != null ) {
       
        if (tr_index<=0) 
        return res.send({"failed": "No data found"}) 
        if (item!=null)
          items[tr_index] = item;
      }
    });
  // console.log(items);
   
    return items;
  }
}catch(err){
  if (err.statusCode==404){
    res.send({errorCode:"404 Not found"})
 // console.log(err.statusCode);
}
}
 
  }