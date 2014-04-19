checkin
=======

Check in website built with node.js/express and mssql. 

I wanted wanted to create my own API to serve data. To do so I used node.js and express to process the routes and a MSSQL database for the storage. I ended up using eight different npm modules to help process all the information. 

Heroku was a great option for running my server. It was free and quick to start.

Frontend-wise I used a few plugins to help add logic to the site. I used jquery, jquery-ui, datatables, css-toggle-switch, jquery.validate and google fonts.

There are two types of users, Leaders and Members. A leader is also a member.

Leaders have ownership of groups. These groups contain members. Leaders can create events, create groups, and assign members to groups. They can only manage users in their own group or in the Unassigned group. Also, they check users into events. 

Members have limited functionality. They can join events and view their own past attendance.

The idea behind this was that at certain function, like classrooms, where the same person is always overlooking their group, it would be good to mange their attendance in a quick and useful manner.

My site is up at http://danielkjin.com/Checkin
