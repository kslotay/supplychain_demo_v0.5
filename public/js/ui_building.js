/* global bag, $, ws*/
/* global escapeHtml, toTitleCase, formatDate, known_companies, transfer_part, record_company, show_tx_step, refreshHomePanel, auditingPart*/
/* exported build_part, record_company, build_user_panels, build_company_panel, build_notification, populate_users_parts*/
/* exported build_a_tx, parts */

var parts = {};

// =================================================================================
//	UI Building
// =================================================================================
//build a part
function build_part(part) {
	var html = '';
	var colorClass = '';
	var size = 'largePart';
	var auditing = '';

	parts[part.id] = part;

	part.id = escapeHtml(part.id);
	part.color = escapeHtml(part.color);
	part.owner.id = escapeHtml(part.owner.id);
	part.owner.username = escapeHtml(part.owner.username);
	part.owner.company = escapeHtml(part.owner.company);
	var full_owner = escapeHtml(part.owner.username.toLowerCase() + '.' + part.owner.company);

	console.log('[ui] building part: ', part.color, full_owner, part.id.substring(0, 4) + '...');
	if (part.size == 16) size = 'smallPart';
	if (part.color) colorClass = part.color.toLowerCase() + 'bg';

	if (auditingPart && part.id === auditingPart.id) auditing = 'auditingPart';

	html += '<span id="' + part.id + '" class="ball ' + size + ' ' + colorClass + ' ' + auditing + ' title="' + part.id + '"';
	html += ' username="' + part.owner.username + '" company="' + part.owner.company + '" owner_id="' + part.owner.id + '"></span>';

	$('.partsWrap[owner_id="' + part.owner.id + '"]').find('.innerPartWrap').prepend(html);
	$('.partsWrap[owner_id="' + part.owner.id + '"]').find('.noPartsMsg').hide();
	return html;
}

//redraw the user's parts
function populate_users_parts(msg) {

	//reset
	console.log('[ui] clearing parts for user ' + msg.owner_id);
	$('.partsWrap[owner_id="' + msg.owner_id + '"]').find('.innerPartWrap').html('<i class="fa fa-plus addPart"></i>');
	$('.partsWrap[owner_id="' + msg.owner_id + '"]').find('.noPartsMsg').show();

	for (var i in msg.parts) {
		build_part(msg.parts[i]);
	}
}

//crayp resize - dsh to do, dynamic one
function size_user_name(name) {
	var style = '';
	if (name.length >= 10) style = 'font-size: 22px;';
	if (name.length >= 15) style = 'font-size: 18px;';
	if (name.length >= 20) style = 'font-size: 15px;';
	if (name.length >= 25) style = 'font-size: 11px;';
	return style;
}

