$(document).ready(function () {
    var dataTbl = null;
    var mode = null;

    /**** UTILS ****/
    function setMode(tmpMode) {
        if (tmpMode == "create") {
            $(".assignment").hide();
            $(".assignment_create").show();
        } else {
            $(".assignment").show();
            $(".assignment_create").hide();
        }
        mode = tmpMode
    }

    function clearStd(obj) {
        obj.std1_grade = "";
        obj.std2_grade = "";
        obj.std3_grade = "";
    }

    function rermoveDups(responseAR, objKey) {
        var school = [];
        for (var i = 0; i < responseAR.length; i++) {
            if (jQuery.inArray(responseAR[i][objKey], school) == -1) {
                school.push(responseAR[i][objKey]);
            }
        }
        //console.log(school);
        return school;
    }

    function displayResults(responseJson, classSelOptions, classSel, option_val) {
        try {
            $(classSelOptions).remove();

            if (responseJson.status == 'error') {
                throw (responseJson.message);
            } else {
                var tmp = JSON.parse(responseJson.responseText);
                var responseAR = tmp["results"]
                var uniqueAr = rermoveDups(responseAR, option_val);
                for (var i = 0; i < uniqueAr.length; i++) {
                    var option_value = uniqueAr[i];
                    $(classSel).append('<option value =' + option_value + '>' + option_value + '</option>')
                }
            }
        } catch (err) {
            $('.results').append('<div>' + err + '</div>');
            $('.results').removeClass('hidden');
        }
    }

    function remNonKeys(obj) {
        var newObj = {};
        Object.keys(obj).forEach(function (key, index) {
            if (key == "student_name" || key.match(/std._grade/)) {
                newObj[key] = obj[key];
            }
        });
        return newObj;
    }

    function createAssignment() {
        var descr = $.trim($("#descr").val());
        assName = $(".assignment_create").val();
        cat = $(".subject option:selected").text();
        var data = {"description": descr, "assignment_name": assName, "category": cat};

        $.ajax({
            url: 'https://parseapi.back4app.com/classes/assignment',
            method: 'POST',
            async: false,
            data: data,
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (responseJson) {
                console.log("ASSIGNMENT CREATED");
            },
            error: function (responseJson) {
                console.log("ERRO CREATING ASSIGNMENT");
            }
        });
    }

    function createStudentAssignment(el) {
    if(mode == "create") {
        var assName = $(".assignment_create").val();
        var std1 = $(".Standards1 option:selected").text();
        var std2 = $(".Standards2 option:selected").text();
        var std3 = $(".Standards3 option:selected").text();
}
    else{
        var assName = $(".assignment").val();
        var std1 = $(".Standards1 option:selected").text();
        var std2 = $(".Standards2 option:selected").text();
        var std3 = $(".Standards3 option:selected").text();
    }
        var data = {
            "std1_grade": el.std1_grade,
            "std2_grade": el.std2_grade,
            "std3_grade": el.std1_grade,
            "student_name": el.student_name,
            "assignment_name": assName,
            "standard1": std1,
            "standard2": std2,
            "standard3": std3
        };
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/studentAssignment',
            method: 'POST',
            data: data,
            async: false,
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (responseJson) {
                console.log("STD ASSIGNMENT CREATED");
            },
            error: function (responseJson) {
                console.log("ERRO CREATING STD ASSIGNMENT");
            }
        });
    }

    function createStudentAssignments(arToSave) {
        arToSave.forEach(createStudentAssignment)
    }
    function reportError() {
                  $('.error').text('Uh oh, something went wrong! Heres what we know');
                }
    function saveStudentAssignment(dtAr) {
    var arToSave = dtAr.map(remNonKeys);
        if (mode == "create") {
            var assName = $(".assignment_create").val();
            if (typeof (assName) !== "undefined" && assName !== null){
             // map each elmetn of dtAr to remNonKeays - which returns
             // only student_name and std[1-3]_grade
                 createAssignment();
                 createStudentAssignments(arToSave);

            }
            else{
                reportError();
            }

        }
        else {
            createStudentAssignments(arToSave);
        }
    }

    function getStudentAssignmentFromAssn() {
        assn = $(".assignment option:selected").text();
        var filter = "?where={\"assignment_name\":\"" + assn + "\"}";
        var retAr = [];

        $.ajax({
            url: 'https://parseapi.back4app.com/classes/studentAssignment' + filter,
            async: false,
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (response) {
                var tmp = JSON.parse(response.responseText);
                var responseAr = tmp["results"];
                retAr = responseAr;
                $('.studentGrades').DataTable().destroy();
                dataTbl = $('.studentGrades').DataTable({
                    "data": responseAr,
                    columns: [
                        {"data": "student_name"},
                        {"data": "std1_grade"},
                        {"data": "std2_grade"},
                        {"data": "std3_grade"}
                    ]
                });
            },
            error: function () {
                $('#output').html('Bummer: there was an error!');
            },
        });

        return retAr;

    }

    /**** POPULATE ****/
    function populateTrimester() {
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/trimester',
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (response) {
                var classTri = '.trimester option';
                var combined = '.trimester';
                var option_value = 'trimester_name';
                displayResults(response, classTri, combined, option_value);
            },
            error: function () {
                $('#output').html('Bummer: there was an error!');
            },
        });
    }

    function populateSubject() {
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/standards',
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (responseJson) {
                var classSelOptions = '.subject option';
                var classSel = '.subject';
                var option_value = 'category';
                displayResults(responseJson, classSelOptions, classSel, option_value);
            }
        });
    }

    function populateAssignment() {
        var subject = $(".subject option:selected").text();
        var filter = "?where={\"category\":\"" + subject + "\"}";
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/assignment' + filter,
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (response) {
                var classSelOptions = '.assignment option';
                var classSel = '.assignment';
                var option_value = 'assignment_name';
                displayResults(response, classSelOptions, classSel, option_value);
            },
            error: function () {
                $('#output').html('Bummer: there was an error!');
            },
        });
    }

    function populateStandards(staEl) {
        var cat = $(".subject option:selected").text();
        var filter = "?where={\"category\":\"" + cat + "\"}";
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/standards' + filter,
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (responseJson) {
                var classSelOptions = '.Standards option';
                var classSel = '.Standards';
                var option_value = 'standard';
                displayResults(responseJson, classSelOptions, classSel, option_value);
            }
        });
        if (mode == "edit" && staEl != null) {
            if (staEl.standard1 != "" && staEl.standard2 != "" && staEl.standard3 != "") {
                $(".Standards1 option[value=" + staEl.standard1 + "]").attr('selected', 'selected');
                $(".Standards2 option[value=" + staEl.standard2 + "]").attr('selected', 'selected');
                $(".Standards3 option[value=" + staEl.standard3 + "]").attr('selected', 'selected');
            }
        }

    }

    function populateTableStudent() {
        $.ajax({
            url: 'https://parseapi.back4app.com/classes/students',
            headers: {
                'x-parse-application-id': 'KECyqtv9zlJtioKRNS3lC1g5xCohc7aQJjKPfid5',
                'x-parse-rest-api-key': 'mLcOlQqZuLvDIMjrCwgb4P3r4glKLA07lquq0M6H'
            },
            complete: function (response) {
                var tmp = JSON.parse(response.responseText);
                var responseAr = tmp["results"];
                var newResp = responseAr.map(clearStd);
                $('.studentGrades').DataTable().destroy();
                dataTbl = $('.studentGrades').DataTable({
                    "data": responseAr,
                    columns: [
                        {"data": "student_name"},
                        {"data": "std1_grade"},
                        {"data": "std2_grade"},
                        {"data": "std3_grade"}
                    ]
                });
            },
            error: function () {
                $('#output').html('Bummer: there was an error!');
            },
        });
    }

    function populateTableStudentAssignment(staAr) {
        $('.studentGrades').DataTable().destroy();
        dataTbl = $('.studentGrades').DataTable({
            "data": staAr,
            columns: [
                {"data": "student_name"},
                {"data": "std1_grade"},
                {"data": "std2_grade"},
                {"data": "std3_grade"}
            ]
        });
    }

    /**** HANDLERS ****/
    $("#create").click(function () {
        setupCreate("create");
    });
    $("#edit").click(function () {
        setupEdit();
    });
    $("#saveit").click(function () {
        var dtAr = dataTbl.rows().data().toArray();
        saveStudentAssignment(dtAr);
    });
    $("#datepicker").datepicker();
    $(".subject").change(function () {
        populateStandards();
        populateAssignment();
    });
    $('.assignment').change(function () {
        var staAr = getStudentAssignmentFromAssn();
        populateStandards(staAr[0]);
        populateTableStudentAssignment(staAr);
        if (typeof staAr != undefined && staAr[0].duedate != "" && typeof staAr[0].duedate != undefined) {
            $('#datepicker').datepicker('setDate', staAr[0].duedate);
        }
    });

    /**** DRIVERS ****/
    function setupCreate() {
        populateTrimester();
        setMode("create");
        populateSubject();
        populateAssignment();
        populateStandards();
        populateTableStudent();
        $('#datepicker').datepicker('setDate', null);
    }

    function setupEdit() {
        setMode("edit");
        updateStudentAssignments();
    }

    /**** MAIN ****/
    setupCreate();

});

