//-------------------------------------------------------------------
// Parts Chaincode Library
//-------------------------------------------------------------------

module.exports = function (enrollObj, g_options, fcw, logger) {
	var parts_chaincode = {};

	// Chaincode -------------------------------------------------------------------------------

	//check if chaincode exists
	parts_chaincode.check_if_already_instantiated = function (options, cb) {
		console.log('');
		logger.info('Checking for chaincode...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['selftest']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null || isNaN(resp.parsed)) {	 //if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};

	//check chaincode version
	parts_chaincode.check_version = function (options, cb) {
		console.log('');
		logger.info('Checking chaincode and ui compatibility...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['parts_ui']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null) {							//if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};


	// Parts -------------------------------------------------------------------------------

	//create a part
	parts_chaincode.create_a_part = function (options, cb) {
		console.log('');
		logger.info('Creating a part...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'init_part',
			cc_args: [
				'm' + leftPad(Date.now() + randStr(5), 19),
				options.args.color,
				options.args.size,
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];			//pass part id back
				cb(err, resp);
			}
		});
	};

	//get list of parts
	parts_chaincode.get_part_list = function (options, cb) {
		console.log('');
		logger.info('Fetching part index list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'compelte_part_index',
			cc_args: [' ']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get part
	parts_chaincode.get_part = function (options, cb) {
		logger.info('fetching part ' + options.part_id + ' list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read',
			cc_args: [options.args.part_id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//set part owner
	parts_chaincode.set_part_owner = function (options, cb) {
		console.log('');
		logger.info('Setting part owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'set_owner',
			cc_args: [
				options.args.part_id,
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//delete part
	parts_chaincode.delete_part = function (options, cb) {
		console.log('');
		logger.info('Deleting a part...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'delete_part',
			cc_args: [options.args.part_id, options.args.auth_company],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	//get history for key
	parts_chaincode.get_history = function (options, cb) {
		logger.info('Getting history for...', options.args);

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'getHistory',
			cc_args: [options.args.id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get multiple parts/owners by start and stop ids
	parts_chaincode.get_multiple_keys = function (options, cb) {
		logger.info('Getting parts between ids', options.args);

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'getPartsByRange',
			cc_args: [options.args.start_id, options.args.stop_id]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};


	// Owners -------------------------------------------------------------------------------

	//register a owner/user
	parts_chaincode.register_owner = function (options, cb) {
		console.log('');
		logger.info('Creating a part owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'init_owner',
			cc_args: [
				'o' + leftPad(Date.now() + randStr(5), 19),
				options.args.part_owner,
				options.args.owners_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];				//pass owner id back
				cb(err, resp);
			}
		});
	};

	//get a owner/user
	parts_chaincode.get_owner = function (options, cb) {
		var full_username = build_owner_name(options.args.part_owner, options.args.owners_company);
		console.log('');
		logger.info('Fetching owner ' + full_username + ' list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: [full_username]
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	//get the owner list
	parts_chaincode.get_owner_list = function (options, cb) {
		console.log('');
		logger.info('Fetching owner index list...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['_ownerindex']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	// disable a part owner
	parts_chaincode.disable_owner = function (options, cb) {
		console.log('');
		logger.info('Disabling a part owner...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'disable_owner',
			cc_args: [
				options.args.owner_id,
				options.args.auth_company
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[0];				//pass owner id back
				cb(err, resp);
			}
		});
	};

	//build full name
	parts_chaincode.build_owner_name = function (username, company) {
		return build_owner_name(username, company);
	};


	// All ---------------------------------------------------------------------------------

	//build full name
	parts_chaincode.read_everything = function (options, cb) {
		console.log('');
		logger.info('Fetching EVERYTHING...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_everything',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	// get block height of the channel
	parts_chaincode.channel_stats = function (options, cb) {
		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts
		};
		fcw.query_channel(enrollObj, opts, cb);
	};


	// Other -------------------------------------------------------------------------------

	// Format Owner's Actual Key Name
	function build_owner_name(username, company) {
		return username.toLowerCase() + '.' + company;
	}

	// random string of x length
	function randStr(length) {
		var text = '';
		var possible = 'abcdefghijkmnpqrstuvwxyz0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// left pad string with "0"s
	function leftPad(str, length) {
		for (var i = str.length; i < length; i++) str = '0' + String(str);
		return str;
	}

	return parts_chaincode;
};

