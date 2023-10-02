const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
var multer = require('multer');
var fs = require('fs');

exports.view_section1 = (req, res, next) => {
	connectPool.query(
            'select * from section1 order by id DESC', (error, results, fields) => {
			if (error) {
				return res.render('view_section1', {
					title: 'Manage Section1',
					error:error,
					data: []
				});
			}
			res.render("view_section1", {
				title: 'Section1',
				data: results,
				success:req.flash('success'),
				error:req.flash('error'),
			});
   });
};

exports.add_section1 = (req, res, next) => {
    res.render("add_section1", {
        title: 'Section1',
		success:req.flash('success'),
		error:req.flash('error'),
    });
};


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/upload/section1');
  },
  filename: function (req, file, callback) {               
      let extArray = file.originalname.split(".");
      let extension = extArray[extArray.length - 1];        
      callback(null, file.fieldname + '-' + Date.now()+'.'+extension);
  }
});  
var upload = multer({ storage : storage}).single('image'); 

exports.do_add_section1 = (req, res, next) => {
	 upload(req,res,function(err){
							 
		if (req.file) {
								 
			const validationRule = {
				"name": "required",
				"description": "required",
			}
			validator(req.body, validationRule, {}, (err, status) => {
				if(status)
				{
					var name=req.body.name;
					var description=req.body.description;
					var prof_pic=req.file.filename;
					
					var insQry = "INSERT INTO section1 SET name = '" + name + "',description = '" + description + "', image = '" + prof_pic + "'";
				
					connectPool.query(insQry, (error, results, fields) => {
					if (error) {
						req.flash('error', error);
						return res.redirect('/view_section1');
						
					}
					id = results.insertId;
					req.flash('success', 'Section1 has been saved successfully!')
					return res.redirect('/view_section1');
				});
				}else{
					//console.log(err.errors.email);
					res.render('add_section1', {
							err: err,
							title: 'Section1',
							name:req.body.name,
							description:req.body.description,
						});
				}
			});
		 }else{
			res.render('add_section1', {
					err: err,
					title: 'Section1',
					name:req.body.name,
					description:req.body.description,
					imageval:'image field required'
				}); 
		 }
		});
}

exports.edit_section1 = (req, res) => {
		var id = req.params.id;
	let sql = 'SELECT * FROM section1 WHERE id = ' + id + ' LIMIT 1';
        connectPool.query(sql, (error, results, fields) => {
            if (error) {
                req.flash('error', error);
				return res.redirect('/view_section1');
            }
            return res.render('edit_section1', {
                    title: 'Edit Section1',
                    data: results,
					success:req.flash('success'),
					error:req.flash('error'),
                });
        });
};

exports.delete_section1 = (req, res) => {
	 const id = req.params.id;

	let sql = 'SELECT * FROM section1 WHERE id = ' + id + ' LIMIT 1';
        connectPool.query(sql, (error, results, fields) => {
            if (error) {
                req.flash('error', error);
				return res.redirect('/view_section1');
            }
			if (results.length > 0) {
				connectPool.query(
					'DELETE FROM section1 WHERE id = "' + id + '" ', (errors, result, fields) => {
						if (errors) {
							return res.render('view_section1', {
								title: 'Manage Section1',
								error: errors
							});
						}
						var imagePath = 'public/upload/section1/'+results[0].image;
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
						req.flash('success', 'Section1 Delete Successfully!')
						return res.redirect('/view_section1');
					}
				);
			}
            
        });
};
exports.do_edit_section1 = (req, res) => {
	upload(req,res,function(err){
	if (req.file) 
	{
		const validationRule = {
			"name": "required",
			"description": "required",
		}
		validator(req.body, validationRule, {}, (err, status) => {
		if(status)
		{
			let sql = 'SELECT * FROM section1 WHERE id = ' + req.body.id + ' LIMIT 1';
        connectPool.query(sql, (errors, result, fields) => {
            if (errors) {
                req.flash('error', errors);
				return res.redirect('/view_section1');
            }
			if (result.length > 0) {
				var imagePath = 'public/upload/section1/'+result[0].image;
				if (fs.existsSync(imagePath)) {
					fs.unlinkSync(imagePath);
				}
				var fieldsToUpdate={};
				fieldsToUpdate['name']=req.body.name;
				fieldsToUpdate['description']=req.body.description;
				fieldsToUpdate['image']=req.file.filename;
					var sqlupdate = 'UPDATE section1 SET ? WHERE id  = ' + req.body.id;
					connectPool.query(sqlupdate, fieldsToUpdate, function(error, results){
						if (error) {
						   req.flash('error', error);
							return res.redirect('/edit_section1/' + req.body.id);
						}
						req.flash('success', 'Section1 has been updated successfully!')
						return res.redirect('/view_section1');
					});
			}else{
				return res.redirect('/view_section1');	
			}
		  });
		}else{
			let sql = 'SELECT * FROM section1 WHERE id = ' + req.body.id + ' LIMIT 1';
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					req.flash('error', error);
					return res.redirect('/view_section1');
				}
				return res.render('edit_section1', {
						title: 'Edit Section1',
						data: results,
						success:req.flash('success'),
						error:req.flash('error'),
						err: err,
					});
			});	
		}
		});	
	}else{
		const validationRule = {
			"name": "required",
			"description": "required",
		}
		validator(req.body, validationRule, {}, (err, status) => {
		if(status)
		{
			var fieldsToUpdate={};
			fieldsToUpdate['name']=req.body.name;
			fieldsToUpdate['description']=req.body.description;
				var sqlupdate = 'UPDATE section1 SET ? WHERE id  = ' + req.body.id;
				connectPool.query(sqlupdate, fieldsToUpdate, function(error, results){
					if (error) {
					   req.flash('error', error);
						return res.redirect('/edit_section1/' + req.body.id);
					}
					req.flash('success', 'Section1 has been updated successfully!')
					return res.redirect('/view_section1');
				});
		}else{
			let sql = 'SELECT * FROM section1 WHERE id = ' + req.body.id + ' LIMIT 1';
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					req.flash('error', error);
					return res.redirect('/view_section1');
				}
				return res.render('edit_section1', {
						title: 'Edit Section1',
						data: results,
						success:req.flash('success'),
						error:req.flash('error'),
						err: err,
					});
			});	
		}
	  });
    }
  });
};