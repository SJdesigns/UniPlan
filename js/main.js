// UniPlan v1.1

var userData = {
    'userId': 'a70e75ff-2aa7-4958-bcc9-8de8977d74de',
    'username': 'sjalvarez',
    'joinDate': 1745182323199,
    'theme': 'light',
    'degreeName': 'Administración y dirección de empresas',
    'degreeUni': 'Universidad Internacional de La Rioja',
};

if (!localStorage.getItem('uniplan-settings') ) {
    var settings = {
        'homeOnlyOngoing': false,
        'homeYear1Collapsed': false,
        'homeYear2Collapsed': false,
        'homeYear3Collapsed': false,
        'homeYear4Collapsed': false,
    };
    localStorage.setItem('uniplan-settings',JSON.stringify(settings));
} else {
    var settings = JSON.parse(localStorage.getItem('uniplan-settings'));
}

if (!localStorage.getItem('uniplan-lastRequestedData')) {
    var lastRequestedData = {
        'subjects': {}, 'weeks': {}, 'activities': {}
    };
    localStorage.setItem('uniplan-lastRequestedData',JSON.stringify(lastRequestedData));
} else {
    var lastRequestedData = JSON.parse(localStorage.getItem('uniplan-lastRequestedData'));
}

var userId = userData.userId;

var appName = 'UniPlan';
var version = '1.1.0';
var deployment = '12/10/2025';
var author = '@sjdesigns';

var userSubjects = {};
var userWeeks = {};
var userActivities = {};
var firstLoadDegreeProgress = true; // para evitar que se haga la animacion del progreso de creditos cada vez que se carga la home


$(function() {
    loadData();

    $('#navItemHome').on('click',function() { showTab('home',false); });
    $('#navItemCalendar').on('click',function() { showTab('calendar',false); });
    $('#navItemTimer').on('click',function() { showTab('timer',false); });

    if (settings.homeOnlyOngoing) {
        $('#homeSearchOnlyOngoing').val('ongoing');
    } else {
        $('#homeSearchOnlyOngoing').val('all');
    }

    $('#homeSearchOnlyOngoing').on('change',function() {
        console.log($('#homeSearchOnlyOngoing').val());
        if ($('#homeSearchOnlyOngoing').val() == 'all') {
            settings.homeOnlyOngoing = false;
            localStorage.setItem('uniplan-settings',JSON.stringify(settings));
        } else {
            settings.homeOnlyOngoing = true;
            localStorage.setItem('uniplan-settings',JSON.stringify(settings));
        }
        showTab('home',false);
    });
});

function loadData() {
    console.log('loadData');
    getUserSubjects();
    getUserWeeks();
    getUserActivities();
}

function getUserSubjects() {
	console.log('f:{getUserSubjects}');

	const fetchSubjects = async () => {
	    try {
	        const { data: subjectList, error } = await supabasePublicClient
	        .from('subjects').select('*').eq('userId',userId);

	        if (subjectList) {
	        	userSubjects = subjectList;
                lastRequestedData['subjects'] = userSubjects;
                localStorage.setItem('uniplan-lastRequestedData',JSON.stringify(lastRequestedData));
	        	console.log(userSubjects);

                $('#loading').hide();
                showTab('home');
	        }

	    } catch (error) {
	        console.log(error);

            userSubjects = lastRequestedData['subjects'];
            errorReporting('error','No se ha podido establecer conexion para recuperar las asignaturas');

            $('#loading').hide();
            showTab('home');
	    }
	}
	fetchSubjects();
}

function getUserWeeks() {
    console.log('f:{getUserWeeks}');

    const fetchWeeks = async () => {
        try {
            const { data: weekList, error } = await supabasePublicClient
            .from('weeks').select('*').eq('userId',userId);

            if (weekList) {
                userWeeks = weekList;
                lastRequestedData['weeks'] = userWeeks;
                localStorage.setItem('uniplan-lastRequestedData',JSON.stringify(lastRequestedData));
                console.log(userWeeks);
            }
        } catch (error) {
            console.log(error);

            userWeeks = lastRequestedData['weeks'];
            errorReporting('error','No se ha podido establecer conexion para recuperar las semanas');
        }
    }
    fetchWeeks();
}

function getUserActivities() {
    console.log('f:{getUserActivities}');

    const fetchActivities = async () => {
        try {
            const { data: activitiesList, error } = await supabasePublicClient
            .from('activities').select('*').eq('userId',userId);

            if (activitiesList) {
                userActivities = activitiesList;
                lastRequestedData['activities'] = userActivities;
                localStorage.setItem('uniplan-lastRequestedData',JSON.stringify(lastRequestedData));
                console.log(userActivities);
            }
        } catch (error) {
            console.log(error);

            userActivities = lastRequestedData['activities'];
            errorReporting('error','No se ha podido establecer conexion para recuperar las actividades');
        }
    }
    fetchActivities();
}

function showTab(tabName,subject) {
    console.log('showTab('+tabName+','+subject+')');
    // tabName = {'dashboard', 'week', 'today', 'edit', 'settings', 'user'};

    $('.tab').hide();
    $('#tabSubjects').hide();

    if (tabName == 'home') {
        showHomeTab();
    } else if (tabName == 'calendar') {
        showCalendarTab();
    } else if (tabName == 'timer') {
        showTimerTab();
    } else if (tabName == 'subjEdit') {
        $('#tabSubjEdit').show();
    } else if (tabName == 'subject') {
        $('#tabSubjects').show();
        showSubjectTab(subject);
    }
}

function showHomeTab() {
    console.log('showHomeTab');

    $('#tabHome').show();

    var htmlNavSubj = '';
    var htmlTabSubj = '';
    for (i in userSubjects) {
        if (userSubjects[i].subjStatus == 'en curso') {
            htmlNavSubj += '<div class="navItem navItemSubject" id="navItem-'+userSubjects[i].subjId+'">';
                htmlNavSubj += '<p>'+userSubjects[i].subjCode+'</p>';
            htmlNavSubj += '</div>';
        }

        htmlTabSubj += '<div class="tab" id="tabSubj-'+userSubjects[i].subjId+'">';
            htmlTabSubj += '<p>'+userSubjects[i].subjName+'</p>';
        htmlTabSubj += '</div>';
    }

    $('#navSubjectList').html(htmlNavSubj);
    $('#tabSubjects').html(htmlTabSubj);

    var dropdownUpSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';
    var dropdownDownSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';

    var htmlHomeSubj1Quarter1 = ''; var htmlHomeSubj1Quarter2 = '';
    var htmlHomeSubj2Quarter1 = ''; var htmlHomeSubj2Quarter2 = '';
    var htmlHomeSubj3Quarter1 = ''; var htmlHomeSubj3Quarter2 = '';
    var htmlHomeSubj4Quarter1 = ''; var htmlHomeSubj4Quarter2 = '';

    var htmlHomeSubj1 = '<div class="homeSubjRow homeSubjRowTitle"><div class="homeSubjCell homeSubjCellYear">1º '+userData.degreeName+'</div> <div class="homeYearSubjDropdownUp" id="homeYearSubjDropdownUp1">'+dropdownUpSvg+'</div> <div class="homeYearSubjDropdownDown" id="homeYearSubjDropdownDown1">'+dropdownDownSvg+'</div></div>';
    var htmlHomeSubj2 = '<div class="homeSubjRow homeSubjRowTitle"><div class="homeSubjCell homeSubjCellYear">2º '+userData.degreeName+'</div> <div class="homeYearSubjDropdownUp" id="homeYearSubjDropdownUp2">'+dropdownUpSvg+'</div> <div class="homeYearSubjDropdownDown" id="homeYearSubjDropdownDown2">'+dropdownDownSvg+'</div></div>';
    var htmlHomeSubj3 = '<div class="homeSubjRow homeSubjRowTitle"><div class="homeSubjCell homeSubjCellYear">3º '+userData.degreeName+'</div> <div class="homeYearSubjDropdownUp" id="homeYearSubjDropdownUp3">'+dropdownUpSvg+'</div> <div class="homeYearSubjDropdownDown" id="homeYearSubjDropdownDown3">'+dropdownDownSvg+'</div></div>';
    var htmlHomeSubj4 = '<div class="homeSubjRow homeSubjRowTitle"><div class="homeSubjCell homeSubjCellYear">4º '+userData.degreeName+'</div> <div class="homeYearSubjDropdownUp" id="homeYearSubjDropdownUp4">'+dropdownUpSvg+'</div> <div class="homeYearSubjDropdownDown" id="homeYearSubjDropdownDown4">'+dropdownDownSvg+'</div></div>';

    var subj1Count = 0; var subj2Count = 0; var subj3Count = 0; var subj4Count = 0;
    var degreeCreditsCount = 0;
    var degreeCreditsTotalCount = 0;

    for (i in userSubjects) {
        degreeCreditsTotalCount += parseInt(userSubjects[i].subjCredits);
        if (userSubjects[i].subjStatus == 'aprobada') {
            degreeCreditsCount += parseInt(userSubjects[i].subjCredits);
        }

        if (!settings.homeOnlyOngoing || userSubjects[i].subjStatus == 'en curso') {
            // construimos las asignaturas del primer año
            if (userSubjects[i].subjYear==1) {
                if (userSubjects[i].subjQuarter==1) {
                    htmlHomeSubj1Quarter1 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj1Quarter1 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj1Quarter1 += '</div>';
                    subj1Count++;
                } else if (userSubjects[i].subjQuarter==2) {
                    htmlHomeSubj1Quarter2 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj1Quarter2 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj1Quarter2 += '</div>';
                    subj1Count++;
                }

            // construimos las asignaturas del segundo año
            } else if (userSubjects[i].subjYear==2) {
                if (userSubjects[i].subjQuarter==1) {
                    htmlHomeSubj2Quarter1 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj2Quarter1 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj2Quarter1 += '</div>';
                    subj2Count++;
                } else if (userSubjects[i].subjQuarter==2) {
                    htmlHomeSubj2Quarter2 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj2Quarter2 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj2Quarter2 += '</div>';
                    subj2Count++;
                }


            // construimos las asignaturas del tercer año
            } else if (userSubjects[i].subjYear==3) {
                if (userSubjects[i].subjQuarter==1) {
                    htmlHomeSubj3Quarter1 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj3Quarter1 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj3Quarter1 += '</div>';
                    subj3Count++;
                } else if (userSubjects[i].subjQuarter==2) {
                    htmlHomeSubj3Quarter2 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj3Quarter2 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj3Quarter2 += '</div>';
                    subj3Count++;
                }
                

            // construimos las asignaturas del cuarto año
            } else if (userSubjects[i].subjYear==4) {
                if (userSubjects[i].subjQuarter==1) {
                    htmlHomeSubj4Quarter1 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj4Quarter1 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj4Quarter1 += '</div>';
                    subj4Count++;
                } else if (userSubjects[i].subjQuarter==2) {
                    htmlHomeSubj4Quarter2 += '<div class="homeSubjRow" id="homeSubjItem-'+userSubjects[i].subjId+'">';
                        htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellCode">'+userSubjects[i].subjCode+'</div>';
                        htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellName">'+userSubjects[i].subjName+'</div>';
                        htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellCredits">'+userSubjects[i].subjCredits+' ETCS</div>';
                        htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellQuarter">Q'+userSubjects[i].subjQuarter+'</div>';
                        htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellStatus">'+userSubjects[i].subjStatus+'</div>';
                        if (userSubjects[i].subjStatus == 'aprobada' && userSubjects[i].subjGradeOrd != '') {
                            htmlHomeSubj4Quarter2 += '<div class="homeSubjCell homeSubjCellGrade">'+userSubjects[i].subjGradeOrd+'</div>';
                        }
                    htmlHomeSubj4Quarter2 += '</div>';
                    subj4Count++;
                }
            } else {
            }
        }
        
    }
    
    var homeSubjNoResultsMsg = '<div class="homeSubjRow homeSubjRowNoResults">';
        homeSubjNoResultsMsg += '<div class="homeSubjCell homeSubjCellNoResults">No hay asignaturas</div>';
    homeSubjNoResultsMsg += '</div>';

    if (subj1Count==0) { htmlHomeSubj1 += homeSubjNoResultsMsg; }
    if (subj2Count==0) { htmlHomeSubj2 += homeSubjNoResultsMsg; }
    if (subj3Count==0) { htmlHomeSubj3 += homeSubjNoResultsMsg; }
    if (subj4Count==0) { htmlHomeSubj4 += homeSubjNoResultsMsg; }

    var htmlHomeSubjLists = '';
    if (!settings.homeOnlyOngoing || subj1Count!=0) {
        htmlHomeSubjLists += '<div class="homeYearSubjList" id="homeSubjYear1">'+htmlHomeSubj1+htmlHomeSubj1Quarter1+htmlHomeSubj1Quarter2+'</div>';
    }
    if (!settings.homeOnlyOngoing || subj2Count!=0) {
        htmlHomeSubjLists += '<div class="homeYearSubjList" id="homeSubjYear2">'+htmlHomeSubj2+htmlHomeSubj2Quarter1+htmlHomeSubj2Quarter2+'</div>';
    }
    if (!settings.homeOnlyOngoing || subj3Count!=0) {
        htmlHomeSubjLists += '<div class="homeYearSubjList" id="homeSubjYear3">'+htmlHomeSubj3+htmlHomeSubj3Quarter1+htmlHomeSubj3Quarter2+'</div>';
    }
    if (!settings.homeOnlyOngoing || subj4Count!=0) {
        htmlHomeSubjLists += '<div class="homeYearSubjList" id="homeSubjYear4">'+htmlHomeSubj4+htmlHomeSubj4Quarter1+htmlHomeSubj4Quarter2+'</div>';
    }

    $('#tabHomeSubjectList').html(htmlHomeSubjLists);

    $('#homeDegreeName').html(userData.degreeName);
    $('#homeDegreeCollege').html(userData.degreeUni);
    $('#homeDegreeCreditsGained > p:last-child').html(degreeCreditsCount);
    $('#homeDegreeCreditsTotal > p:last-child').html(degreeCreditsTotalCount);

    var degreeProgress = (degreeCreditsCount * 100) / degreeCreditsTotalCount;

    if (firstLoadDegreeProgress) {
        $('#homeDegreeProgressBar').animate({ width: degreeProgress+'%' }, 100);
        firstLoadDegreeProgress = false;
    } else {
        $('#homeDegreeProgressBar').css('width',degreeProgress+'%');
    }


    $('.homeSubjRow').on('click',function() {
        if (!$(this).hasClass('homeSubjRowNoResults') && !$(this).hasClass('homeSubjRowTitle')) {
            var subjId = $(this).attr('id').substring(13);
            showTab('subject',subjId);
        }
    });

    $('.homeYearSubjDropdownUp').on('click',function() {
        var year = $(this).attr('id').substring(22);

        $('#homeSubjYear'+year).css('height', '36px');
        $('#homeSubjYear'+year).css('border-radius', '10px');
        $('#homeYearSubjDropdownUp'+year).hide();
        $('#homeYearSubjDropdownDown'+year).css('display','flex');
    });

    $('.homeYearSubjDropdownDown').on('click',function() {
        var year = $(this).attr('id').substring(24);

        $('#homeSubjYear'+year).css('height', 'auto');
        $('#homeSubjYear'+year).css('border-radius', '10px 10px 0px 0px');
        $('#homeYearSubjDropdownUp'+year).css('display','flex');
        $('#homeYearSubjDropdownDown'+year).hide();
    });

    $('.navItemSubject').on('click',function() {
        var subjId = $(this).attr('id').substring(8);
        showTab('subject',subjId);
    });

    $('#navItemHome').on('click',function() { showTab('home',false); });
}

