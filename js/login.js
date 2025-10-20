if (localStorage.getItem('uniplan-user') !== null) {
	window.location = '.';
}

$(function() {
	var allUsers = {};

	const fetchUsers = async () => {
	    try {
	        const { data: userList, error } = await supabasePublicClient
	        .from('users').select('*').eq('active',true);

	        if (userList) {
	        	console.log(userList);
	        	allUsers = userList;
	        }

	    } catch (error) {
	        console.log(error);
	    }
	}

	fetchUsers();

	$('#loginFormElement').on('submit',function(e) {
		e.preventDefault();
		

		let usernameTxt = $('#usernameInput').val();
		let passwordTxt = $('#passwordInput').val();

		console.log(usernameTxt + ' - ' + passwordTxt);

        var showError1 = true; // muestra el error de que el username introducido no existe en caso de mantenerse true

		if (usernameTxt!='' && passwordTxt!='') {
			for (i in allUsers) {
				console.log(allUsers[i].username + ' - ' + usernameTxt);
				if (allUsers[i].username == usernameTxt) {
                    // el usuario existe
                    showError1 = false;

					var encryptPass = sha1(passwordTxt);

					if (allUsers[i].password == encryptPass) {
                        console.log(allUsers[i].admin);
                        if (allUsers[i].admin) {
                            debugStatus = true;
                        } else {
                            debugStatus = undefined;
                        }

						var loggedUserData = {
							'userId': allUsers[i].userId,
							'username': usernameTxt,
							'password': encryptPass,
							'joinDate': allUsers[i].joinDate,
							'theme': allUsers[i].theme,
							'active': allUsers[i].active,
                            'admin': allUsers[i].admin,
                            'degreeName': allUsers[i].degreeName,
                            'degreeUni': allUsers[i].degreeUni,
                            'degreeCredits': allUsers[i].degreeCredits,
                            'debug': debugStatus
						};
						localStorage.setItem('uniplan-user',JSON.stringify(loggedUserData));
						window.location = '.';
					} else {
						errorReporting('ERROR: El usuario o la contraseña no son correctos');
					}
				}
			}
            if (showError1) {
                errorReporting('ERROR: El usuario o la contraseña no son correctos');
            }
		} else {
			errorReporting('ERROR: Debes escribir tu usuario y contraseña');
			if (usernameTxt=='') {
				$('#usernameInput').focus();
			} else {
				$('#passwordInput').focus();
			}
		}
	});
});

function errorReporting(msg) {
	var randomCode = getRandomCode(5);
	htmlError = '<div class="errorItem" id="errorItem-'+randomCode+'">';
		htmlError += '<p>'+msg+'</p>';
	htmlError += '</div>';

	$('#errorReporting').append(htmlError);
	$('#errorItem-'+randomCode).show();

	setTimeout(function() {
		$('#errorItem-'+randomCode).fadeOut(200);
		$('#errorItem-'+randomCode).remove();
	},5000);
}

function getRandomCode(length) {
	var code = '';
	for (i=0;i<length;i++) {
		code += Math.floor(Math.random() * 10);
	}
	return code;
}

function sha1 (str) {
    var hash
    try {
        var crypto = require('crypto')
        var sha1sum = crypto.createHash('sha1')
        sha1sum.update(str)
        hash = sha1sum.digest('hex')
    } catch (e) {
        hash = undefined
    }

    if (hash !== undefined) {
        return hash
    }

    var _rotLeft = function (n, s) {
        var t4 = (n << s) | (n >>> (32 - s))
        return t4
    }

    var _cvtHex = function (val) {
        var str = ''
        var i
        var v

        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f
            str += v.toString(16)
        }
        return str
    }

    var blockstart
    var i, j
    var W = new Array(80)
    var H0 = 0x67452301
    var H1 = 0xEFCDAB89
    var H2 = 0x98BADCFE
    var H3 = 0x10325476
    var H4 = 0xC3D2E1F0
    var A, B, C, D, E
    var temp

    // utf8_encode
    str = unescape(encodeURIComponent(str))
    var strLen = str.length

    var wordArray = []
    for (i = 0; i < strLen - 3; i += 4) {
        j = str.charCodeAt(i) << 24 |
        str.charCodeAt(i + 1) << 16 |
        str.charCodeAt(i + 2) << 8 |
        str.charCodeAt(i + 3)
        wordArray.push(j)
    }

    switch (strLen % 4) {
        case 0:
            i = 0x080000000
            break
        case 1:
            i = str.charCodeAt(strLen - 1) << 24 | 0x0800000
            break
        case 2:
            i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000
            break
        case 3:
            i = str.charCodeAt(strLen - 3) << 24 |
            str.charCodeAt(strLen - 2) << 16 |
            str.charCodeAt(strLen - 1) << 8 | 0x80
            break
        }

        wordArray.push(i)

        while ((wordArray.length % 16) !== 14) {
            wordArray.push(0)
        }

        wordArray.push(strLen >>> 29)
        wordArray.push((strLen << 3) & 0x0ffffffff)

        for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
            for (i = 0; i < 16; i++) {
                W[i] = wordArray[blockstart + i]
            }
            for (i = 16; i <= 79; i++) {
                W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1)
            }

            A = H0
            B = H1
            C = H2
            D = H3
            E = H4

            for (i = 0; i <= 19; i++) {
                temp = (_rotLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff
                E = D
                D = C
                C = _rotLeft(B, 30)
                B = A
                A = temp
            }

            for (i = 20; i <= 39; i++) {
                temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff
                E = D
                D = C
                C = _rotLeft(B, 30)
                B = A
                A = temp
            }

            for (i = 40; i <= 59; i++) {
                temp = (_rotLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff
                E = D
                D = C
                C = _rotLeft(B, 30)
                B = A
                A = temp
            }

            for (i = 60; i <= 79; i++) {
                temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff
                E = D
                D = C
                C = _rotLeft(B, 30)
                B = A
                A = temp
            }

            H0 = (H0 + A) & 0x0ffffffff
            H1 = (H1 + B) & 0x0ffffffff
            H2 = (H2 + C) & 0x0ffffffff
            H3 = (H3 + D) & 0x0ffffffff
            H4 = (H4 + E) & 0x0ffffffff
        }

        temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4)
        return temp.toLowerCase()
}