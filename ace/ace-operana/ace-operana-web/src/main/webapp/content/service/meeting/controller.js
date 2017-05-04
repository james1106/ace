jQuery(function($) {
	$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
		_title : function(title) {
			var $title = this.options.title || '&nbsp;'
			if (("title_html" in this.options)
					&& this.options.title_html == true)
				title.html($title);
			else
				title.text($title);
		}
	}));
	$('#btn-search').on('click', function() {
		$('#fm-search').ajaxForm({
			beforeSubmit : function(formData, jqForm, options) {
				var params = {};
				$.each(formData, function(n, obj) {
					params[obj.name] = obj.value;
				});
				$.extend(params, {
					time : new Date()
				});
				// console.log(params);
				jQuery(cfg.grid_selector).jqGrid('setGridParam', {
					page : 1,
					postData : params
				}).trigger("reloadGrid");
				return false;
			}
		});
	});

	$('#btn-view-add').on(
			'click',
			function() {
				jQuery(cfg.grid_selector).jqGrid(
						'editGridRow',
						'new',
						{
							closeAfterAdd : true,
							recreateForm : true,
							viewPagerButtons : false,
							beforeShowForm : function(e) {
								var form = $(e[0]);
								form.closest('.ui-jqdialog').find(
										'.ui-jqdialog-titlebar').wrapInner(
										'<div class="widget-header" />')
								style_edit_form(form);
							}
						})
			});
	$('#btn-view-edit').on(
			'click',
			function() {
				var gr = jQuery(cfg.grid_selector).jqGrid('getGridParam',
						'selrow');
				if (!gr) {
					$.jgrid.info_dialog($.jgrid.nav.alertcap,
							$.jgrid.nav.alerttext)
				}
				jQuery(cfg.grid_selector).jqGrid(
						'editGridRow',
						gr,
						{
							closeAfterAdd : true,
							recreateForm : true,
							viewPagerButtons : true,
							beforeShowForm : function(e) {
								var form = $(e[0]);
								form.closest('.ui-jqdialog').find(
										'.ui-jqdialog-titlebar').wrapInner(
										'<div class="widget-header" />')
								style_edit_form(form);
							}
						})
			});
	$('#btn-view-del').on(
			'click',
			function() {

				var gr = jQuery(cfg.grid_selector).jqGrid('getGridParam',
						'selrow');
				if (!gr) {
					$.jgrid.info_dialog($.jgrid.nav.alertcap,
							$.jgrid.nav.alerttext);
					return;
				}
				var r=jQuery(cfg.grid_selector).jqGrid('getRowData',gr);
				delMeetingById(r.name,r.id);
			});
});