function showCalendarTab() {
    console.log('showCalendarTab');

    $('#tabCalendar').show();

    var calListIds = [];
    var calListObject = {};

    for (i in userActivities) {
        var ahora = new Date();

        if (ahora < userActivities[i].actDate) {

            var diferenciaSegundos = Math.abs(userActivities[i].actDate - ahora.getTime());
            var diferenciaDias = Math.ceil(diferenciaSegundos / (1000 * 60 * 60 * 24));

            calListIds.push(userActivities[i].actDate);

            var fecha = new Date(parseInt(userActivities[i].actDate));

            var subjectName = '';
            var subjectCode = '';
            for (j in userSubjects) {
                if (userSubjects[j].subjId == userActivities[i].actSubject) {
                    subjectName = userSubjects[j].subjName;
                    subjectCode = userSubjects[j].subjCode;
                }
            }

            calListObject[userActivities[i].actId] = {
                'actTimestamp': userActivities[i].actDate,
                'actDate': twoDigits(fecha.getDate())+'/'+twoDigits(fecha.getMonth()+1)+'/'+fecha.getFullYear(),
                'actRelTime': diferenciaDias,
                'actName': userActivities[i].actName,
                'actSubject': subjectName,
                'actSubjCode': subjectCode,
                'actValue': userActivities[i].actValue,
                'actType': userActivities[i].actType
            };
        }
    }

    // eliminar timestamps duplicados (varias actividades en el mismo día)
    calListIds = Array.from(new Set(calListIds));
    // ordenar numéricamente
    calListIds.sort(function(a, b) {
        return a - b;
    });

    var htmlCalendarList = '';

    var monthPrevious = new Date('01/01/1970');

    for (i in calListIds) {
        for (j in calListObject) {
            if (calListObject[j].actTimestamp == calListIds[i]) {
                var fecha = new Date(parseInt(calListObject[j].actTimestamp));
                
                var fechaMes = [fecha.getMonth() + 1, fecha.getFullYear()];
                // crear objeto Date de forma consistente (año, mesIndex, día)
                var monthAct = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
                var monthTxt = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

                if (monthAct.getTime() != monthPrevious.getTime()) {
                    monthPrevious = monthAct;
                    console.log((fechaMes[0]));
                    htmlCalendarList += '<div class="calMonthTitle"><p>'+monthTxt[fechaMes[0]-1]+' de '+fechaMes[1]+'</p></div>';
                }

                htmlCalendarList += '<div class="calItem" id="calItem-'+calListObject[j].actId+'">';
                    htmlCalendarList += '<div class="calItemCell calDateCell"><p>'+calListObject[j].actDate+'</p></div>';
                    if (calListObject[j].actRelTime < 7) {
                        if (calListObject[j].actRelTime == 1) {
                            htmlCalendarList += '<div class="calItemCell calRelTimeCell calRelTimeAlert"><p>último día</p></div>';
                        } else if (calListObject[j].actRelTime == 2) {
                            htmlCalendarList += '<div class="calItemCell calRelTimeCell calRelTimeAlert"><p>entrega mañana</p></div>';
                        } else {
                            htmlCalendarList += '<div class="calItemCell calRelTimeCell calRelTimeAlert"><p>faltan '+calListObject[j].actRelTime+' días</p></div>';
                        }
                    } else if (calListObject[j].actRelTime < 14) {
                        htmlCalendarList += '<div class="calItemCell calRelTimeCell calRelTimeWarning"><p>faltan '+calListObject[j].actRelTime+' días</p></div>';
                    } else {
                        htmlCalendarList += '<div class="calItemCell calRelTimeCell calRelTimeNormal"><p>faltan '+calListObject[j].actRelTime+' días</p></div>';
                    }
                    if (calListObject[j].actType == 'act') {
                        htmlCalendarList += '<div class="calItemCell calTypeCell"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-notebook-pen-icon lucide-notebook-pen"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg></div>';
                    } else if (calListObject[j].actType == 'exam') {
                        htmlCalendarList += '<div class="calItemCell calTypeCell"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school-icon lucide-school"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg></div>';
                    } if (calListObject[j].actType == 'other') {
                        htmlCalendarList += '<div class="calItemCell calTypeCell"></div>';
                    }
                    htmlCalendarList += '<div class="calItemCell calEventCell"><p>'+calListObject[j].actName+'</p></div>';
                    htmlCalendarList += '<div class="calItemCell calSubjectCell"><p>'+calListObject[j].actSubjCode + ' - ' + calListObject[j].actSubject+'</p></div>';
                    htmlCalendarList += '<div class="calItemCell calValueCell"><p>'+calListObject[j].actValue+' pts.</p></div>';
                htmlCalendarList += '</div>';
            }
        }
    }

    $('#calendarList').html(htmlCalendarList);

    loadCalendarTables();
}

