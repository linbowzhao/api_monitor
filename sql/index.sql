drop database if exists api_monitor;

create database api_monitor;

use api_monitor;


-- create table user
-- (
--  userId int unsigned primary key not null auto_increment,
--  name varchar(50) not null
--  );

 create table user
(
 userId int unsigned primary key not null auto_increment,
 nickName varchar(10) not null,
 openId varchar(30) unique key not null,
 gender int null,
 province varchar(20) null,
 country varchar(20) null,
 city varchar(20) null,
 avatarUrl varchar(100) not null,
 loginTime datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
 day datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
 )COLLATE utf8_general_ci;

 create table task
(
 taskId int unsigned primary key not null auto_increment,
 hospitalId int not null,
 departmentId int not null,
 targetDay date not null,
 currentTimes int not null default 0,
 allTimes int not null,
 frequency int,
 phone varchar(11),
 email varchar(50),
 openId varchar(30) not null,
 day datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
 )COLLATE utf8_general_ci;