function preview(id, title) {
	var dialog = $("#dialog-message-view")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});
	loadView(id);
	viewTopic(id);
	viewUser(id);
}
function loadView(id) {
	$.ajax({
		type : "post",
		url : cfg.view_load_data_url,
		data : {
			id : id
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			$.each(rst.value, function(key, value) {
				if (key == 'category') {
					value = rsd(value, '83');
				}
				if (key == 'status') {
					value = value == "1" ? "on" : "off";
				}
				if (key.indexOf('Date') != -1 || key.indexOf('time') != -1
						|| key.indexOf('Time') != -1
						|| key.indexOf('birthday') != -1) {
					value = value.substr(0, 16);
				}
				$("#dialog-message-view").find('#' + key).html(value);
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}

function clearQparams() {
	$('#cc1').combotree('setValue', '');
	jQuery(cfg.grid_selector).jqGrid('setGridParam', {
		page : 1,
		postData : {
			detpId : ''
		}
	}).trigger("reloadGrid");
}

function topicCfg(id, title) {
	var dialog = $("#dialog-message")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit",
									click : function() {
										$('#fm-topic-cfg').submit();

									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});
	selectAllTopic(id);
}

function selectAllTopic(id, name) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/selectAllTopic.do",
		data : {
			meetingId : id,
			name : name
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			var defaultValue = '';
			if (name) {
				defaultValue = name;
			}
			var html = [];
			html.push("<form id='fm-topic-cfg' onsubmit='return ckform()'>");
			html.push("<div style='text-align:right;padding-bottom:2px'>");
			html.push("搜索 <input type='text' id='_q' name='_q' value='"
					+ defaultValue + "' />");
			html.push("</div>");
			html.push("<div class='panel panel-default'>");
			html.push("<div class='panel-body'>");
			html.push("<input type='hidden' name='meetingId' value='" + id);
			html.push("'/>");

			html.push("<table class='table'>");
			//html.push("<tr><td style='text-align:right'>");
			//html.push("搜索 <input type='text' id='_q' name='_q' value='"+defaultValue+"' />");
			//html.push("</td></tr>");
			$.each(rst, function(i, o) {
				html.push("<tr><td>");
				html.push("<input type='");
				html.push("checkbox' id='");
				html.push(o.category.code);
				html.push("' class='xcheckgroup");
				html.push(o.category.code);
				html.push(" checkAllCurrent' /> ");
				html.push("<label style='");
				html.push("font-weight:800' for='");
				html.push(o.category.code);
				html.push("'>");
				html.push(o.category.name);
				html.push("</label>");
				html.push("</td></tr>");
				html.push("<tr><td>");
				$.each(o.items, function(j, e) {
					var checked = "";
					if (e.value) {
						checked = "checked";
					}
					html.push("<div class='checkboxitem'>");
					html
							.push("<input type='checkbox' name='" + e.id
									+ "' id='");
					html.push(e.id);
					html.push("' class='xcheckgroup");
					html.push(o.category.code);
					html.push(" checkItem' value='");
					html.push(e.id);
					html.push("' ");
					html.push(checked);
					html.push("/> <label for='");
					html.push(e.id);
					html.push("' >");
					html.push(e.name);
					html.push("</label>");
					html.push("</div>");
				});
				html.push("</td></tr>");
				$.XCheck({
					groupClass : ".xcheckgroup" + o.category.code,
					afterCheckItem : function() {
						var ops = this.options;
						console.log('当前的options为：' + JSON.stringify(ops));
						console.log("afterCheckItem");
					}
				});
			});
			html.push("</table>");
			html.push("</div></div></form>");
			$("#dialog-message").html(html.join(""));
			$('#_q').bind('keypress', function(event) {
				if (event.keyCode == "13") {
					//alert('你输入的内容为：' + $('#_q').val());
					selectAllTopic(id, $('#_q').val());
				}
			});
			$('#fm-topic-cfg').ajaxForm({
				beforeSubmit : function(formData, jqForm, options) {
					var params = {};
					$.each(formData, function(n, obj) {
						params[obj.name] = obj.value;
					});
					inertMeetingTopic(params.meetingId, params);
					return false;
				}
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}
function inertMeetingTopic(id, p) {
	var params = [];

	$.each(p, function(key, value) {
		if ((key != 'meetingId') && (key != '_q')) {
			params.push({
				meetingId : id,
				topicId : value
			});
		}
	});
	console.log(params);
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/insertMeetingTopic.do",
		data : {
			meetingId : id,
			name : p._q,
			jsons : JSON.stringify(params)
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			$("#btn-submit").removeAttr("disabled");
			alert(rst.errorMessage);
		},
		error : function() {
			$("#btn-submit").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}
function ckform() {
	return false;
}

function viewTopic(meetingId, name) {
	var tableId = "detail";
	if ($('#' + tableId).hasClass('dataTable')) {
		dttable = $('#' + tableId).dataTable();
		dttable.fnClearTable(); // 清空一下table
		dttable.fnDestroy(); // 还原初始化了的datatable
	}
	var table = $('#' + tableId).DataTable(
			{
				ajax : {
					url : contextPath
							+ '/meeting/selectTopicByMeetingId.do?meetingId='
							+ meetingId,
					dataSrc : 'data'
				},
				columns : [{
					data : 'rownum'
				}, {
					data : 'name'
				}, {
					data : 'owner'
				}, {
					data : 'id'
				}],
				bAutoWidth : false,
				"fnInitComplete" : function() {
					this.fnAdjustColumnSizing(true);
				},
				"createdRow" : function(row, data, dataIndex) {
					$(row).children('td').eq(0).attr('style',
							'text-align: center;font-weight:800');
					/*$(row).children('td').eq(0).html(
							'<input type="radio" name="_id" id="' + data.id
									+ '" value="' + data.id + '" />');*/
					$(row).children('td').eq(2).html(
							'<a href="javascript:cfgUser(\'' + data.id
									+ '\',\'' + data.name + '\',\'' + meetingId
									+ '\')"><span class="badge badge-info">'
									+ data.owner + '</span></a>');
					$(row).children('td').eq(3).html(
                    							'<a href="javascript:deleteByMeetingIdAndTopicId(\'' + data.id
                    									+ '\',\'' + data.name + '\',\'' + meetingId
                    									+ '\')"><span class="badge badge-danger">删除</span></a>');

				},
				"aLengthMenu" : [5, 10, 15, 20],
				"oLanguage" : {
					"sLengthMenu" : "每页显示 _MENU_ 条记录",
					"sZeroRecords" : "对不起，查询不到任何相关数据",
					"sInfo" : "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
					"sInfoEmpty" : "第 0 到 0 条记录，共 0 条",
					"sInfoFiltered" : "数据表中共为 _MAX_ 条记录)",
					"sProcessing" : "正在加载中...",
					"sSearch" : "搜索 ",
					"sUrl" : "",
					"oPaginate" : {
						"sFirst" : "",
						"sPrevious" : "",
						"sNext" : "",
						"sLast" : ""
					},
					"oAria" : {
						"sSortAscending" : ": 升序排列",
						"sSortDescending" : ": 降序排列"
					}
				}
			});

}

function cfgUser(id, title, meetingId) {
	var dialog = $("#dialog-user")
			.removeClass('hide')
			.dialog(
					{
						modal : true,
						width : 400,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit2",
									click : function() {
										updateTopicOwner(meetingId, id, $(
												'#_user').combogrid("getValue"));
										$(this).dialog("close");
									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});

	$('#_user').combogrid({
		panelWidth : 350,
		width : 375,
		idField : 'USER_ID',
		textField : 'NAME',
		url : portalPath + '/system/selectUsers.do',
		mode : 'remote',
		onSelect : function(row) {

		},
		columns : [[{
			field : 'USER_ID',
			title : '用户编号',
			width : 100
		}, {
			field : 'NAME',
			title : '姓名',
			width : 100
		}, {
			field : 'DEPARTMENT_NAME',
			title : '部门',
			width : 100
		}]]
	});
}
function updateTopicOwner(meetingId, topicId, userId) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/updateTopicOwner.do",
		data : {
			meetingId : meetingId,
			topicId : topicId,
			userId : userId
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit2").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			viewTopic(meetingId, null);
			$("#btn-submit2").removeAttr("disabled");

		},
		error : function() {
			$("#btn-submit2").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}
function deleteByMeetingIdAndTopicId(topicId, title, meetingId){
if(confirm("确定要删除"+title+"吗？")){
$.ajax({
		type : "post",
		url : contextPath + "/meeting/deleteByMeetingIdAndTopicId.do",
		data : {
			meetingId : meetingId,
			topicId : topicId
		},
		beforeSend : function(XMLHttpRequest) {

		},
		success : function(rst, textStatus) {
			viewTopic(meetingId, null);


		},
		error : function() {

			alert("加载错误！");
		}
	});
}

}

function attendanceCfg(id,title){
var dialog = $("#dialog-meeting-user")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit",
									click : function() {
										$('#fm-user-cfg').submit();

									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});
	selectAllUserDeptId(id);
}

function selectAllUserDeptId(id, name) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/selectAllUserDeptId.do",
		data : {
			meetingId : id,
			name : name
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			var defaultValue = '';
			if (name) {
				defaultValue = name;
			}
			var html = [];
			html.push("<form id='fm-user-cfg' onsubmit='return ckform()'>");
			html.push("<div style='text-align:right;padding-bottom:2px'>");
			html.push("搜索 <input type='text' id='_q1' name='_q1' value='"
					+ defaultValue + "' />");
			html.push("</div>");
			html.push("<div class='panel panel-default'>");
			html.push("<div class='panel-body'>");
			html.push("<input type='hidden' name='meetingId' value='" + id);
			html.push("'/>");
			html.push("<table class='table'>");
			$.each(rst, function(i, o) {
				html.push("<tr><td>");
				html.push("<input type='");
				html.push("checkbox' id='");
				html.push(o.category.code);
				html.push("' class='xcheckgroup");
				html.push(o.category.code);
				html.push(" checkAllCurrent' /> ");
				html.push("<label style='");
				html.push("font-weight:800' for='");
				html.push(o.category.code);
				html.push("'>");
				html.push(o.category.name);
				html.push("</label>");
				html.push("</td></tr>");
				html.push("<tr><td>");
				$.each(o.items, function(j, e) {
					var checked = "";
					if (e.value) {
						checked = "checked";
					}
					html.push("<div class='checkboxitem'>");
					html
							.push("<input type='checkbox' name='" + e.id
									+ "' id='");
					html.push(e.id);
					html.push("' class='xcheckgroup");
					html.push(o.category.code);
					html.push(" checkItem' value='");
					html.push(e.id);
					html.push("' ");
					html.push(checked);
					html.push("/> <label for='");
					html.push(e.id);
					html.push("' >");
					html.push(e.name);
					html.push("</label>");
					html.push("</div>");
				});
				html.push("</td></tr>");
				$.XCheck({
					groupClass : ".xcheckgroup" + o.category.code,
					afterCheckItem : function() {
						var ops = this.options;
						console.log('当前的options为：' + JSON.stringify(ops));
						console.log("afterCheckItem");
					}
				});
			});
			html.push("</table>");
			html.push("</div></div></form>");
			$("#dialog-meeting-user").html(html.join(""));
			$('#_q1').bind('keypress', function(event) {
				if (event.keyCode == "13") {
					//alert('你输入的内容为：' + $('#_q').val());
					selectAllUserDeptId(id, $('#_q1').val());
				}
			});
			$('#fm-user-cfg').ajaxForm({
				beforeSubmit : function(formData, jqForm, options) {
					var params = {};
					$.each(formData, function(n, obj) {
						params[obj.name] = obj.value;
					});
					insertMeetingUser(params.meetingId, params);
					return false;
				}
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}
function insertMeetingUser(id, p) {
	var params = [];

	$.each(p, function(key, value) {
		if ((key != 'meetingId') && (key != '_q1')) {
			params.push({
				meetingId : id,
				userId : value,
				mandatory:'NO',
				present:'0'
			});
		}
	});
	console.log(params);
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/insertMeetingUser.do",
		data : {
			meetingId : id,
			name : p._q1,
			jsons : JSON.stringify(params)
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			$("#btn-submit").removeAttr("disabled");
			alert(rst.errorMessage);
		},
		error : function() {
			$("#btn-submit").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}

function viewUser(meetingId) {
	var tableId = "detail1";
	if ($('#' + tableId).hasClass('dataTable')) {
		dttable = $('#' + tableId).dataTable();
		dttable.fnClearTable(); // 清空一下table
		dttable.fnDestroy(); // 还原初始化了的datatable
	}
	var table = $('#' + tableId).DataTable(
			{
				ajax : {
					url : contextPath
							+ '/meeting/selectUserByMeetingId.do?meetingId='
							+ meetingId,
					dataSrc : 'data'
				},
				columns : [{
					data : 'rownum'
				}, {
					data : 'roleName'
				}, {
					data : 'name'
				}, {
					data : 'mandatory'
				}, {
                 					data : 'user_id'
                 				}],
				bAutoWidth : false,
				"fnInitComplete" : function() {
					this.fnAdjustColumnSizing(true);
				},
				"createdRow" : function(row, data, dataIndex) {
					$(row).children('td').eq(0).attr('style',
							'text-align: center;font-weight:800');
					$(row).children('td').eq(3).html(
							'<a href="javascript:updateMandatory(\'' + data.user_id
									+ '\',\'' + data.mandatory + '\',\'' + meetingId
									+ '\')"><span class="badge badge-info">'
									+ data.mandatory + '</span></a>');
					$(row).children('td').eq(4).html(
                    							'<a href="javascript:deleteByMeetingIdAndUserId(\'' + data.user_id
                    									+ '\',\'' + data.name + '\',\'' + meetingId
                    									+ '\')"><span class="badge badge-danger">删除</span></a>');

				},
				"aLengthMenu" : [5, 10, 15, 20],
				"oLanguage" : {
					"sLengthMenu" : "每页显示 _MENU_ 条记录",
					"sZeroRecords" : "对不起，查询不到任何相关数据",
					"sInfo" : "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
					"sInfoEmpty" : "第 0 到 0 条记录，共 0 条",
					"sInfoFiltered" : "数据表中共为 _MAX_ 条记录)",
					"sProcessing" : "正在加载中...",
					"sSearch" : "搜索 ",
					"sUrl" : "",
					"oPaginate" : {
						"sFirst" : "",
						"sPrevious" : "",
						"sNext" : "",
						"sLast" : ""
					},
					"oAria" : {
						"sSortAscending" : ": 升序排列",
						"sSortDescending" : ": 降序排列"
					}
				}
			});

}
function updateMandatory(userId,mandatory,meetingId){
    if(mandatory=="YES"){
        mandatory="NO";
    }else{
        mandatory="YES";
    }
    $.ajax({
    		type : "post",
    		url : contextPath + "/meeting/updateMandatory.do",
    		data : {
    			meetingId : meetingId,
    			userId : userId,
    			mandatory:mandatory
    		},
    		beforeSend : function(XMLHttpRequest) {

    		},
    		success : function(rst, textStatus) {
    			viewUser(meetingId);


    		},
    		error : function() {

    			alert("加载错误！");
    		}
    	});
}
function deleteByMeetingIdAndUserId(userId,name,meetingId){
if(confirm("确定要删除"+name+"吗？")){
$.ajax({
		type : "post",
		url : contextPath + "/meeting/deleteByMeetingIdAndUserId.do",
		data : {
			meetingId : meetingId,
			userId : userId
		},
		beforeSend : function(XMLHttpRequest) {

		},
		success : function(rst, textStatus) {
			viewUser(meetingId);


		},
		error : function() {

			alert("加载错误！");
		}
	});
}
}

function delMeetingById(name,id){
if(confirm("确定要关闭"+name+"吗？")){
$.ajax({
		type : "post",
		url : contextPath + "/meeting/deleteMeetingByMeetingId.do",
		data : {
			jsons : JSON.stringify({id:id})
		},
		beforeSend : function(XMLHttpRequest) {

		},
		success : function(rst, textStatus) {
			jQuery(cfg.grid_selector).jqGrid('setGridParam', {
            					page : 1
            				}).trigger("reloadGrid");


		},
		error : function() {

			alert("加载错误！");
		}
	});
}
}