function loadCalendarTables() {
    console.log('loadCalendarTables');

    let htmlCalTables = '';
    var today = new Date();

    // primero ordenamos en un array las actividades de cada dia
    const activitiesArr = Array.isArray(userActivities) ? userActivities : Object.values(userActivities || {});

    const activitiesByDate = {};
    activitiesArr.forEach(a => {
        if (!a || !a.actDate) return;
        const ts = parseInt(a.actDate);
        if (isNaN(ts)) return;
        const d = new Date(ts);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (!activitiesByDate[key]) activitiesByDate[key] = [];
        activitiesByDate[key].push(a);
    });
    console.log(activitiesByDate);

    // ahora construimos los meses del calendario
    for (i = 0; i < 2; i++) {
        var firstOfMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
        var year = firstOfMonth.getFullYear();
        var month = firstOfMonth.getMonth(); // 0..11

        let monthName = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(firstOfMonth);
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        htmlCalTables += '<div class="calTableItem">';
            htmlCalTables += '<div class="calTableTitle"><p>' + monthName + '</p></div>';
            // cabecera dias
            htmlCalTables += '<div class="calTableRow">';
                ['L','M','X','J','V','S','D'].forEach(w => {
                    htmlCalTables += '<div class="calTableCell">' + w + '</div>';
                });
            htmlCalTables += '</div>';

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lunes ... 6 = Domingo

            let cellsInRow = 0;
            htmlCalTables += '<div class="calTableRow">';

            // celdas vacías antes del primer dia
            for (let e = 0; e < firstWeekday; e++) {
                htmlCalTables += '<div class="calTableCell"></div>';
                cellsInRow++;
            }

            for (let d = 1; d <= daysInMonth; d++) {
                if (cellsInRow === 7) {
                    htmlCalTables += '</div>';
                    htmlCalTables += '<div class="calTableRow">';
                    cellsInRow = 0;
                }

                const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

                let cellClasses = 'calTableCell';
                let titleAttr = '';

                const matches = activitiesByDate[dateStr] || [];

                if (matches.length) { // si el dia tiene alguna alerta
                    cellClasses += ' calTableCellEvent';
                    // crear title con nombres de actividad + actSubject
                    const names = matches.map(a => {
                        const name = a.actName || a.name || a.title || '';
                        const type = a.actType ? String(a.actType) : '';
                        const subj = a.actSubject ? String(a.actSubject) : '';
                        return {'act':name, 'type': type, 'subj':subj}
                    });

                    if (names[0].type == 'act') {
                        cellClasses += ' calTableCellEventAct';
                        var subjType = 'entrega de';
                    } else if (names[0].type == 'exam') {
                        cellClasses += ' calTableCellEventExam';
                        var subjType = 'Convocatoria';
                    }

                    var subjName = '';
                    for (subj in userSubjects) {
                        if (userSubjects[subj].subjId == names[0].subj) {
                            subjName = userSubjects[subj].subjName;
                        }
                    }
                    console.log(names[0].act+', '+names[0].subj);
                    titleAttr = ' title="' + subjType + ' ' + names[0].act + ' - ' + subjName + '"';
                }

                if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d) {
                    cellClasses += ' calTableCellToday';
                }

                htmlCalTables += '<div class="' + cellClasses + '"' + titleAttr + '>' + d + '</div>';
                cellsInRow++;
            }

            // completar ultima fila
            while (cellsInRow < 7) {
                htmlCalTables += '<div class="calTableCell"></div>';
                cellsInRow++;
            }

            htmlCalTables += '</div>'; // cierre ultima fila
        htmlCalTables += '</div>'; // cierre calTableItem
    }

    htmlCalTables += '<div id="calTablesLegend">';
        htmlCalTables += '<div class="calTablesLegendRow">';
            htmlCalTables += '<div class="calLegendsColor" id="calLegendColorToday"></div><p>Dia de hoy</p>';
        htmlCalTables += '</div>';
        htmlCalTables += '<div class="calTablesLegendRow">';
            htmlCalTables += '<div class="calLegendsColor" id="calLegendColorAct"></div><p>Entrega de actividad</p>';
        htmlCalTables += '</div>';
        htmlCalTables += '<div class="calTablesLegendRow">';
            htmlCalTables += '<div class="calLegendsColor" id="calLegendColorExam"></div><p>Convocatoria de examen</p>';
        htmlCalTables += '</div>';
    htmlCalTables += '</div>';

    $('#calendarMonthTable').html(htmlCalTables);
}

function showTimerTab() {
    console.log('showTimerTab');

    $('#tabTimer').show();


    let intervalId = null;
    let currentSeconds = 0;
    let totalSecondsParam = 0; // Will be set when starting the counter
    let isPaused = false;

    /**
     * Formats a given number of seconds into h:mm:ss format.
     * @param {number} seconds - The total seconds to format.
     * @returns {string} The formatted time string (h:mm:ss).
     */
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }

    /**
     * Starts the counter from currentSeconds up to totalSecondsParam.
     * @param {number} totalSeconds - The total number of seconds the counter should reach.
     */

    function startCounter(totalSeconds) {
            // Si ya hay un intervalo activo, no hacemos nada a menos que esté pausado y queramos reanudar.
            if (intervalId !== null && !isPaused) {
                return; // Si ya está corriendo y no está pausado, salimos.
            }

            totalSecondsParam = totalSeconds;
            isPaused = false;
            //document.getElementById('pauseButton').textContent = 'Pause Counter'; // Aseguramos el texto correcto

            // Si hay un intervalo y está pausado, solo lo "reanuda" al poner isPaused a false.
            // Si no hay intervalo, lo creamos.
            if (intervalId === null) {
                 // Actualizar el display inmediatamente para evitar un retraso de 1s al inicio
                document.getElementById('timerDisplay').textContent = formatTime(currentSeconds);

                intervalId = setInterval(() => {
                    if (!isPaused) {
                        if (currentSeconds < totalSecondsParam) {
                            currentSeconds++;
                            document.getElementById('timerDisplay').textContent = formatTime(currentSeconds);
                        } else {
                            clearInterval(intervalId);
                            intervalId = null;
                            console.log("Counter finished!");
                        }
                    }
                }, 1000);
            }
        }

    function togglePause() {
        // Solo pausamos/reanudamos si hay un contador activo
        if (intervalId !== null) {
            isPaused = !isPaused;
            const pauseButton = document.getElementById('pauseButton');
            if (isPaused) {
                pauseButton.textContent = 'Resume Counter';
            } else {
                pauseButton.textContent = 'Pause Counter';
            }
        }
    }

    document.getElementById('startButton').addEventListener('click', () => {
        // Definimos aquí el total de segundos para el contador al iniciar.
        // Por ejemplo, 300 segundos = 5 minutos.
        const initialTotalSeconds = 300;

        if (intervalId === null) { // Si no hay ningún contador activo, lo iniciamos.
            startCounter(initialTotalSeconds);
        } else if (isPaused) { // Si hay un contador, pero está pausado, lo reanudamos.
            togglePause(); // Esto cambiará isPaused a false y el contador se reanudará.
        }
    });
}

function showSubjectTab(subjId) {
    console.log('showSubjectTab('+subjId+')');

    $('#tabSubj-'+subjId).show();
    subjectHeaderTemplate(subjId);
}

function subjectHeaderTemplate(subjId,tab='subj') {
    console.log('subjectHeaderTemplate');
    for (i in userSubjects) {
        if (userSubjects[i].subjId == subjId) {
            var htmlSubjectTemplate = '';
            htmlSubjectTemplate += '<div class="tabHeader">';
                htmlSubjectTemplate += '<div class="tabHeaderLeft">';
                    htmlSubjectTemplate += '<div class="subjectCodeBox">'+userSubjects[i].subjCode+'</div>';
                    htmlSubjectTemplate += '<div class="subjectTitle">';
                        htmlSubjectTemplate += '<h2>'+userSubjects[i].subjName+'</h2>';
                        htmlSubjectTemplate += '<p>'+userSubjects[i].subjDegree+'</p>';
                    htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '<div class="tabHeaderRight">';
                if (tab!='edit') {
                    htmlSubjectTemplate += '<div class="tabHeaderEdit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></div>';
                } else {
                    htmlSubjectTemplate += '<div class="tabHeaderGoBack"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2-icon lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg></div>';
                }
                    htmlSubjectTemplate += '<div class="tabHeaderStatus">';
                    if (userSubjects[i].subjStatus == 'pendiente') {
                        htmlSubjectTemplate += '<div class="subjectStatus subjStatusPending">'+userSubjects[i].subjStatus+'</div>';
                    } else if (userSubjects[i].subjStatus == 'en curso') {
                        htmlSubjectTemplate += '<div class="subjectStatus subjStatusOngoing">'+userSubjects[i].subjStatus+'</div>';
                    } else if (userSubjects[i].subjStatus == 'aprobada') {
                        htmlSubjectTemplate += '<div class="subjectStatus subjStatusPassed">'+userSubjects[i].subjStatus+'</div>';
                    }
                        htmlSubjectTemplate += '<p>'+userSubjects[i].subjCredits+' ETCS</p>';
                    htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '</div>';
            htmlSubjectTemplate += '</div>';

            /*htmlSubjectTemplate += '<div class="subjectData">';
                htmlSubjectTemplate += '<div class="subjectDataLeft"></div>';
                htmlSubjectTemplate += '<div class="subjectDataRight"></div>';
            htmlSubjectTemplate += '</div>';*/
        }
    }

    console.log(tab);
    if (tab!='edit') {
        $('#tabSubj-'+subjId).html(htmlSubjectTemplate);
        subjectTemplate(subjId);
    } else {
        $('#tabSubjEdit').html(htmlSubjectTemplate);
        editSubjTemplate(subjId);
        editSubjTemplateRight(subjId);
    }
}

