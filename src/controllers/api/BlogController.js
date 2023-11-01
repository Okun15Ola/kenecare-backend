const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
var fs = require('fs');

exports.blog = (req, res,next) => {
  
     const { body } = req;
	
				connectPool.query('select b.*,bc.name as ctname from blog b LEFT JOIN blog_category bc ON b.category_id = bc.id where b.status=1', (error, results, fields) => 				{
					if (results.length > 0) {
						if (error) {
							return res.status(200).json({
								status:0,
								message: error
							});
						}
					var data=[];
					 var i=0;
						for(var x = 0; x < results.length; x++) {
							arr={};
							arr['id']=results[x].id;
							arr['category_name']=results[x].ctname;
							arr['name']=results[x].name;
							let description = results[x].description;
							arr['description']=description;
							
							var temp=results[x].tags.split(',');
							var ars=[];
							for(var i=0;i<temp.length;i++)
							{
								let aa={};
								aa['val']=temp[i];
								ars.push(aa);	
							}
							arr['tags']=ars;
							arr['image']=BASE_URL+'public/upload/blog/'+results[x].image;
							data.push(arr);
							i++;
						}
						return res.status(200).json({
							status:1,
							message: "Data found!",
							data:data
						});
					}else{
						return res.status(200).json({
							status:0,
							message: 'Data not found!'
						});	
					}
			  });
 
};

exports.blog_detail = (req, res,next) => {
  
     const { body } = req;
	 
		const validationRule = {
		"id": "required",
    }
    validator(req.body, validationRule, {}, (err, status) => {
		if(status)
		{			
				var id=body.id;
				connectPool.query('select b.*,bc.name as ctname, DATE_FORMAT(b.created_at, "%d %M, %Y") as created_at from blog b LEFT JOIN blog_category bc ON b.category_id = bc.id where b.id ='+id, (error, results, fields) => 				{
					if (results.length > 0) {
						if (error) {
							return res.status(200).json({
								status:0,
								message: error
							});
						}
						var data={};
						data['id'] = results[0].id;
						data['category_name'] = results[0].ctname;
						data['name'] = results[0].name;
						data['description'] = results[0].description;
						data['tags'] = results[0].tags;
						data['image'] = BASE_URL+'public/upload/blog/'+results[0].image;
						data['created_at'] = results[0].created_at;
						return res.status(200).json({
							status:1,
							message: "Data found!",
							data:data
						});
					}else{
						return res.status(200).json({
							status:0,
							message: 'Data not found!'
						});	
					}
			  });
		}else{
			return res.status(200).json({
				status:0,
				message: 'All Field Required'
			});
		}
	});   
};