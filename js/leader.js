$(function() {
    // function for the Users table ajax call

    function getUsers() {
        $.ajax({
            url: "http://localhost:5000/myusers",
            success: function(data) {
                $('#users').dataTable({
                    "bJQueryUI": true,
                    "aaData": data,
                    "bDestroy": true,
                    "aoColumns": [{
                        "mData": "userID"
                    }, {
                        "mData": "fname"
                    }, {
                        "mData": "lname"
                    }, {
                        "mData": "address"
                    }, {
                        "mData": "city"
                    }, {
                        "mData": "state"
                    }, {
                        "mData": "email"
                    }, {
                        "mData": "marital"
                    }, {
                        "mData": "gender"
                    }, {
                        "mData": "birthdate"
                    }, {
                        "mData": "groupName"
                    }]
                });
            },
            xhrFields: {
                withCredentials: true
            }
        });
    }

    function getEvents() {
        $.ajax({
            url: "http://localhost:5000/events",
            success: function(data) {
                $('#events').dataTable({
                    "bJQueryUI": true,
                    "aaData": data,
                    "bDestroy": true,
                    "bLengthChange": false,
                    "aoColumns": [{
                        "mData": "eventname"
                    }, {
                        "mData": "type"
                    }, {
                        "mData": "date"
                    }, {
                        "mData": "eventID"
                    }]
                });
                $('#events').find('tr').each(function() {
                    var idElement = $(this).find('td').last();
                    idElement.wrapInner('<a href class="eventID"></a>');
                });
                var eventID;
                $('a.eventID').click(function(e) {
                    e.preventDefault();
                    var title = $(this).parents('tr').find('td').first().html(),
                        date = $(this).parents('tr').find('td').eq(2).html();
                    eventID = $(this).parents('tr').find('td').last().find('a').html();
                    $('#attendance').css('width', '100%');
                    $.ajax({
                        url: "http://localhost:5000/users/event/" + this.innerHTML,
                        success: function(data) {
                            $('.eventTable').hide();
                            $('#attendance').dataTable({
                                "bJQueryUI": true,
                                "aaData": data,
                                "bDestroy": true,
                                "bLengthChange": false,
                                "aoColumns": [{
                                    "mData": "userID"
                                }, {
                                    "mData": "name"
                                }, {
                                    "mData": "present"
                                }]
                            });
                            $('.attendanceTable .subtitle').html('Attendance - ' + title + ' - ' + date);
                            $('.attendanceTable').show();
                            $('#attendance').css('width', '100%');
                            var presentElement;
                            $('#attendance').find('tr').each(function() {
                                var presentElement = $(this).find('td').last();
                                presentElement.wrapInner('<a href class="present"></a>');
                            });
                            $('a.present').click(function(e) {
                                e.preventDefault();
                                var userID = $(this).parents('tr').find('td').first().html();
                                presentElement = $(this);
                                $.ajax({
                                    url: "http://localhost:5000/attendance/" + userID + "/" + eventID,
                                    type: "POST",
                                    success: function(data) {
                                        if (presentElement.text() == 'false') {
                                            presentElement.text('true');
                                        } else {
                                            presentElement.text('false')
                                        }
                                    },
                                    error: function(data) {
                                        alert(data);
                                    },
                                    xhrFields: {
                                        withCredentials: true
                                    }
                                });
                            })
                            $('#back').click(function() {
                                $('.attendanceTable').hide();
                                $('.eventTable').show();
                            })
                        },
                        error: function(data) {
                            alert(data);
                        },
                        xhrFields: {
                            withCredentials: true
                        }
                    });
                })
            },
            error: function(data) {
                alert(data);
            },
            xhrFields: {
                withCredentials: true
            }
        });
    }

    function initAssign() {
        $("#membername").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "http://localhost:5000/myusers",
                    type: "GET",
                    success: function(data) {
                        response($.map(data, function(el) {
                            return {
                                label: el.fname + " " + el.lname,
                                value: el.userID
                            };
                        }));
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            focus: function(event, ui) {
                this.value = ui.item.label;
                event.preventDefault();
            },
            select: function(event, ui) {
                // Prevent value from being put in the input:
                this.value = ui.item.label;
                // Set the next input's value to the "value" of the item.
                $(this).next("input").val(ui.item.value);
                $("#membername").autocomplete("close");
                event.preventDefault();
            },
            change: function(event, ui) {
                if (!ui.item) {
                    $("#membername").val("");
                }
            },
            minLength: 0
        });
        $('#membername').click(function() {
            $('#membername').autocomplete("search", "");
        });
        $("#groupname").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "http://localhost:5000/groups",
                    type: "GET",
                    success: function(data) {
                        response($.map(data, function(el) {
                            return {
                                label: el.groupname,
                                value: el.groupID
                            };
                        }));
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            focus: function(event, ui) {
                this.value = ui.item.label;
                event.preventDefault();
            },
            select: function(event, ui) {
                // Prevent value from being put in the input:
                this.value = ui.item.label;
                // Set the next input's value to the "value" of the item.
                $(this).next("input").val(ui.item.value);
                $("#groupname").autocomplete("close");
                event.preventDefault();
            },
            change: function(event, ui) {
                if (!ui.item) {
                    $("#membername").val("");
                }
            },
            minLength: 0
        });
        $('#groupname').click(function() {
            $('#groupname').autocomplete("search", "");
        });
    }

    function initUnassigned() {
        $("#membername").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "http://localhost:5000/users/group/1",
                    type: "GET",
                    success: function(data) {
                        response($.map(data, function(el) {
                            return {
                                label: el.fname + " " + el.lname,
                                value: el.userID
                            };
                        }));
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            focus: function(event, ui) {
                this.value = ui.item.label;
                event.preventDefault();
            },
            select: function(event, ui) {
                // Prevent value from being put in the input:
                this.value = ui.item.label;
                // Set the next input's value to the "value" of the item.
                $(this).next("input").val(ui.item.value);
                $("#membername").autocomplete("close");
                event.preventDefault();
            },
            change: function(event, ui) {
                if (!ui.item) {
                    $("#membername").val("");
                }
            },
            minLength: 0
        });
        $('#membername').click(function() {
            $('#membername').autocomplete("search", "");
        });
        $("#groupname").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "http://localhost:5000/groups",
                    type: "GET",
                    success: function(data) {
                        response($.map(data, function(el) {
                            if (el.groupID != 1) {
                                return {
                                    label: el.groupname,
                                    value: el.groupID
                                };
                            }
                        }));
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            focus: function(event, ui) {
                this.value = ui.item.label;
                event.preventDefault();
            },
            select: function(event, ui) {
                // Prevent value from being put in the input:
                this.value = ui.item.label;
                // Set the next input's value to the "value" of the item.
                $(this).next("input").val(ui.item.value);
                $("#groupname").autocomplete("close");
                event.preventDefault();
            },
            change: function(event, ui) {
                if (!ui.item) {
                    $("#membername").val("");
                }
            },
            minLength: 0
        });
        $('#groupname').click(function() {
            $('#groupname').autocomplete("search", "");
        });
    }

    function initGroup() {
        $("#leadername").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "http://localhost:5000/nonleaders",
                    type: "GET",
                    success: function(data) {
                        response($.map(data, function(el) {
                            return {
                                label: el.fname + " " + el.lname,
                                value: el.userID
                            };
                        }));
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            focus: function(event, ui) {
                this.value = ui.item.label;
                event.preventDefault();
            },
            select: function(event, ui) {
                // Prevent value from being put in the input:
                this.value = ui.item.label;
                // Set the next input's value to the "value" of the item.
                $(this).next("input").val(ui.item.value);
                $("#leadername").autocomplete("close");
                event.preventDefault();
            },
            change: function(event, ui) {
                if (!ui.item) {
                    $("#membername").val("");
                }
            },
            minLength: 0
        });
        $('#leadername').click(function() {
            $('#leadername').autocomplete("search", "");
        });
    }
    $("#tabs").tabs({
        create: function(event, ui) {
            getUsers();
        },
        beforeActivate: function(event, ui) {
            if (ui.newTab.find('a').is('#membersTab')) {
                getUsers();
            } else if (ui.newTab.find('a').is('#attendanceTab')) {
                getEvents();
            } else if (ui.newTab.find('a').is('#assignTab')) {
                initAssign();
            } else if (ui.newTab.find('a').is('#createGroupTab')) {
                initGroup();
            }
        }
    });
    $("#datepicker").datepicker();
    $('#eventForm').validate({
        rules: {
            eventname: {
                required: true
            },
            eventdate: {
                required: true,
                date: true
            },
            eventtype: {
                required: true
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: "POST",
                url: "http://localhost:5000/event",
                data: $(form).serialize(),
                success: function(data) {
                    $('form').find("input[type=text]").val("");
                    $('#typeselect').val($('#typeselect').prop('defaultSelected'));
                    $('#eventSuccessMessage').show().delay(1000).fadeOut("slow");
                },
                error: function(data) {
                    alert(data);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        }
    });
    var assignValidator = $('#assignForm').validate({
        rules: {
            membername: {
                required: true
            },
            groupname: {
                required: true
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: "POST",
                url: "http://localhost:5000/assignuser",
                data: $(form).serialize(),
                success: function(data) {
                    $('form').find("input[type=text]").val("");
                    $('#assignSuccessMessage').show().delay(1000).fadeOut("slow");
                },
                error: function(data) {
                    alert(data);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        }
    });
    $('#groupForm').validate({
        rules: {
            groupname: {
                required: true
            },
            leadername: {
                required: true
            }
        },
        submitHandler: function(form) {
            $.ajax({
                type: "POST",
                url: "http://localhost:5000/group",
                data: $(form).serialize(),
                success: function(data) {
                    $('form').find("input[type=text]").val("");
                    $('#groupSuccessMessage').show().delay(1000).fadeOut("slow");
                },
                error: function(data) {
                    debugger;
                    alert(data);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        }
    });
    $('#checkbox').click(function() {
        assignValidator.resetForm();
        $('#assignForm').find("input[type=text]").val("");
        if (this.checked) { //unassigned;
            initUnassigned();
        } else {
            initAssign();
        }
    });
});