function subjectTemplate(subjId) {
    console.log('subjectTemplate');
    for (i in userSubjects) {
        if (userSubjects[i].subjId == subjId) {
            var htmlSubjectTemplate = '';

            htmlSubjectTemplate += '<div class="subjectData">';
                htmlSubjectTemplate += '<div class="subjectDataLeft">';
                    htmlSubjectTemplate += '<div class="subjectPlanning">';
                        htmlSubjectTemplate += '<p class="subjectTableTitle">Planning</p>';
                        htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekNumber"><p>Semana</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>Fecha</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><p>Leccion</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekWatch"><p>Ver clase</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekSummary"><p>Resumen</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekExercises"><p>Ejercicios</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekStudy"><p>Estudio</p></div>';
                        htmlSubjectTemplate += '</div>';

                        var weeksByOrder = {};
                        for (i in userWeeks) {
                            var w = userWeeks[i];
                            if (w.userId == userId && w.weekSubject == subjId) {
                                var orderKey = parseInt(w.weekOrder) || 0;
                                if (!weeksByOrder[orderKey]) weeksByOrder[orderKey] = [];
                                weeksByOrder[orderKey].push(w);
                            }
                        }

                        var orderKeysWeeks = Object.keys(weeksByOrder).map(k => parseInt(k)).sort((a,b) => a - b);

                        var countWeeks = 0;
                        for (oi in orderKeysWeeks) {
                            var ord = orderKeysWeeks[oi];
                            var arr = weeksByOrder[ord];
                            for (wi in arr) {
                                var userWeek = arr[wi];
                                countWeeks++;
                                var fecha = new Date(parseInt(userWeek.weekStartDate));
                                var hoy = new Date();

                                if (sameWeek(fecha.getTime(),hoy.getTime())) {
                                    htmlSubjectTemplate += '<div class="planningRow planningRowThisWeek" id="planningRow-'+userWeek.weekId+'">';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningRow" id="planningRow-'+userWeek.weekId+'">';
                                }
                                htmlSubjectTemplate += '<div class="planningCell planningWeekNumber"><p>S'+userWeek.weekOrder+'</p></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                if (userWeek.weekLesson2== null) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><p>'+userWeek.weekLesson1+'</p></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><p>'+userWeek.weekLesson1+', '+userWeek.weekLesson2+'</p></div>';
                                }

                                if (userWeek.weekWatch) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekWatch planningCellTrue"><svg class="planningCellDone" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg><p>hecho</p></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekWatch"><p>-</p></div>';
                                }

                                if (userWeek.weekSummary) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekSummary planningCellTrue"><svg class="planningCellDone" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg><p>hecho</p></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekSummary"><p>-</p></div>';
                                }

                                if (userWeek.weekExercises) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekExercises planningCellTrue"><svg class="planningCellDone" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg><p>hecho</p></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekExercises"><p>-</p></div>';
                                }
                                
                                if (userWeek.weekStudy) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekStudy planningCellTrue"><svg class="planningCellDone" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg><p>hecho</p></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekStudy"><p>-</p></div>';
                                }
                                htmlSubjectTemplate += '</div>';
                            }
                        }

                    htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '</div>';

                htmlSubjectTemplate += '<div class="subjectDataRight">';

                    var activitiesByOrder = {};
                    for (i in userActivities) {
                        var act = userActivities[i];
                        if (act.userId == userId && act.actSubject == subjId) {
                            var orderKey = parseInt(act.actOrder) || 0;
                            if (!activitiesByOrder[orderKey]) activitiesByOrder[orderKey] = [];
                            activitiesByOrder[orderKey].push(act);
                        }
                    }

                    var orderKeys = Object.keys(activitiesByOrder).map(k => parseInt(k)).sort((a,b) => a - b);

                    var htmlActList = '';
                    var htmlExamList = '';

                    for (oi in orderKeys) {
                        var ord = orderKeys[oi];
                        var arr = activitiesByOrder[ord];
                        for (ai in arr) {
                            var act = arr[ai];
                            var fecha = new Date(parseInt(act.actDate));
                            var dateDiff = dateDifferenceDays(fecha.getTime());

                            if (act.actType == 'act') {
                                htmlActList += '<div class="planningRow">';
                                    htmlActList += '<div class="planningCell planningWeekName"><p>'+act.actName+'</p></div>';
                                    if (dateDiff < 0) {
                                        htmlActList += '<div class="planningCell planningWeekDate activityDatePast"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    } else if (dateDiff < 7) {
                                        htmlActList += '<div class="planningCell planningWeekDate activityDateNear"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    } else {
                                        htmlActList += '<div class="planningCell planningWeekDate activityDateAway"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    }
                                    htmlActList += '<div class="planningCell planningWeekValue"><p>'+act.actValue+'</p></div>';
                                    htmlActList += '<div class="planningCell planningWeekCalification"><p>'+act.actCalif+'</p></div>';
                                htmlActList += '</div>';
                            } else {
                                htmlExamList += '<div class="planningRow">';
                                    htmlExamList += '<div class="planningCell planningWeekName"><p>'+act.actName+'</p></div>';
                                    if (dateDiff < 0) {
                                        htmlExamList += '<div class="planningCell planningWeekDate activityDatePast"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    } else if (dateDiff < 7) {
                                        htmlExamList += '<div class="planningCell planningWeekDate activityDateNear"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    } else {
                                        htmlExamList += '<div class="planningCell planningWeekDate activityDateAway"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                                    }
                                    htmlExamList += '<div class="planningCell planningWeekValue"><p>'+act.actExamTime+'</p></div>';
                                    htmlExamList += '<div class="planningCell planningWeekCalification"><p>'+act.actCalif+'</p></div>';
                                htmlExamList += '</div>';
                            }
                        }
                    }

                    htmlSubjectTemplate += '<p class="subjectTableTitle">Actividades</p>';
                    htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekName"><p>Act</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>Entrega</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekValue"><p>Valor</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekCalification"><p>Nota</p></div>';
                    htmlSubjectTemplate += '</div>';
                    htmlSubjectTemplate += htmlActList;

                    htmlSubjectTemplate += '<p class="subjectTableTitle">Tests</p>';
                    htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekName"><p>Hechos</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>Total</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekValue"><p>Valor</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekCalification"><p>Nota</p></div>';
                    htmlSubjectTemplate += '</div>';

                    for (l in userSubjects) {
                        if (userSubjects[l].subjId == subjId) {
                            htmlSubjectTemplate += '<div class="planningRow">';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekName"><p>'+userSubjects[l].subjTestsTaken+'</p></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>'+userSubjects[l].subjTestsTotal+'</p></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekValue"><p>0.1</p></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekCalification"><p>'+(parseInt(userSubjects[l].subjTestsTaken)*0.1)+'</p></div>';
                            htmlSubjectTemplate += '</div>';
                        }
                    }

                    htmlSubjectTemplate += '<p class="subjectTableTitle">Exámenes</p>';
                    htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekName"><p>Convocat.</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>Fecha</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekValue"><p>Hora</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningWeekCalification"><p>Nota</p></div>';
                    htmlSubjectTemplate += '</div>';
                    htmlSubjectTemplate += htmlExamList;

                    htmlSubjectTemplate += '<br /><p class="subjectTableTitle">Calificaciones</p>';
                    htmlSubjectTemplate += '<div class="planningRow planningRowCalifTitle planningRowCalifications">';
                        htmlSubjectTemplate += '<div class="planningCell planningCalifEvCont"><p>Ev. Continua<br /><small>sobre 4</small></p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningCalifOrd"><p>Ordinaria</p></div>';
                        htmlSubjectTemplate += '<div class="planningCell planningCalifExtra"><p>Extraordinaria</p></div>';
                    htmlSubjectTemplate += '</div>';

                    htmlSubjectTemplate += '<div class="planningRow planningRowCalifications">';

                    for (p in userSubjects) {
                        if (userSubjects[p].subjId == subjId) {
                            console.log(userSubjects[p]);
                            htmlSubjectTemplate += '<div class="planningCell planningCalifEvCont"><p>'+userSubjects[p].subjContEvaluation+'</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningCalifOrd"><p>'+userSubjects[p].subjGradeOrd+'</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningCalifExtra"><p>'+userSubjects[p].subjGradeExtra+'</p></div>';
                        htmlSubjectTemplate += '</div>';
                        }
                    }

                htmlSubjectTemplate += '</div>';
            htmlSubjectTemplate += '</div>';
        }
    }

    $('#tabSubj-'+subjId).append(htmlSubjectTemplate);

    $('.tabHeaderEdit').on('click',function() {
        console.log('edit subject data');
        editSubj(subjId);
    });

    $('.planningWeekWatch').on('click',function() {
        var weekRowId = $(this).parent().attr('id').substring(12);

        if ($(this).hasClass('planningCellTrue')) {
            changeSubjWeek('class',weekRowId,false);
        } else {
            changeSubjWeek('class',weekRowId,true);
        }
    });

    $('.planningWeekSummary').on('click',function() {
        var weekRowId = $(this).parent().attr('id').substring(12);

        if ($(this).hasClass('planningCellTrue')) {
            changeSubjWeek('summary',weekRowId,false);
        } else {
            changeSubjWeek('summary',weekRowId,true);
        }
    });

    $('.planningWeekExercises').on('click',function() {
        var weekRowId = $(this).parent().attr('id').substring(12);

        if ($(this).hasClass('planningCellTrue')) {
            changeSubjWeek('exercises',weekRowId,false);
        } else {
            changeSubjWeek('exercises',weekRowId,true);
        }
    });

    $('.planningWeekStudy').on('click',function() {
        var weekRowId = $(this).parent().attr('id').substring(12);

        if ($(this).hasClass('planningCellTrue')) {
            changeSubjWeek('study',weekRowId,false);
        } else {
            changeSubjWeek('study',weekRowId,true);
        }
    });
}

function editSubj(subjId) {
    console.log('editSubj('+subjId+')');

    showTab('subjEdit',false);
    subjectHeaderTemplate(subjId,'edit');
}