//build all user panels
function build_user_panels(data) {

	//reset
	console.log('[ui] clearing all user panels');
	$('.ownerWrap').html('');
	for (var x in known_companies) {
		known_companies[x].count = 0;
		known_companies[x].visible = 0;							//reset visible counts
	}

	for (var i in data) {
		var html = '';
		var colorClass = '';
		data[i].id = escapeHtml(data[i].id);
		data[i].username = escapeHtml(data[i].username);
		data[i].company = escapeHtml(data[i].company);
		record_company(data[i].company);
		known_companies[data[i].company].count++;
		known_companies[data[i].company].visible++;

		console.log('[ui] building owner panel ' + data[i].id);

		let disableHtml = '';
		if (data[i].company  === escapeHtml(bag.part_company)) {
			disableHtml = '<span class="fa fa-trash disableOwner" title="Disable Owner"></span>';
		}

		html += `<div id="user` + i + `wrap" username="` + data[i].username + `" company="` + data[i].company +
			`" owner_id="` + data[i].id + `" class="partsWrap ` + colorClass + `">
					<div class="legend" style="` + size_user_name(data[i].username) + `">
						` + toTitleCase(data[i].username) + `
						<span class="fa fa-thumb-tack partsFix" title="Never Hide Owner"></span>
						` + disableHtml + `
					</div>
					<div class="innerPartWrap"><i class="fa fa-plus addPart"></i></div>
					<div class="noPartsMsg hint">No parts</div>
				</div>`;

		$('.companyPanel[company="' + data[i].company + '"]').find('.ownerWrap').append(html);
		$('.companyPanel[company="' + data[i].company + '"]').find('.companyVisible').html(known_companies[data[i].company].visible);
		$('.companyPanel[company="' + data[i].company + '"]').find('.companyCount').html(known_companies[data[i].company].count);
	}

	//drag and drop part
	$('.innerPartWrap').sortable({ connectWith: '.innerPartWrap', items: 'span' }).disableSelection();
	$('.innerPartWrap').droppable({
		drop:
		function (event, ui) {
			var part_id = $(ui.draggable).attr('id');

			//  ------------ Delete Part ------------ //
			if ($(event.target).attr('id') === 'trashbin') {
				console.log('removing part', part_id);
				show_tx_step({ state: 'building_proposal' }, function () {
					var obj = {
						type: 'delete_part',
						id: part_id,
						v: 1
					};
					ws.send(JSON.stringify(obj));
					$(ui.draggable).addClass('invalid bounce');
					refreshHomePanel();
				});
			}

			//  ------------ Transfer Part ------------ //
			else {
				var dragged_owner_id = $(ui.draggable).attr('owner_id');
				var dropped_owner_id = $(event.target).parents('.partsWrap').attr('owner_id');

				console.log('dropped a part', dragged_owner_id, dropped_owner_id);
				if (dragged_owner_id != dropped_owner_id) {										//only transfer parts that changed owners
					$(ui.draggable).addClass('invalid bounce');
					transfer_part(part_id, dropped_owner_id);
					return true;
				}
			}
		}
	});

	//user count
	$('#foundUsers').html(data.length);
	$('#totalUsers').html(data.length);
}

//build company wrap
function build_company_panel(company) {
	company = escapeHtml(company);
	console.log('[ui] building company panel ' + company);

	var mycss = '';
	if (company === escapeHtml(bag.part_company)) mycss = 'myCompany';

	var html = `<div class="companyPanel" company="` + company + `">
					<div class="companyNameWrap ` + mycss + `">
					<span class="companyName">` + company + `&nbsp;-&nbsp;</span>
					<span class="companyVisible">0</span>/<span class="companyCount">0</span>`;
	if (company === escapeHtml(bag.part_company)) {
		html += '<span class="fa fa-exchange floatRight"></span>';
	} else {
		html += '<span class="fa fa-long-arrow-left floatRight"></span>';
	}
	html += `	</div>
				<div class="ownerWrap"></div>
			</div>`;
	$('#allUserPanelsWrap').append(html);
}

//build a notification msg, `error` is boolean
function build_notification(error, msg) {
	var html = '';
	var css = '';
	var iconClass = 'fa-check';
	if (error) {
		css = 'warningNotice';
		iconClass = 'fa-minus-circle';
	}

	html += `<div class="notificationWrap ` + css + `">
				<span class="fa ` + iconClass + ` notificationIcon"></span>
				<span class="noticeTime">` + formatDate(Date.now(), `%M/%d %I:%m:%s`) + `&nbsp;&nbsp;</span>
				<span>` + escapeHtml(msg) + `</span>
				<span class="fa fa-close closeNotification"></span>
			</div>`;
	return html;
}


//build a tx history div
function build_a_tx(data, pos) {
	var html = '';
	var username = '-';
	var company = '-';
	var id = '-';
	if (data && data.value && data.value.owner && data.value.owner.username) {
		username = data.value.owner.username;
		company = data.value.owner.company;
		id = data.value.owner.id;
	}

	html += `<div class="txDetails">
				<div class="txCount">TX ` + (Number(pos) + 1) + `</div>
				<p>
					<div class="partLegend">Transaction: </div>
					<div class="partName txId">` + data.txId.substring(0, 14) + `...</div>
				</p>
				<p>
					<div class="partLegend">Owner: </div>
					<div class="partName">` + username + `</div>
				</p>
				<p>
					<div class="partLegend">Company: </div>
					<div class="partName">` + company + `</div>
				</p>
				<p>
					<div class="partLegend">Ower Id: </div>
					<div class="partName">` + id + `</div>
				</p>
			</div>`;
	return html;
}
