
module.exports.getTragos = function(ids,callback) {
	
	var students = ids;
    var pending = ids.length;
     var seta=0;
		for (var x = 0; x < ids.length; x++) {
		//console.log(ids[x].category_id);
        connectPool.query('select * from blog_category where id='+ids[x].category_id, function(err, stu){
																						
            students[seta]['cat_name']=stu[0].name;
			seta++;
            if( 0 === --pending ) {
                callback(students); //callback if all queries are processed
            }
        });
    }

}