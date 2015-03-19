<?php
/******************************************************
Author		:	Arunkumar Chakaravarthy
Date Created:   03-01-2014
Description :	This page is used to store the register user 
				details in to database.
*******************************************************/
require_once("config/header.php"); // Common header file included
require_once("config/config.php"); // Common functions class file included
require_once("config/dbconnect.php");  // DB connection class file included
require_once("config/commonfunctions.php"); // Common functions class file included

$commonfunction = new commonfunctions();  
$userDetailArr = $commonfunction->checkpostdata($_POST);  // This function used to trim and addslashes of the post Data
$logininfoData = array(
    'UserId' => '',
    'Email' => $userDetailArr['EMAIL'],
	'Password' => $userDetailArr['PASSWD1'],
);
$userId = $database->insert('logininfo', $logininfoData);  // insert function called to insert data into logininfo table.


$now = date("Y-m-d H:i:s"); 
$memberinfoData = array(
    'UserId' => $userId,
    'Name' => $userDetailArr['NAME'],
	'Age' => $userDetailArr['AGE'],
	'Gender' => $G_GENDERARRAY[$userDetailArr['GENDER']],
	'LanguageSpeak' => $userDetailArr['MOTHERTONGUE'],
	'CountryLivingIn' => $userDetailArr['COUNTRY'],
	'MobileNo' => $userDetailArr['MOBILENO'],
	'LastLoginAt' => $now,
	'DateCreated' => $now,
	'DateUpdated' => $now,
);

$database->insert('memberdetailinfo', $memberinfoData);  // insert function called to insert data into memberdetailinfo table.

if($userId > 0) { 
		////echo $G_REGSUCCESSTEXT;
		
		//Building Array of registerd member detail to display
		$whereCond = "UserId = '".$userId."'";
		$displayArr = $database->select('memberdetailinfo','*',$whereCond,'');
		$displayArrTemp = array_change_key_case($displayArr[0],CASE_UPPER);
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
}	
else
{
		echo "There is some problem in the server, please try again later";
}
?>
		
	
		