<?php
/******************************************************
Author		:	Arunkumar Chakaravarthy
Date Created:   03-01-2014
Description :	This page used to show the search result.
*******************************************************/
error_reporting(0);
require_once("config/header.php"); // Common header file included
require_once("config/config.php"); // Common functions class file included
require_once("config/dbconnect.php");  // DB connection class file included
require_once("config/commonfunctions.php"); // Common functions class file included

		
	//Showing latest 20 results from the database
	$whereCond = "UserId > '1'";
	$displayArr = $database->select('memberdetailinfo','*',$whereCond,'', $limit = 20, $desc = true, 0);
	
	$i = 0;
	foreach($displayArr as $keyArr => $valArr) {	
		$displayArrTemp = array_change_key_case($displayArr[$i],CASE_UPPER);
		$domainIdArr = array('USERIDPREFIX' => $G_USERIDPREFIXTEXT);
		$displayArrTemplate1 = array_merge($displayArrTemp, $domainIdArr);
		
		foreach($displayArrTemplate1 as $dispkey => $dispvalue) {
			if($dispkey == 'LANGUAGESPEAK')		{
				$displayArrTemplate[$dispkey] = ($G_LANGUAGESPEAKARRAY[$dispvalue] ? $G_LANGUAGESPEAKARRAY[$dispvalue] : '-');
			}
			elseif($dispkey == 'COUNTRYLIVINGIN') {
				$displayArrTemplate[$dispkey] = ($G_COUNTRYLIVINGARRAY[$dispvalue] ? $G_COUNTRYLIVINGARRAY[$dispvalue] : '-');
			}
			else {
				$displayArrTemplate[$dispkey] = $dispvalue;
			}
		}
	
		$T = new Template();
		$memberTemplate = '';
		$memberTemplate = file_get_contents('config/displayTemplate.html');
		$memberdislayDetails = $T->render($displayArrTemplate, $memberTemplate);
		echo $memberdislayDetails;
		$i++;
	}
?>
