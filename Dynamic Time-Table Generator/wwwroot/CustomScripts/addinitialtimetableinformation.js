var Subjects = [];
var totalHours;

$(document).ready(function () {
    GetSubject()
});

function SaveSubjectHours(totalWeeklyHours) {
    var subjectHoursList = [];
    var isValid = true;
    var assignedTotal = 0;

    $('#thisForm2')
        .find('input[type="number"]')
        .each(function () {
            var subjectName = $(this).attr('name');
            var value = $(this).val().trim();
            var errorLabel = $(`#error-${subjectName}`);
            errorLabel.hide().text('');

            if (
                value === '' ||
                isNaN(value) ||
                !Number.isInteger(Number(value)) ||
                Number(value) < 0
            ) {
                errorLabel.text("Please enter a non-negative whole number.").show();
                isValid = false;
            } else {
                var parsedValue = parseInt(value);
                assignedTotal += parsedValue;

                subjectHoursList.push({
                    subjectName: subjectName,
                    subjectHours: parsedValue
                });
            }
        });

    if (!isValid) return;
    if (assignedTotal !== totalHours) {
        alert(`Assigned total hours (${assignedTotal}) must equal Total Weekly Hours (${totalHours}).`);
        return;
    }
    $.ajax({
        url: 'TimeTableCreator/CreateTable',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(subjectHoursList),
        success: function (data) {
            $('#AssignHoursToSubjectForm').modal('hide');
            alert("Subject hours submitted successfully!");
            renderTimeTable(data);
        },
        error: function () {
            alert("Submission failed.");
        }
    });
}
function showToast(message, type = 'info') {
    $.toast({
        text: message,
        position: 'top-right',
        icon: type, // 'success', 'error', 'info', 'warning'
        loaderBg: '#9EC600',
        hideAfter: 3000,
        stack: 5
    });
}
function renderTimeTable(perDayTimeTable) {
    debugger;
    var daysCount = perDayTimeTable.length;
    var maxSubjects = 0;


    perDayTimeTable.forEach(day => {
        if (day.subjectName.length > maxSubjects) {
            maxSubjects = day.subjectName.length;
        }
    });

    var thead = '<thead><tr>';
    for (var d = 1; d <= daysCount; d++) {
        thead += `<th style="border: 1px solid black;">Day ${d}</th>`;
    }
    thead += '</tr></thead>';

    var tbody = '<tbody>';
    for (var row = 0; row < maxSubjects; row++) {
        tbody += '<tr>';
        for (var col = 0; col < daysCount; col++) {
            var subject = perDayTimeTable[col].subjectName[row] || '';
            tbody += `<td style="border: 1px solid black;">${subject}</td>`;
        }
        tbody += '</tr>';
    }
    tbody += '</tbody>';
    $('#dynamicTimeTable').html(`<table style="border-collapse: collapse; width: 100%; text-align: center;">${thead}${tbody}</table>`);
    //$('#dynamicTimeTable').html('<h1>sandip</h1>');
}
    
function SaveInitialTableInformation() {
    $('#errorWorkingDays').text('');
    $('#errorNoOfSubjectDayWise').text('');
    $('#errorTotalSubjects').text('');

    var workingDays = $('#WrokingDays').val();
    var noOfSubjectDayWise = $('#noOfSubjectDayWise').val();
    var totalSubjects = $('#totalSubjects').val();

    var isValid = true;

    if (!workingDays || workingDays === "---Select Days---" || isNaN(workingDays) || +workingDays <= 0) {
        $('#errorWorkingDays').text('Please select valid working days.');
        isValid = false;
    }

    if (!noOfSubjectDayWise || isNaN(noOfSubjectDayWise) || +noOfSubjectDayWise <= 0) {
        $('#errorNoOfSubjectDayWise').text('Please select valid number of subjects per day.');
        isValid = false;
    }
    debugger
    if (!totalSubjects || isNaN(totalSubjects) || +totalSubjects <= 0) {
        $('#errorTotalSubjects').text('Please enter a valid total subjects number.');
        isValid = false;
    }
    if (Subjects && Subjects.length < +totalSubjects) {
        $('#errorTotalSubjects').text('Total subjects exceed available subjects.');
        isValid = false;
    }
    if (workingDays && noOfSubjectDayWise) {
        if (((workingDays * noOfSubjectDayWise) < totalSubjects)) {
            $('#errorTotalSubjects').text('Total subjects cannot exceed working days × subjects per day.');
            isValid = false;
        }
    }

    if (!isValid) {
        return; 
    }

    var formData = {
        workingDays: workingDays,
        noOfSubjectDayWise: noOfSubjectDayWise,
        totalSubjects: totalSubjects
    };
    $.ajax({
        url: 'TimeTableCreator/GetTotalHoursForWeek',
        type: 'POST',
        data: formData,
        success: function (data) {
            $('#AddInitalValues').modal('hide');
            console.log(data.hours);
            totalHours = data.hours;
            AddHoursInputs(data.subject, data.hours);
        }
    });
}

//function UpdateSubjectAfterSelection() {
//    var value;
//    debugger
//    //$.ajax({
//    //    url: 'TimeTableCreator/GetAfterSelectionOfSubject',
//    //    type: 'GET',
//    //    success: function (data) {
//    //        value = data;
//    //        Subjects = data;
//    //    },
//    //    error: function () {
//    //        alert("sasasasasasasa");
//    //    }
//    //});
//    $.ajax({
//        url: 'TimeTableCreator/GetAfterSelectionOfSubject',
//        type: 'GET',
//        success: function (data) {
//            value = data;
//            Subjects = data;
//        },
//        error: function () {
//            alert("An error occurred while getting subjects.");
//        }
//    });
//}
function AddHoursInputs(subjects, totalweeklyHours) {
    debugger
    var form = $('#thisForm2');
    form.empty();
    $('#AssignHoursToSubjectForm').modal('show');

    subjects.forEach(function (subject, index) {
        var inputHtml = `
    <div class="mb-3">
        <label for="${subject.subjectName}" class="form-label">${subject.subjectName} Hours</label>
        <input type="number" class="form-control" id="${subject.subjectName}" name="${subject.subjectName}" min="0" placeholder="Enter hours" />
        <label class="text-danger error-label" style="display:none;" id="error-${subject.subjectName}"></label>
    </div>
`;
        form.append(inputHtml);
    });

    var totalHtml = `
    <div class="mb-3">
        <label class="form-label">Total Weekly Hours : ${totalweeklyHours}</label>
    </div>
`;
    form.append(totalHtml);
}

function GetSubject() {
    debugger; 
    $.ajax({
        url: 'TimeTableCreator/GetSubject',
        type: 'GET',
        success: function (data) {
            Subjects = data;
        }
    });
}

function OpenInitialInformation() {
    $('#subjectCount').text('Total Subject is: ' + Subjects.length)
    $('#errorWorkingDays, #errorNoOfSubjectDayWise, #errorTotalSubjects').text('').show();
    $('#thisForm')[0].reset(); 
    GetSubject();
    $('#AddInitalValues').modal('show');

    $('#WrokingDays').empty().append('<option>---Select Days---</option>');
    $('#noOfSubjectDayWise').empty().append('<option>---Select Subjects---</option>');
    $('#noOfSubjectDayWise').append('<option value="' + 1 + '">' + 1 + '</option>');

    for (let i = 1; i <= 7; i++) {
        $('#WrokingDays').append('<option value="' + i + '">' + i + '</option>');
        $('#noOfSubjectDayWise').append('<option value="' + (i+1) + '">' + (i+1) + '</option>');
    }

}