// ...existing code...
function editSubjTemplate(subjId) {
    console.log('editSubjTemplate');

    for (i in userSubjects) {
        if (userSubjects[i].subjId == subjId) {
            var htmlSubjectTemplate = '';

            htmlSubjectTemplate += '<div id="subjectGeneralData">';
                htmlSubjectTemplate += '<p class="subjectTableTitle">General</p>';
                htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralCode"><p>Codigo</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralSubject"><p>Asignatura</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralDegree"><p>Grado</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralYear"><p>Año</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralCredits"><p>Creditos</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralStatus"><p>Estado</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralGradeOrd"><p>Grade Ord.</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralGradeExtra"><p>Grade Ex.</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralContEval"><p>Ev.cont.</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamOrd"><p>Exam Ord.</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamExtra"><p>Exam <br />Ex.</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralTestsTaken"><p>Tests hechos</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralTestsTotal"><p>Tests total</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralQuarter"><p>Cuatri</p></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralActions"><p>Editar</p></div>';
                htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '<div class="planningRow">';
                    htmlSubjectTemplate += '<input id="subjGeneralId" type="text" value="'+subjId+'" style="display: none;" />';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralCode"><input class="subjEditInput" id="subjGeneralCode" type="text" value="'+userSubjects[i].subjCode+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralSubject"><input class="subjEditInput" id="subjGeneralName" type="text" value="'+userSubjects[i].subjName+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralDegree"><input class="subjEditInput" id="subjGeneralDegree" type="text" value="'+userSubjects[i].subjDegree+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralYear"><input class="subjEditInput" id="subjGeneralYear" type="text" value="'+userSubjects[i].subjYear+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralCredits"><input class="subjEditInput" id="subjGeneralCredits" type="text" value="'+userSubjects[i].subjCredits+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralStatus"><input class="subjEditInput" id="subjGeneralStatus" type="text" value="'+userSubjects[i].subjStatus+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralGradeOrd"><input class="subjEditInput" id="subjGeneralGradeOrd" type="text" value="'+userSubjects[i].subjGradeOrd+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralGradeExtra"><input class="subjEditInput" id="subjGeneralGradeExtra" type="text" value="'+userSubjects[i].subjGradeExtra+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralContEval"><input class="subjEditInput" id="subjGeneralContEval" type="text" value="'+userSubjects[i].subjContEvaluation+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamOrd"><input class="subjEditInput" id="subjGeneralExamOrd" type="text" value="'+userSubjects[i].subjExamOrd+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamExtra"><input class="subjEditInput" id="subjGeneralExamExtra" type="text" value="'+userSubjects[i].subjExamExtra+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamExtra"><input class="subjEditInput" id="subjGeneralTestsTaken" type="text" value="'+userSubjects[i].subjTestsTaken+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamExtra"><input class="subjEditInput" id="subjGeneralTestsTotal" type="text" value="'+userSubjects[i].subjTestsTotal+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralExamExtra"><input class="subjEditInput" id="subjGeneralQuarter" type="text" value="'+userSubjects[i].subjQuarter+'" /></div>';
                    htmlSubjectTemplate += '<div class="planningCell planningGeneralActions"><svg class="subjEditBtn subjGeneralUpdate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg></div>';
                htmlSubjectTemplate += '</div>';

            htmlSubjectTemplate += '</div>';
            htmlSubjectTemplate += '<div class="subjectData">';
                htmlSubjectTemplate += '<div class="subjectDataLeft">';
                    htmlSubjectTemplate += '<div class="subjectPlanning">';
                        htmlSubjectTemplate += '<p class="subjectTableTitle">Planning</p>';
                        htmlSubjectTemplate += '<div class="planningRow planningRowTitle">';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekNumber"><p>Semana</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><p>Fecha</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><p>Leccion 1</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><p>Leccion 2</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><p>Clase</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><p>Resumem</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><p>Ejerc.</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><p>Estudio</p></div>';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekEditOpt"><p>Acciones</p></div>';
                        htmlSubjectTemplate += '</div>';

                        // Agrupar semanas por order para permitir semanas con mismo orden
                        var weeksByOrder = {};
                        for (i in userWeeks) {
                            var w = userWeeks[i];
                            if (w.userId == userId && w.weekSubject == subjId) {
                                var orderKey = parseInt(w.weekOrder) || 0;
                                if (!weeksByOrder[orderKey]) weeksByOrder[orderKey] = [];
                                weeksByOrder[orderKey].push(w);
                            }
                        }

                        var orderKeysWeeks = Object.keys(weeksByOrder).map(k => parseInt(k)).sort((a,b) => a - b);

                        var countWeeks = 0;
                        for (oi in orderKeysWeeks) {
                            var ord = orderKeysWeeks[oi];
                            var arr = weeksByOrder[ord];
                            for (wi in arr) {
                                var userWeek = arr[wi];
                                countWeeks++;
                                var fecha = new Date(parseInt(userWeek.weekStartDate));
                                var hoy = new Date();

                                htmlSubjectTemplate += '<div class="planningRow planningEditRow" id="planningEditRow-'+userWeek.weekId+'">';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekNumber"><input class="subjEditInput subjEditWeekOrder" type="number" value="'+userWeek.weekOrder+'" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><input class="subjEditInput subjEditDate" type="date" value="'+fecha.getFullYear()+'-'+twoDigits(fecha.getMonth()+1)+'-'+twoDigits(fecha.getDate())+'" /></div>';

                                htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><input class="subjEditInput subjEditLesson1" type="text" value="'+userWeek.weekLesson1+'" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><input class="subjEditInput subjEditLesson2" type="text" value="'+userWeek.weekLesson2+'" /></div>';

                                if (userWeek.weekWatch) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditWatch" id="subjEditWatchCheck-'+userWeek.weekId+'" type="checkbox" checked /></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditWatch" id="subjEditWatchCheck-'+userWeek.weekId+'" type="checkbox" /></div>';
                                }

                                if (userWeek.weekSummary) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditSummary" id="subjEditSummaryCheck-'+userWeek.weekId+'" type="checkbox" checked /></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditSummary" id="subjEditSummaryCheck-'+userWeek.weekId+'" type="checkbox" /></div>';
                                }

                                if (userWeek.weekExercises) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditExercises" id="subjEditExercisesCheck-'+userWeek.weekId+'" type="checkbox" checked /></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditExercises" id="subjEditExercisesCheck-'+userWeek.weekId+'" type="checkbox" /></div>';
                                }
                                
                                if (userWeek.weekStudy) {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditStudy" id="subjEditStudyCheck-'+userWeek.weekId+'" type="checkbox" checked /></div>';
                                } else {
                                    htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox subjEditStudy" id="subjEditStudyCheck-'+userWeek.weekId+'" type="checkbox" /></div>';
                                }
                                htmlSubjectTemplate += '<div class="planningCell planningWeekEditOpt">';
                                    htmlSubjectTemplate += '<svg class="subjEditBtn subjEditUpdate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
                                    htmlSubjectTemplate += '<svg class="subjEditBtn subjEditDelete" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
                                htmlSubjectTemplate += '</div>';
                                htmlSubjectTemplate += '<input type="hidden" class="planningEditsubjId" value="'+subjId+'" />';
                            htmlSubjectTemplate += '</div>';
                            }
                        }

                        htmlSubjectTemplate += '<div class="planningRow planningRowNew" id="planningRowNew">';
                            htmlSubjectTemplate += '<div class="planningCell planningWeekNumber"><input class="subjEditInput" id="subjEditWeekOrder" type="number" placeholder="num" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekDate"><input class="subjEditInput" id="subjEditDate" type="date" placeholder="dd-mm-yyyy" /></div>';

                                htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><input class="subjEditInput" id="subjEditLesson1" type="text" placeholder="tema" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekLesson"><input class="subjEditInput" id="subjEditLesson2" type="text" placeholder="tema" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox" id="subjEditWatchCheckNew" type="checkbox" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox" id="subjEditSummaryCheckNew" type="checkbox" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox" id="subjEditExercisesCheckNew" type="checkbox" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekCheckbox"><input class="subjEditCheckbox" id="subjEditStudyCheckNew" type="checkbox" /></div>';
                                htmlSubjectTemplate += '<div class="planningCell planningWeekEditOpt">';
                                    htmlSubjectTemplate += '<svg class="subjEditBtn subjEditSave" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save-icon lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>';
                                htmlSubjectTemplate += '</div>';
                                htmlSubjectTemplate += '<input type="hidden" id="planningEditsubjId" value="'+subjId+'" />';
                        htmlSubjectTemplate += '</div>';

                    htmlSubjectTemplate += '</div>';
                htmlSubjectTemplate += '</div>';

                htmlSubjectTemplate += '<div class="subjectDataRight">';

                    var countActivities = [];
                    for (i in userActivities) {
                        if (userActivities[i].userId == userId && userActivities[i].actSubject == subjId) {
                            countActivities[userActivities[i].actOrder] = userActivities[i].actId;
                        }
                    }

                    var htmlActList = '';
                    var htmlExamList = '';
        }
    }

    $('#tabSubjEdit').append(htmlSubjectTemplate);

    $('.tabHeaderGoBack').on('click',function() {
        console.log('return to subject data');
        showTab('subject',subjId);
    });

    $('.subjEditSave').on('click',function() {
        var weekNewOrder = $('#planningRowNew').find('#subjEditWeekOrder').val();
        var weekNewDate = $('#planningRowNew').find('#subjEditDate').val();
        var weekNewLesson1 = $('#planningRowNew').find('#subjEditLesson1').val();
        var weekNewLesson2 = $('#planningRowNew').find('#subjEditLesson2').val();
        var weekNewWatch = $('#planningRowNew').find('#subjEditWatchCheckNew').is(':checked');
        var weekNewSummary = $('#planningRowNew').find('#subjEditSummaryCheckNew').is(':checked');
        var weekNewExercises = $('#planningRowNew').find('#subjEditExercisesCheckNew').is(':checked');
        var weekNewStudy = $('#planningRowNew').find('#subjEditStudyCheckNew').is(':checked');
        var weekSubjId = $('#planningEditsubjId').val();
        console.log(weekNewOrder, weekNewDate, weekNewLesson1, weekNewLesson2, weekNewWatch, weekNewSummary, weekNewExercises, weekNewStudy, weekSubjId);
        addNewWeek(weekNewOrder, weekNewDate, weekNewLesson1, weekNewLesson2, weekNewWatch, weekNewSummary, weekNewExercises, weekNewStudy, weekSubjId);
    });

    $('.subjEditUpdate').on('click',function() {
        var elemId = $(this).parents('.planningEditRow').attr('id');
        console.log($(this).parents('.planningEditRow'));
        console.log(elemId);
        console.log($('#'+elemId));
        var weekNewOrder = $('#'+elemId).find('.subjEditWeekOrder').val();
        var weekNewDate = $('#'+elemId).find('.subjEditDate').val();
        var weekNewLesson1 = $('#'+elemId).find('.subjEditLesson1').val();
        var weekNewLesson2 = $('#'+elemId).find('.subjEditLesson2').val();
        var weekNewWatch = $('#'+elemId).find('.subjEditWatch').is(':checked');
        var weekNewSummary = $('#'+elemId).find('.subjEditSummary').is(':checked');
        var weekNewExercises = $('#'+elemId).find('.subjEditExercises').is(':checked');
        var weekNewStudy = $('#'+elemId).find('.subjEditStudy').is(':checked');
        var weekSubjId = $('#'+elemId).find('.planningEditsubjId').val();
        console.log(elemId.substring(16),weekNewOrder, weekNewDate, weekNewLesson1, weekNewLesson2, weekNewWatch, weekNewSummary, weekNewExercises, weekNewStudy, weekSubjId);
        updateWeek(elemId.substring(16),weekNewOrder, weekNewDate, weekNewLesson1, weekNewLesson2, weekNewWatch, weekNewSummary, weekNewExercises, weekNewStudy, weekSubjId);
    });

    $('.subjEditDelete').on('click',function() {
        var weekId = $(this).parents('.planningEditRow').attr('id').substring(16);
        console.log(weekId);

        deleteWeek(weekId, subjId);
    });

    // actualizar los datos generales de la asignatura
    $('.subjGeneralUpdate').on('click',function() {
        var subjGeneralId = $('#subjGeneralId').val();
        var subjGeneralCode = $('#subjGeneralCode').val();
        var subjGeneralName = $('#subjGeneralName').val();
        var subjGeneralDegree = $('#subjGeneralDegree').val();
        var subjGeneralYear = $('#subjGeneralYear').val();
        var subjGeneralCredits = $('#subjGeneralCredits').val();
        var subjGeneralStatus = $('#subjGeneralStatus').val();
        var subjGeneralGradeOrd = $('#subjGeneralGradeOrd').val();
        var subjGeneralGradeExtra = $('#subjGeneralGradeExtra').val();
        var subjGeneralContEval = $('#subjGeneralContEval').val();
        var subjGeneralExamOrd = $('#subjGeneralExamOrd').val();
        var subjGeneralExamExtra = $('#subjGeneralExamExtra').val();
        var subjGeneralTestsTaken = $('#subjGeneralTestsTaken').val();
        var subjGeneralTestsTotal = $('#subjGeneralTestsTotal').val();
        var subjGeneralQuarter = $('#subjGeneralQuarter').val();

        console.log(subjGeneralId, subjGeneralCode, subjGeneralName, subjGeneralDegree, subjGeneralYear, subjGeneralCredits, subjGeneralStatus,subjGeneralGradeOrd,subjGeneralGradeExtra,subjGeneralContEval,subjGeneralExamOrd,subjGeneralExamExtra,subjGeneralTestsTaken,subjGeneralTestsTotal,subjGeneralQuarter);
        updateGeneralSubj(subjGeneralId, subjGeneralCode, subjGeneralName, subjGeneralDegree, subjGeneralYear, subjGeneralCredits, subjGeneralStatus,subjGeneralGradeOrd,subjGeneralGradeExtra,subjGeneralContEval,subjGeneralExamOrd,subjGeneralExamExtra,subjGeneralTestsTaken,subjGeneralTestsTotal,subjGeneralQuarter);
    });
}

