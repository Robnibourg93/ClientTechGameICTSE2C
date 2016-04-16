$(window).on('load', function () {
    $("#title").fadeIn(1000, function () {
    });
    $("#fadeBox").fadeIn(2000, function () {

    });
});

$('#testingTableButtonIn').click(function () {
    $('#fadeBox').fadeOut('slow', function () {
        $("#testingTable").fadeIn('slow', function () {
        });
    });
});

$('#testingTableButtonOut').click(function () {
    $('#testingTable').fadeOut('slow', function () {
        $("#fadeBox").fadeIn('slow', function () {
        });
    });
});


$('#joinGameButton').click(function () {
    $('#fadeBox').fadeOut(2000, function () {
        startSplash();
    });
});
