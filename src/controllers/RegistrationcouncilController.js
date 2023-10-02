const { validationResult } = require("express-validator");
const validator = require('./helpers/validate');
var multer = require('multer');
var fs = require('fs');



exports.view_registration_council = (req, res, next) => {
	connectPool.query(
            'select * from registration_council order by id DESC', (error, results, fields) => {
			if (error) {
				return res.render('view_registration_council', {
					title: 'Manage Registration Council',
					error:error,
					data: []
				});
			}
			res.render("view_registration_council", {
				title: 'Manage Registration Council',
				data: results,
				success:req.flash('success'),
				error:req.flash('error'),
			});
   });
};

exports.add_registration_council = (req, res, next) => {
    res.render("add_registration_council", {
        title: 'Registration Council',
		success:req.flash('success'),
		error:req.flash('error'),
    });
};
 

exports.do_add_registration_council = (req, res, next) => {
								 
			const validationRule = {
				"name": "required",
			}
			validator(req.body, validationRule, {}, (err, status) => {
				if(status)
				{
					var name=req.body.name;
					
					
					var insQry = "INSERT INTO registration_council SET name = '" + name + "'";
				
					connectPool.query(insQry, (error, results, fields) => {
					if (error) {
						req.flash('error', error);
						return res.redirect('/view_registration_council');
						
					}
					id = results.insertId;
					req.flash('success', 'Registration Council has been saved successfully!')
					return res.redirect('/view_registration_council');
				});
				}else{
					//console.log(err.errors.email);
					res.render('add_registration_council', {
							err: err,
							title: 'Registration Council',
							name:req.body.name,
						});
				}
			});
		 
}

exports.edit_registration_council = (req, res) => {
		var id = req.params.id;
	let sql = 'SELECT * FROM registration_council WHERE id = ' + id + ' LIMIT 1';
        connectPool.query(sql, (error, results, fields) => {
            if (error) {
				req.flash('error', error);
				return res.redirect('/view_registration_council');
            }
            return res.render('edit_registration_council', {
                    title: 'Edit Registration Council',
                    data: results,
					success:req.flash('success'),
					error:req.flash('error'),
                });
        });
};

exports.delete_registration_council = (req, res) => {
	 const id = req.params.id;

	let sql = 'SELECT * FROM registration_council WHERE id = ' + id + ' LIMIT 1';
        connectPool.query(sql, (error, results, fields) => {
            if (error) {
				req.flash('error', error);
				return res.redirect('/view_registration_council');
            }
			if (results.length > 0) {
				connectPool.query(
					'DELETE FROM registration_council WHERE id = "' + id + '" ', (errors, result, fields) => {
						if (errors) {
							return res.render('view_registration_council', {
								title: 'Manage Registration Council',
								error: errors
							});
						}
						
						req.flash('success', 'Registration Council Delete Successfully!')
						return res.redirect('/view_registration_council');
					}
				);
			}
            
        });
};
exports.do_edit_registration_council = (req, res) => {
		const validationRule = {
			"name": "required",
		}
		validator(req.body, validationRule, {}, (err, status) => {
		if(status)
		{
			let sql = 'SELECT * FROM registration_council WHERE id = ' + req.body.id + ' LIMIT 1';
        connectPool.query(sql, (errors, result, fields) => {
            if (errors) {
				req.flash('error', error);
				return res.redirect('/view_registration_council');
            }
			if (result.length > 0) {
				
				var fieldsToUpdate={};
				fieldsToUpdate['name']=req.body.name;
				
					var sqlupdate = 'UPDATE registration_council SET ? WHERE id  = ' + req.body.id;
					connectPool.query(sqlupdate, fieldsToUpdate, function(error, results){
						if (error) {
						   req.flash('error', error);
							return res.redirect('/edit_registration_council/' + req.body.id);
						}
						req.flash('success', 'Registration Council has been updated successfully!')
						return res.redirect('/view_registration_council');
					});
			}else{
				return res.redirect('/view_registration_council');	
			}
		  });
		}else{
			let sql = 'SELECT * FROM registration_council WHERE id = ' + req.body.id + ' LIMIT 1';
			connectPool.query(sql, (error, results, fields) => {
				if (error) {
					req.flash('error', error);
					return res.redirect('/view_registration_council');
				}
				return res.render('edit_registration_council', {
						title: 'Edit Registration Council',
						data: results,
						success:req.flash('success'),
						error:req.flash('error'),
						err: err,
					});
			});	
		}
		});	
	
};