function editSubjTemplateRight(subjId) {
    console.log('editSubjTemplateRight('+subjId+')');

    var htmlEditActivities = '';

    var activitiesByOrder = {};
    for (i in userActivities) {
        var act = userActivities[i];
        if (act.userId == userId && act.actSubject == subjId) {
            var orderKey = parseInt(act.actOrder) || 0;
            if (!activitiesByOrder[orderKey]) activitiesByOrder[orderKey] = [];
            activitiesByOrder[orderKey].push(act);
        }
    }

    var orderKeys = Object.keys(activitiesByOrder).map(k => parseInt(k)).sort((a,b) => a - b);

    var htmlActList = '';
    var htmlExamList = '';

    for (oi in orderKeys) {
        var ord = orderKeys[oi];
        var arr = activitiesByOrder[ord];
        for (ai in arr) {
            var act = arr[ai];
            var fecha = new Date(parseInt(act.actDate));
            var dateDiff = dateDifferenceDays(fecha.getTime());

            if (act.actType == 'act') {
                htmlActList += '<div class="planningRow planningEditRow" id="planningActEdit-'+act.actId+'">';
                    htmlActList += '<input class="planningActExamTime" type="hidden" value="'+act.actExamTime+'" />';
                    htmlActList += '<div class="planningCell planningWeekName"><input class="subjEditInput activityNameInput" type="text" value="'+act.actName+'" /></div>';
                    htmlActList += '<div class="planningCell planningWeekOrderMin"><input class="subjEditInput activityOrderInput" type="number" value="'+act.actOrder+'" /></div>';
                    htmlActList += '<div class="planningCell planningWeekDateMin"><input class="subjEditInput activityDateInput" id="actDate-'+act.actId+'" type="date" value="'+fecha.getFullYear()+'-'+twoDigits(fecha.getMonth()+1)+'-'+twoDigits(fecha.getDate())+'" /></div>';
                    htmlActList += '<div class="planningCell planningWeekValueMin"><input class="subjEditInput activityValueInput" type="text" value="'+act.actValue+'" /></div>';
                    htmlActList += '<div class="planningCell planningWeekCalificationMin"><input class="subjEditInput activityGradeInput" type="text" value="'+act.actCalif+'" /></div>';
                    htmlActList += '<div class="planningCell planningWeekEditOpt">';
                        htmlActList += '<svg class="subjEditBtn subjActEditUpdate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>';
                        htmlActList += '<svg class="subjEditBtn subjActEditDelete" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
                    htmlActList += '</div>';
                    htmlActList += '<input type="hidden" class="planningActEditsubjId" value="'+act.actSubject+'">';
                htmlActList += '</div>';
            } else {
                htmlExamList += '<div class="planningRow">';
                    htmlExamList += '<div class="planningCell planningWeekName"><p>'+act.actName+'</p></div>';
                    if (dateDiff < 0) {
                        htmlExamList += '<div class="planningCell planningWeekDate activityDatePast"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                    } else if (dateDiff < 7) {
                        htmlExamList += '<div class="planningCell planningWeekDate activityDateNear"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                    } else {
                        htmlExamList += '<div class="planningCell planningWeekDate activityDateAway"><p>'+twoDigits(fecha.getDate())+'-'+twoDigits(fecha.getMonth()+1)+'-'+fecha.getFullYear()+'</p></div>';
                    }
                    htmlExamList += '<div class="planningCell planningWeekValue"><p>'+act.actExamTime+'</p></div>';
                    htmlExamList += '<div class="planningCell planningWeekCalification"><p>'+act.actCalif+'</p></div>';
                htmlExamList += '</div>';
            }
        }
    }

    htmlEditActivities += '<p class="subjectTableTitle">Actividades</p>';
    htmlEditActivities += '<div class="planningRow planningRowTitle">';
        htmlEditActivities += '<div class="planningCell planningWeekName"><p>Act</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekOrderMin"><p>Ord</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekDateMin"><p>Entrega</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekValueMin"><p>Valor</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekCalificationMin"><p>Nota</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekEditOpt"><p></p></div>';
    htmlEditActivities += '</div>';
    htmlEditActivities += htmlActList;
    htmlEditActivities += '<div class="planningRow planningEditRow planningRowNew" id="planningActEditNew">';
        htmlEditActivities += '<input class="planningActExamTime" type="hidden" value="" />';
        htmlEditActivities += '<div class="planningCell planningWeekName"><input class="subjEditInput activityNameInput" type="text" placeholder="nombre" /></div>';
        htmlEditActivities += '<div class="planningCell planningWeekOrderMin"><input class="subjEditInput activityOrderInput" type="number" placeholder="n" /></div>';
        htmlEditActivities += '<div class="planningCell planningWeekDateMin"><input class="subjEditInput activityDateInput" type="date" /></div>';
        htmlEditActivities += '<div class="planningCell planningWeekValueMin"><input class="subjEditInput activityValueInput" type="text" placeholder="0.0" /></div>';
        htmlEditActivities += '<div class="planningCell planningWeekCalificationMin"><input class="subjEditInput activityGradeInput" type="text" placeholder="0.0" /></div>';
        htmlEditActivities += '<input class="planningActEditsubjId" type="hidden" value="'+subjId+'" />';
        htmlEditActivities += '<div class="planningCell planningWeekEditOpt">';
            htmlEditActivities += '<svg class="subjEditBtn subjActEditSave" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg>';
        htmlEditActivities += '</div>';
    htmlEditActivities += '</div>';

    htmlEditActivities += '<p class="subjectTableTitle">Tests</p>';
    htmlEditActivities += '<div class="planningRow planningRowTitle">';
        htmlEditActivities += '<div class="planningCell planningWeekName"><p>Hechos</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekDateMin"><p>Total</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekValueMin"><p>Valor</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekCalificationMin"><p>Nota</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekEditOpt"><p></p></div>';
    htmlEditActivities += '</div>';

    for (i in userSubjects) {
        if (userSubjects[i].subjId == subjId) {
            htmlEditActivities += '<div class="planningRow">';
                htmlEditActivities += '<div class="planningCell planningWeekName"><p>'+userSubjects[i].subjTestsTaken+'</p></div>';
                htmlEditActivities += '<div class="planningCell planningWeekDate"><p>'+userSubjects[i].subjTestsTotal+'</p></div>';
                htmlEditActivities += '<div class="planningCell planningWeekValue"><p>0.1</p></div>';
                htmlEditActivities += '<div class="planningCell planningWeekCalification"><p>0.2</p></div>';
            htmlEditActivities += '</div>';
        }
    }

    htmlEditActivities += '<p class="subjectTableTitle">Exámenes</p>';
    htmlEditActivities += '<div class="planningRow planningRowTitle">';
        htmlEditActivities += '<div class="planningCell planningWeekName"><p>Convoc.</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekOrder"><p>Ord</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekDate"><p>Fecha</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekValue"><p>Hora</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekCalification"><p>Nota</p></div>';
        htmlEditActivities += '<div class="planningCell planningWeekActions"><p>Acciones</p></div>';
    htmlEditActivities += '</div>';

    for (k in userActivities) {
        var act = userActivities[k];
        if (act && act.actType == 'exam' && String(act.actSubject) == String(subjId)) {
            var actDate = new Date(parseInt(act.actDate) || NaN);
            var actDateVal = '';
            if (!isNaN(actDate.getTime())) {
                actDateVal = actDate.getFullYear() + '-' + twoDigits(actDate.getMonth()+1) + '-' + twoDigits(actDate.getDate());
            }

            htmlEditActivities += '<div class="planningRow planningEditExam" id="planningEditExam-'+act.actId+'">';
                htmlEditActivities += '<input class="planningEditActType" type="hidden" value="'+act.actType+'" />';
                htmlEditActivities += '<input class="planningEditActValue" type="hidden" value="'+act.actValue+'" />';
                htmlEditActivities += '<input class="planningEditActSubject" type="hidden" value="'+act.actSubject+'" />';

                htmlEditActivities += '<div class="planningCell planningActName"><input class="subjEditInput" type="text" value="'+act.actName+'" /></div>';
                htmlEditActivities += '<div class="planningCell planningActOrder"><input class="subjEditInput" type="text" value="'+act.actOrder+'" /></div>';
                htmlEditActivities += '<div class="planningCell planningActDate"><input class="subjEditInput" type="date" value="'+actDateVal+'" /></div>';
                htmlEditActivities += '<div class="planningCell planningActExamTime"><input class="subjEditInput" type="text" value="'+act.actExamTime+'" /></div>';
                htmlEditActivities += '<div class="planningCell planningActCalification"><input class="subjEditInput" type="text" value="'+act.actCalif+'" /></div>';
                htmlEditActivities += '<div class="planningCell planningWeekActions">';
                    htmlEditActivities += '<svg class="subjEditBtn subjExamUpdate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>';
                    htmlEditActivities += '<svg class="subjEditBtn subjExamDelete" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
                htmlEditActivities += '</div>';
            htmlEditActivities += '</div>';
        }
    }
    htmlEditActivities += '<div class="planningRow planningRowNew" id="newExamRow">';
        htmlEditActivities += '<div class="planningCell planningActName"><input class="subjEditInput newExamName" type="text" placeholder="nombre" /></div>';
        htmlEditActivities += '<div class="planningCell planningActOrder"><input class="subjEditInput newExamOrder" type="number" placeholder="n" /></div>';
        htmlEditActivities += '<div class="planningCell planningActDate"><input class="subjEditInput newExamDate" type="date" placeholder="dd/mm/aaaa" /></div>';
        htmlEditActivities += '<div class="planningCell planningActExamTime"><input class="subjEditInput newExamTime" type="text" placeholder="hh:mm" /></div>';
        htmlEditActivities += '<div class="planningCell planningActCalification"><input class="subjEditInput newExamCalif" type="text" placeholder="0.0" /></div>';
        htmlEditActivities += '<input class="newExamSubjId" type="hidden" value="'+subjId+'" />';
        htmlEditActivities += '<div class="planningCell planningWeekActions">';
            htmlEditActivities += '<svg class="subjEditBtn subjExamSave" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path><path d="M7 3v4a1 1 0 0 0 1 1h7"></path></svg>';
        htmlEditActivities += '</div>';
    htmlEditActivities += '</div>';


    $('.subjectDataRight').html(htmlEditActivities);

    $('.subjActEditSave').on('click',function() {
        console.log('Añadir nueva actividad');
        var actNewName = $(this).parents('#planningActEditNew').find('.activityNameInput').val();
        var actNewOrder = $(this).parents('#planningActEditNew').find('.activityOrderInput').val();
        var actNewDate = $(this).parents('#planningActEditNew').find('.activityDateInput').val();
        var actNewValue = $(this).parents('#planningActEditNew').find('.activityValueInput').val();
        var actNewExamTime = '0';
        var actNewCalif = $(this).parents('#planningActEditNew').find('.activityGradeInput').val();
        var actSubjId = $(this).parents('#planningActEditNew').find('.planningActEditsubjId').val();
        var actType = 'act';

        console.log(actNewName + actNewOrder + actNewDate + actNewValue + actNewExamTime + actNewCalif + actSubjId + actType);
        addNewActivity(actNewName,actNewOrder,actNewDate,actNewValue,actNewExamTime,actNewCalif,actSubjId,actType);
    });

    $('.subjActEditUpdate').on('click',function() {
        var elemId = $(this).parents('.planningEditRow').attr('id');
        console.log($(this).parents('.planningEditRow'));
        console.log(elemId);
        console.log($('#'+elemId));
        var actNewName = $(this).parents('.planningEditRow').find('.activityNameInput').val();
        var actNewOrder = $(this).parents('.planningEditRow').find('.activityOrderInput').val();
        var actNewDate = $(this).parents('.planningEditRow').find('.activityDateInput').val();
        var actNewValue = $(this).parents('.planningEditRow').find('.activityValueInput').val();
        var actNewExamTime = $(this).parents('.planningEditRow').find('.planningActExamTime').val();
        var actNewCalif = $(this).parents('.planningEditRow').find('.activityGradeInput').val();
        var actSubjId = $(this).parents('.planningEditRow').find('.planningActEditsubjId').val();
        var actType = 'act';

        console.log(elemId.substring(16),actNewName, actNewOrder, actNewDate, actNewValue, actNewExamTime, actNewCalif, actSubjId, actType);
        updateActivity(elemId.substring(16),actNewName, actNewOrder, actNewDate, actNewValue, actNewExamTime, actNewCalif, actSubjId, actType);
    });

    $('.subjActEditDelete').on('click',function() {
        var actId = $(this).parents('.planningEditRow').attr('id').substring(16);
        console.log(actId);

        deleteActivity(actId, subjId);
    });

    $('.subjExamUpdate').on('click',function() {
        var elemId = $(this).parents('.planningEditExam').attr('id').substring(17);
        console.log(elemId);

        var actNewName = $(this).parents('.planningEditExam').find('.planningActName input').val();
        var actNewOrder = $(this).parents('.planningEditExam').find('.planningActOrder input').val();
        var actNewDate = $(this).parents('.planningEditExam').find('.planningActDate input').val();
        var actNewValue = $(this).parents('.planningEditExam').find('.planningEditActValue').val();
        var actNewExamTime = $(this).parents('.planningEditExam').find('.planningActExamTime input').val();
        var actNewCalif = $(this).parents('.planningEditExam').find('.planningActCalification input').val();
        var actSubjId = $(this).parents('.planningEditExam').find('.planningEditActSubject').val();
        var actType = 'exam';

        console.log(elemId, actNewName, actNewOrder, actNewDate, actNewValue, actNewExamTime, actNewCalif, actSubjId, actType);
        updateActivity(elemId, actNewName, actNewOrder, actNewDate, actNewValue, actNewExamTime, actNewCalif, actSubjId, actType);
    });

    $('.subjExamDelete').on('click',function() {
        var actId = $(this).parents('.planningEditExam').attr('id').substring(17);
        console.log(actId);

        deleteActivity(actId, subjId);
    });

    $('.subjExamSave').on('click',function() {
        console.log('Añadir nuevo examen');
        var actNewName = $(this).parents('#newExamRow').find('.newExamName').val();
        var actNewOrder = $(this).parents('#newExamRow').find('.newExamOrder').val();
        var actNewDate = $(this).parents('#newExamRow').find('.newExamDate').val();
        var actNewValue = '0';
        var actNewExamTime = $(this).parents('#newExamRow').find('.newExamTime').val();
        var actNewCalif = $(this).parents('#newExamRow').find('.newExamCalif').val();
        var actSubjId = $(this).parents('#newExamRow').find('.newExamSubjId').val();
        var actType = 'exam';

        console.log(actNewName+', '+actNewOrder+', '+actNewDate+', '+actNewValue+', '+actNewExamTime+', '+actNewCalif+', '+actSubjId)+', '+actType;
        addNewActivity(actNewName, actNewOrder, actNewDate, actNewValue, actNewExamTime, actNewCalif, actSubjId, actType);
    });
}

