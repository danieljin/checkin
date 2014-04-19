$(function() {
    $.ajax({
        url: "http://localhost:5000/isloggedin",
        success: function(res) {
            if (res == "Logged in.") {
                $.ajax({
                    url: "http://localhost:5000/user",
                    success: function(data) {
                        var name = data.fname + " " + data.lname;
                        var groupname = data.groupName;
                        $.ajax({
                            url: "http://localhost:5000/isleader",
                            success: function(data) {
                                if (data[0]) {
                                    $('.nav').html('<a href="index.html">Home</a><a href="leader.html">Leader Portal</a><a href="member.html">Member Portal</a><a id="logout">Logout</a><div class="user">' + name + ' - ' + groupname + '</div>');
                                } else {
                                    $('.nav').html('<a href="index.html">Home</a><a href="member.html">Member Portal</a><a id="logout">Logout</a><div class="user">' + name + ' - ' + groupname + '</div>');
                                }
                                $('a#logout').click(function() {
                                    $.ajax({
                                        url: "http://localhost:5000/logout",
                                        success: function(data) {
                                            window.location = ('index.html');
                                        },
                                        error: function(data) {
                                            alert(data);
                                        },
                                        xhrFields: {
                                            withCredentials: true
                                        }
                                    });
                                });
                            },
                            error: function(data) {
                                alert(data.responseText);
                            },
                            xhrFields: {
                                withCredentials: true
                            }
                        });
                    },
                    error: function(data) {
                        alert(data.responseText);
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            } else {
                if (window.location.pathname != '/index.html' && window.location.pathname != '/signin.html' && window.location.pathname != '/register.html') {
                    window.location = 'signin.html';
                }
                $('.nav').html('<a href="index.html">Home</a><a href="signin.html">Sign in</a><a href="register.html">Register</a>');
            }
        },
        error: function(res) {
            $('.nav').html('<a href="index.html">Home</a><a href="signin.html">Sign in</a><a href="register.html">Register</a>');
        },
        xhrFields: {
            withCredentials: true
        }
    });
    $('#signinForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: "http://localhost:5000/login",
            data: $('#signinForm').serialize(),
            success: function(data) {
                $.ajax({
                    url: "http://localhost:5000/isleader",
                    success: function(data) {
                        if (data[0]) {
                            window.location = 'leader.html';
                        } else {
                            window.location = 'member.html';
                        }
                    },
                    error: function(data) {
                        $('#errorMessage').text(data.responseText);
                    },
                    xhrFields: {
                        withCredentials: true
                    }
                });
            },
            error: function(data) {
                $('#errorMessage').text(data.responseText);
            },
            xhrFields: {
                withCredentials: true
            }
        });
    });
});