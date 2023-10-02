const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
var fs = require('fs');

exports.city = (req, res,next) => {
  
     const { body } = req;
	
				connectPool.query('select * from city where status=1', (error, results, fields) => 				{
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
							arr['name']=results[x].name;
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