function changeSubjWeek(column,week,done) {
    console.log('changeSubjWeek('+column+', '+week+', '+done+')');

    const updateWeekDone = async () => {
        try {
            if (column == 'class') {
                const { error } = await supabasePublicClient.from('weeks')
                .update({ weekWatch: done }).eq('weekId', week);

                for (i in userWeeks) {
                    if (userWeeks[i].weekId == week) {
                        if (done==true) { userWeeks[i].weekWatch = true; }
                        else if (done==false) { userWeeks[i].weekWatch = false; }

                        showTab('subject',userWeeks[i].weekSubject);
                    }
                }

            } else if (column == 'summary') {
                const { error } = await supabasePublicClient.from('weeks')
                .update({ weekSummary: done }).eq('weekId', week);

                for (i in userWeeks) {
                    if (userWeeks[i].weekId == week) {
                        if (done==true) { userWeeks[i].weekSummary = true; }
                        else if (done==false) { userWeeks[i].weekSummary = false; }

                        showTab('subject',userWeeks[i].weekSubject);
                    }
                }

            } else if (column == 'exercises') {
                const { error } = await supabasePublicClient.from('weeks')
                .update({ weekExercises: done }).eq('weekId', week);

                for (i in userWeeks) {
                    if (userWeeks[i].weekId == week) {
                        if (done==true) { userWeeks[i].weekExercises = true; }
                        else if (done==false) { userWeeks[i].weekExercises = false; }

                        showTab('subject',userWeeks[i].weekSubject);
                    }
                }

            } else if (column == 'study') {
                const { error } = await supabasePublicClient.from('weeks')
                .update({ weekStudy: done }).eq('weekId', week);

                for (i in userWeeks) {
                    if (userWeeks[i].weekId == week) {
                        if (done==true) { userWeeks[i].weekStudy = true; }
                        else if (done==false) { userWeeks[i].weekStudy = false; }

                        showTab('subject',userWeeks[i].weekSubject);
                    }
                }
            }

        } catch (error) {
            console.log(error);
            errorReporting('error','Se ha producido un error al intentar modificar los datos de la semana');
        }
    }
    updateWeekDone();
}

function addNewWeek(newOrder, newDate, newLesson1, newLesson2, newWatch, newSummary, newExercises, newStudy, subjId) {
    console.log('addNewWeek('+newOrder+', '+newDate+', '+newLesson1+', '+newLesson2+', '+newWatch+', '+newSummary+', '+newExercises+', '+newStudy+', '+subjId+')');

    if (newOrder!='' && newDate!='' && newLesson1!='') {
        var newDateUnix = new Date(newDate.substring(5,7)+'/'+newDate.substring(8,10)+'/'+newDate.substring(0,4));
        //console.log(newDateUnix);

        const insertNewWeek = async () => {
            try {
                const { data, error } = await supabasePublicClient
                .from('weeks').insert(
                    {
                        weekStartDate: newDateUnix.getTime(),
                        weekEndDate: '',
                        weekOrder: newOrder,
                        weekLesson1: newLesson1,
                        weekLesson2: newLesson2,
                        weekWatch: newWatch,
                        weekSummary: newSummary,
                        weekExercises: newExercises,
                        weekStudy: newStudy,
                        weekSubject: subjId,
                        userId: userData.userId 
                    }
                ).select();

                //console.log(data);

                var weeksLength = userWeeks.length;
                //console.log(data[0].weekId);

                userWeeks[weeksLength] = {
                    'weekId': data[0].weekId,
                    'weekOrder': data[0].weekOrder,
                    'weekStartDate': data[0].weekStartDate,
                    'weekLesson1': data[0].weekLesson1,
                    'weekLesson2': data[0].weekLesson2,
                    'weekWatch': data[0].weekWatch,
                    'weekSummary': data[0].weekSummary,
                    'weekExercises': data[0].weekExercises,
                    'weekStudy': data[0].weekStudy,
                    'weekSubject': data[0].weekSubject,
                    'userId': data[0].userId
                };

                errorReporting('success','Se ha creado correctamente la semana');

                editSubj(subjId);

            } catch (error) {
                console.log(error);
                errorReporting('error','Se ha producido un error al intentar crear la semana');
            }
        }

        insertNewWeek();
    } else {
        errorReporting('warning','Alguno de los campos obligatorios se encuentra vacio');
    }
}

function updateWeek(weekId, newOrder, newDate, newLesson1, newLesson2, newWatch, newSummary, newExercises, newStudy, weekSubjId) {
    console.log('updateWeek('+weekId+', '+newOrder+', '+newDate+', '+newLesson1+', '+newLesson2+', '+newWatch+', '+newSummary+', '+newExercises+', '+newStudy+', '+weekSubjId+')');

    if (newOrder!='' && newDate!='' && newLesson1!='') {

        var newDateUnix = new Date(newDate.substring(5,7)+'/'+newDate.substring(8,10)+'/'+newDate.substring(0,4));
        console.log(newDateUnix);

        const updateWeeks = async () => {
            try {
                const { data, error } = await supabasePublicClient
                .from('weeks').update({
                    weekOrder: newOrder,
                    weekStartDate: newDateUnix.getTime(),
                    weekEndDate: '',
                    weekLesson1: newLesson1,
                    weekLesson2: newLesson2,
                    weekWatch: newWatch,
                    weekSummary: newSummary,
                    weekExercises: newExercises,
                    weekStudy: newStudy,
                    weekSubject: weekSubjId,
                    userId: userData.userId
                }).eq('weekId', weekId);

                for (i in userWeeks) {
                    if (userWeeks[i].weekId == weekId) {
                        userWeeks[i] = {
                            'weekId': weekId,
                            'weekOrder': newOrder,
                            'weekStartDate': newDateUnix.getTime(),
                            'weekLesson1': newLesson1,
                            'weekLesson2': newLesson2,
                            'weekWatch': newWatch,
                            'weekSummary': newSummary,
                            'weekExercises': newExercises,
                            'weekStudy': newStudy,
                            'weekSubject': weekSubjId,
                            'userId': userData.userId
                        };
                    }
                }

                errorReporting('success','Se ha actualizado correctamente la semana');

            } catch (error) {
                console.log(error);
                errorReporting('error','Se ha producido un error al intentar actualizar la semana');
            }
        }

        updateWeeks();

    } else {
        errorReporting('warning','Alguno de los campos obligatorios se encuentra vacio');
    }
}

function deleteWeek(weekId, subjId) {
    console.log('deleteWeek');

    const deleteWeek = async () => {
        try {
            const response = await supabasePublicClient.from('weeks')
            .delete().eq('weekId', weekId);

            for (i in userWeeks) {
                if (userWeeks[i].weekId == weekId) {
                    delete userWeeks[i];
                }
            }

            editSubj(subjId);
            errorReporting('success','Se ha eliminado la semana');

        } catch (error) {
            console.log(error);
            errorReporting('error','Se ha producido un error al intentar eliminar la semana');
        }
    }
    deleteWeek();
}

function updateGeneralSubj(subjGeneralId, subjGeneralCode, subjGeneralName, subjGeneralDegree, subjGeneralYear, subjGeneralCredits, subjGeneralStatus,subjGeneralGradeOrd,subjGeneralGradeExtra,subjGeneralContEval,subjGeneralExamOrd,subjGeneralExamExtra,subjGeneralTestsTaken,subjGeneralTestsTotal,subjGeneralQuarter) {
    console.log('updateGeneralSubj('+subjGeneralId+', '+subjGeneralCode+', '+subjGeneralName+', '+subjGeneralDegree+', '+subjGeneralYear+', '+subjGeneralCredits+', '+subjGeneralStatus+', '+subjGeneralGradeOrd+', '+subjGeneralGradeExtra+', '+subjGeneralContEval+', '+subjGeneralExamOrd+', '+subjGeneralExamExtra+', '+subjGeneralTestsTaken+', '+subjGeneralTestsTotal+', '+subjGeneralQuarter+')');

    if (subjGeneralCode!='' && subjGeneralName!='' && subjGeneralDegree!='') {

        const updateGeneralData = async () => {
            try {
                const { data, error } = await supabasePublicClient
                .from('subjects').update({
                    subjName: subjGeneralName,
                    subjCode: subjGeneralCode,
                    subjCredits: subjGeneralCredits,
                    subjDegree: subjGeneralDegree,
                    subjYear: subjGeneralYear,
                    subjStatus: subjGeneralStatus,
                    subjGradeOrd: subjGeneralGradeOrd,
                    subjGradeExtra: subjGeneralGradeExtra,
                    subjContEvaluation: subjGeneralContEval,
                    subjExamOrd: subjGeneralExamOrd,
                    subjExamExtra: subjGeneralExamExtra,
                    subjTestsTaken: subjGeneralTestsTaken,
                    subjTestsTotal: subjGeneralTestsTotal,
                    subjQuarter: subjGeneralQuarter,
                    userId: userData.userId
                }).eq('subjId', subjGeneralId);

                for (i in userSubjects) {
                    if (userSubjects[i].subjId == subjGeneralId) {
                        userSubjects[i] = {
                            'subjId': subjGeneralId,
                            'subjName': subjGeneralName,
                            'subjCode': subjGeneralCode,
                            'subjCredits': subjGeneralCredits,
                            'subjDegree': subjGeneralDegree,
                            'subjYear': subjGeneralYear,
                            'subjStatus': subjGeneralStatus,
                            'subjGradeOrd': subjGeneralGradeOrd,
                            'subjGradeExtra': subjGeneralGradeExtra,
                            'subjContEvaluation': subjGeneralContEval,
                            'subjExamOrd': subjGeneralExamOrd,
                            'subjExamExtra': subjGeneralExamExtra,
                            'userId': userData.userId,
                            'subjTestsTaken': subjGeneralTestsTaken,
                            'subjTestsTotal': subjGeneralTestsTotal,
                            'subjQuarter': subjGeneralQuarter,
                        };
                    }
                }

                errorReporting('success','Se han actualizado correctamente los datos de la asignatura');

                editSubj(subjGeneralId);

            } catch (error) {
                console.log(error);
                errorReporting('error','Se ha producido un error al actualizar los datos generales de la asignatura');
            }
        }

        updateGeneralData();

    } else {
        errorReporting('warning','alguno de los campos obligatorios se encuentra vacio');
    }
}

function updateActivity(actId, newName, newOrder, newDate, newValue, newExamTime, newCalif, actSubjId, newType) {
    console.log('updateActivity('+actId+', '+newName+', '+newOrder+', '+newDate+', '+newValue+', '+newExamTime+', '+newCalif+', '+actSubjId+', '+newType+')');

    if (newOrder!='' && newName!='' && newDate!='') {

        var dia = newDate.substring(8,10); var mes = newDate.substring(5,7); var anno = newDate.substring(0,4);
        var nuevaFecha = new Date(anno, mes-1, dia);
        console.log(nuevaFecha);

        const updateActivities = async () => {
            try {
                const { data, error } = await supabasePublicClient
                .from('activities').update({
                    actName: newName,
                    actOrder: parseInt(newOrder),
                    actDate: nuevaFecha.getTime(),
                    actValue: newValue,
                    actExamTime: newExamTime,
                    actCalif: newCalif,
                    actSubject: actSubjId,
                    userId: userData.userId,
                    actType: newType
                }).eq('actId', actId);

                for (i in userActivities) {
                    if (userActivities[i].actId == actId) {
                        userActivities[i] = {
                            'actId': actId,
                            'actName': newName,
                            'actOrder': parseInt(newOrder),
                            'actDate': nuevaFecha.getTime(),
                            'actValue': newValue,
                            'actExamTime': newExamTime,
                            'actCalif': newCalif,
                            'actSubject': actSubjId,
                            'userId': userData.userId,
                            'actType': newType
                        };
                    }
                }

                errorReporting('success','Se ha actualizado correctamente la actividad');

                editSubj(actSubjId);

            } catch (error) {
                console.log(error);
                errorReporting('error','Se ha producido un error al intentar actualizar la actividad');
            }
        }

        updateActivities();

    } else {
        errorReporting('warning','Alguno de los campos obligatorios se encuentra vacio');
    }
}

function deleteActivity(actId, subjId) {
    console.log('deleteActivity');

    const deleteActivity = async () => {
        try {
            const response = await supabasePublicClient.from('activities')
            .delete().eq('actId', actId);

            for (i in userActivities) {
                if (userActivities[i].actId == actId) {
                    delete userActivities[i];
                }
            }

            editSubj(subjId);
            errorReporting('success','Se ha eliminado la actividad');

        } catch (error) {
            console.log(error);
            errorReporting('error','Se ha producido un error al intentar eliminar la actividad');
        }
    }
    deleteActivity();
}

function addNewActivity(actName, actOrder, actDate, actValue, actExamTime, actCalif, subjId, actType) {
    console.log('addNewActivity('+actName+', '+actOrder+', '+actDate+', '+actValue+', '+actExamTime+', '+actCalif+', '+subjId+', '+actType+')');

    if (actName!='' && actOrder!='' && actValue!='' && actCalif!='' && subjId!='') {
        var newDateUnix = new Date(actDate.substring(5,7)+'/'+actDate.substring(8,10)+'/'+actDate.substring(0,4));
        console.log(newDateUnix);

        const insertNewActivity = async () => {
            try {
                const { data, error } = await supabasePublicClient
                .from('activities').insert(
                    {
                        actName: actName,
                        actOrder: actOrder,
                        actDate: newDateUnix.getTime(),
                        actValue: actValue,
                        actExamTime: actExamTime,
                        actCalif: actCalif,
                        actSubject: subjId,
                        userId: userData.userId,
                        actType: actType,
                    }
                ).select();

                console.log(data);

                var actLength = userActivities.length;
                console.log(data[0].actId);

                userActivities[actLength] = {
                    'actId': data[0].actId,
                    'actName': data[0].actName,
                    'actOrder': data[0].actOrder,
                    'actDate': data[0].actDate,
                    'actValue': data[0].actValue,
                    'actExamTime': data[0].actExamTime,
                    'actCalif': data[0].actCalif,
                    'actSubject': data[0].actSubject,
                    'userId': data[0].userId,
                    'actType': data[0].actType,
                };

                errorReporting('success','Se ha creado correctamente la actividad');

                editSubj(subjId);

            } catch (error) {
                console.log(error);
                errorReporting('error','Se ha producido un error al añadir una nueva actividad');
            }
        }
        insertNewActivity();
    } else {
        errorReporting('warning','Faltan por introducir algunos campos obligatorios de la actividad');
    }
}

function errorReporting(type, msg) {
	console.log('f:{errorReporting('+msg+')}');

    if (type == 'warning') {
        var typeClass = ' errorItemWarning';
    } else if (type == 'success') {
        var typeClass = ' errorItemSuccess';
    } else if (type == 'error') {
        var typeClass = ' errorItemError';
    } else {
        var typeClass = '';
    }

	var randomCode = getRandomCode(5);
	htmlError = '<div class="errorItem'+typeClass+'" id="errorItem-'+randomCode+'">';
		htmlError += '<p>'+msg+'</p>';
	htmlError += '</div>';

	$('#errorReporting').append(htmlError);
	$('#errorItem-'+randomCode).show();

	setTimeout(function() {
		$('#errorItem-'+randomCode).fadeOut(200);
		$('#errorItem-'+randomCode).remove();
	},5000);
}

/* -------- utils -------- */

function getRandomCode(length) {
	(userData.debug)?console.log('f:{getRandomCode}'):'';

	var code = '';
	for (i=0;i<length;i++) {
		code += Math.floor(Math.random() * 10);
	}
	return code;
}

function twoDigits(num) {

    if (parseInt(num)<10) {
        num = '0'+num;
    }
    return num;
}

// Función para comprobar si dos timestamps están en la misma semana
function sameWeek(unix1, unix2) {
    unix1 = unix1.toString().substring(0,10);
    unix2 = unix2.toString().substring(0,10);

    const fecha1 = moment.unix(unix1).startOf('isoWeek'); // Lunes como inicio de semana
    const fecha2 = moment.unix(unix2).startOf('isoWeek');

    const week1 = moment.unix(unix1).week();
    const week2 = moment.unix(unix2).week();

    return fecha1.isSame(fecha2);
}

function dateDifferenceDays(unix) {
  const fechaUnix = moment.unix(unix.toString().substring(0,10));
  const ahora = moment(); // Obtiene la fecha y hora actual

  // `diff` calcula la diferencia entre dos momentos.
  // El segundo argumento ('days') especifica que queremos la diferencia en días.
  const diferenciaDias = fechaUnix.diff(ahora, 'days');

  return diferenciaDias;
}

function weekOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    startOfYear.setDate(startOfYear.getDate() + (startOfYear.getDay() % 7));
    return Math.round((date - startOfYear) / (7 * 24 * 3600 * 1000));
};